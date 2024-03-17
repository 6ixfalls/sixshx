import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { zfd } from "zod-form-data";
import mime from "mime";
import Vibrant from "node-vibrant";
import { formatBytes } from "~/lib/resource";
import { generateSlug } from "~/lib/generateSlug";
import { uploadFile } from "~/lib/storage";

function hslToHex(h: number, s: number, l: number) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0"); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function getRandomColor() {
    return hslToHex(
        Math.random() * 360,
        25 + 70 * Math.random(),
        85 + 10 * Math.random()
    );
}

const uploadSchema = zfd.formData({
    file: zfd.file(),
});

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
        return new Response("No API key provided", { status: 401 });
    }

    const user = await db.user.findUnique({
        where: {
            apiKey
        }
    });
    if (!user) {
        return new Response("Invalid API key", { status: 401 });
    }

    const { file } = uploadSchema.parse(await req.formData());
    if (!file) {
        return new Response("No file found", { status: 400 });
    }

    const mimetype = mime.getType(file.name) ?? "application/octet-stream";
    console.log(`Uploading file: ${file.name} (${mimetype}, ${formatBytes(file.size)}) (uploaded by ${user.name})`);

    const slug = await generateSlug().catch((err) => {
        console.error(`Error generating slug: ${err}`);
        return undefined;
    });

    if (!slug) {
        return new Response("Error generating slug", { status: 500 });
    }

    const extension = file.name.split(".").pop() ?? "";
    let dominant: string;
    if (mimetype?.startsWith("image/")) {
        try {
            const palette = await Vibrant.from(Buffer.from(await file.arrayBuffer())).getPalette();
            dominant = (palette.Vibrant?.hex) ?? getRandomColor();
        } catch (err) {
            console.error(`Error getting palette`);
            dominant = getRandomColor();
        }
    } else {
        dominant = getRandomColor();
    }

    console.log("Pushing file to database");
    const resource = await db.resource.create({
        data: {
            slug,
            domainHost: "sixfal.ls",
            timezone: req.headers.get("X-TimeOffset") ?? undefined,
            createdById: user.id,
            file: {
                create: {
                    mimetype,
                    extension,
                    originalName: file.name,
                    vibrant: dominant,
                    size: file.size,
                    opengraphAuthor: req.headers.get("X-OG-Author") ?? "",
                    opengraphProvider: req.headers.get("X-OG-Provider") ?? "",
                }
            }
        },
        include: {
            file: true
        }
    }).catch(e => {
        console.error(e);
        return undefined;
    });

    if (!resource) {
        return new Response("Error creating resource", { status: 500 });
    }

    try {
        await uploadFile(resource, file);
    } catch (err) {
        await db.resource.delete({
            where: { id: resource.id }
        });
        return new Response("Error uploading file", { status: 500 });
    };

    return Response.json({
        url: `https://${resource.domainHost}/${resource.slug}`,
        delete: `https://${resource.domainHost}/${resource.slug}/delete/${resource.deleteToken}`
    });
}
