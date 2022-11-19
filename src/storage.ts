import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { File } from "@prisma/client";
import logger from "./logger";
import config from "./config";

const s3 = new S3Client({
    forcePathStyle: false,
    endpoint: config.s3.endpoint,
    credentials: {
        secretAccessKey: config.s3.secretKey,
        accessKeyId: config.s3.accessKey,
    },
    region: "us-east-1",
});

export async function uploadFile(file: Express.Multer.File, fileData: File) {
    const uploadCommand = new PutObjectCommand({
        Bucket: config.s3.bucket,
        Body: file.buffer,
        Key: fileData.id + "." + fileData.extension,
        ContentLength: file.size,
        ContentType: file.mimetype,
    });

    try {
        await s3.send(uploadCommand);
    } catch (e) {
        logger.error("Failed to upload file to S3: " + e);
        throw e;
    }
}

export async function deleteFile(key: string) {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
    });

    try {
        await s3.send(deleteCommand);
    } catch (e) {
        logger.error("Failed to delete file from S3: " + e);
        throw e;
    }
}
