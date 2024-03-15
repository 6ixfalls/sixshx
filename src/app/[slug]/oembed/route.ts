import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { applyTemplate, formatBytes, formatTimestamp } from "~/lib/resource";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    const resource = await db.resource.findUnique({
        where: { slug: params.slug },
        include: { file: true },
    });

    if (!resource || !resource.file) {
        return new Response("Not found", { status: 404 });
    }

    const file = resource.file;

    const values = {
        size: formatBytes(file.size),
        filename: file.originalName,
        timestamp: formatTimestamp(resource.createdAt, resource.timezone),
    };

    return Response.json({
        version: "1.0",
        ogType: file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("image") ? "photo" : "link",
        author_name: applyTemplate(file.opengraphAuthor, values),
        provider_name: applyTemplate(file.opengraphProvider, values),
    })
}
