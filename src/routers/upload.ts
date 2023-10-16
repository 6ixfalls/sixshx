import { Response, Router } from "express";
import auth from "../middleware/auth";
import prisma from "../database";
import type { ShareXRequest } from "../types";
import multer from "multer";
import { text, zerowidth, emoji } from "../charset";
import Vibrant from "node-vibrant";
import { uploadFile } from "../storage";
import logger from "../logger";
import {
    ColorResolvable,
    DiscordAPIError,
    MessageEmbed,
    TextChannel,
} from "discord.js";
import Bot from "../bot";
import config from "../config";

enum SLUG_TYPE {
    TEXT = "text",
    EMOJI = "emoji",
    ZEROWIDTH = "zerowidth",
}

const client = Bot.getInstance().getClient();

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

async function generateSlug(
    type: SLUG_TYPE,
    length = 12,
    count = 0
): Promise<string | undefined> {
    const charSet =
        type === SLUG_TYPE.ZEROWIDTH
            ? zerowidth
            : type === SLUG_TYPE.EMOJI
            ? emoji
            : text;

    for (var i = 0, slug = ""; i < length; i++)
        slug += charSet[Math.floor(Math.random() * charSet.length)];

    if (type !== SLUG_TYPE.TEXT) slug = encodeURIComponent(slug);

    logger.info(`Generated slug ${count}: ${slug}`);

    const sameSlug = await prisma.file.findUnique({
        where: { slug: slug },
    });

    if (count > 25) return;

    if (sameSlug && sameSlug.slug === slug) {
        logger.info(`Slug ${slug} already exists on file ${sameSlug.id}`);
        return generateSlug(type, length, count + 1);
    }

    logger.info(`Slug was available to use (${slug})`);

    return slug;
}

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

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat(
        (bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals)
    )
        .toString()
        .concat(` ${sizes[i]}`);
}

router.post(
    "/upload",
    auth,
    upload.single("file"),
    async (req: ShareXRequest, res: Response) => {
        if (!req.file)
            return res.status(400).json({ error: "No file provided." });

        const { mimetype, buffer, originalname, size } = req.file;

        logger.info(
            `Uploading file: ${originalname} (${mimetype}, ${formatBytes(
                size
            )}) (uploaded by ${req.user?.username})`
        );

        let slug;

        try {
            slug = await generateSlug(
                (req.header("X-Generator") as SLUG_TYPE) || SLUG_TYPE.TEXT
            );
        } catch (e) {
            logger.error(e);
            return res.status(500).json({ error: "Failed to generate slug." });
        }

        if (!slug) {
            logger.error("Failed to generate a unique slug.");
            return res
                .status(500)
                .json({ error: "Failed to generate a unique slug." });
        }

        const extension = originalname.split(".").pop() || "";

        let dominant;
        if (mimetype.startsWith("image/")) {
            try {
                const palette = await Vibrant.from(buffer).getPalette();
                dominant =
                    (palette.Vibrant && palette.Vibrant.hex) ||
                    getRandomColor();
            } catch (e) {
                dominant = getRandomColor();
            }
        } else {
            dominant = getRandomColor();
        }

        logger.info(`Pushing file to database`);

        let file;
        try {
            file = await prisma.file.create({
                data: {
                    mimetype,
                    extension,
                    originalName: originalname,
                    slug,
                    vibrant: dominant,
                    size,
                    opengraphAuthor: req.header("X-OG-Author") || "",
                    opengraphProvider: req.header("X-OG-Provider") || "",
                    //@ts-ignore
                    uid: req.user.id,
                    timezone: req.header("X-TimeOffset"),
                },
            });
        } catch (e) {
            logger.error("Couldn't create file: " + e);
            return res.status(500).json({ error: "Failed to create file." });
        }

        try {
            await uploadFile(req.file, file);
        } catch (e) {
            await prisma.file.delete({
                where: { id: file.id },
            });
            return res
                .status(500)
                .json({ error: "Failed to upload file to storage." });
        }

        res.status(200).json({
            url: `${config.domain.from}/${decodeURIComponent(file.slug)}`,
            delete: `${config.domain.from}/${decodeURIComponent(
                file.slug
            )}/delete/${file.deleteToken}`,
        });

        logger.info(
            `File uploaded: ${file.originalName} [${file.id}] (${
                file.mimetype
            }, ${formatBytes(file.size)}) (uploaded by ${req.user?.username})`
        );

        let embed = new MessageEmbed()
            .setColor(dominant as ColorResolvable)
            .setTitle(
                `${file.originalName} (${file.mimetype}, ${formatBytes(
                    file.size
                )})`
            )
            .setURL(`${config.domain.from}/${decodeURIComponent(file.slug)}`)
            .setAuthor({ name: req.user?.username || "" })
            .setDescription(
                "**Size:** `" +
                    formatBytes(file.size) +
                    `\`\n**[Delete](${config.domain.from}/${decodeURIComponent(
                        file.slug
                    )}/delete/${file.deleteToken})**`
            )
            .setThumbnail(`${config.s3.accessUrl}${file.id}.${file.extension}`)
            .setTimestamp(file.createdAt);

        (
            client.channels.cache.get(config.discord.logChannel) as TextChannel
        ).send({ embeds: [embed] });
    }
);

export default router;
