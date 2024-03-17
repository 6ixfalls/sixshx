import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { File as ResourceFile, Resource } from "@prisma/client";
import { env } from '~/env';

export const s3 = new S3Client({
    forcePathStyle: false,
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
        accessKeyId: env.S3_ACCESSKEY,
        secretAccessKey: env.S3_SECRETKEY,
    },
});

type ResourceWithFile = Resource & { file: ResourceFile | null };

export async function uploadFile(resource: ResourceWithFile, file: File) {
    if (!resource.file) throw new Error("Resource has no file");
    const uploadCommand = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: resource.id + "." + resource.file.extension,
        Body: file.stream(),
        ContentLength: file.size,
        ContentType: resource.file.mimetype,
    });

    try {
        await s3.send(uploadCommand);
    } catch (err) {
        console.log("Error uploading file to S3:", err);
        throw err;
    }
}

export async function deleteFile(resource: ResourceWithFile) {
    if (!resource.file) throw new Error("Resource has no file");
    const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: resource.id + "." + resource.file.extension,
    });

    try {
        await s3.send(deleteCommand);
    } catch (err) {
        console.log("Error deleting file from S3:", err);
        throw err;
    }
}