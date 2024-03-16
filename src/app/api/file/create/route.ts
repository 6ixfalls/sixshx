import type { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { zfd } from "zod-form-data";
import mime from "mime";
import { formatBytes } from "~/lib/resource";

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

    const mimetype = mime.getType(file.name);
    console.log(`Uploading file: ${file.name} (${mimetype}, ${formatBytes(file.size)}) (uploaded by ${user.name})`)
}
