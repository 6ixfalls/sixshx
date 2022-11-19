import { NextFunction, Response, Router } from "express";
import type { ShareXRequest } from "../types";
import { DateTime } from "luxon";
import prisma from "../database";
import { deleteFile } from "../storage";
import logger from "../logger";
import { MessageEmbed, ColorResolvable, TextChannel } from "discord.js";
import Bot from "../bot";
import config from "../config";
import { RateLimiterMemory } from "rate-limiter-flexible";

const client = Bot.getInstance().getClient();

const router = Router();

const applyTemplate = (string: string, values: { [key: string]: string }) => {
    let returnText = "";

    let fragments = string.split("[");

    returnText += fragments[0];

    for (let i = 1; i < fragments.length; i++) {
        let fragmentSections = fragments[i].split("]");
        returnText += values[fragmentSections[0]];
        returnText += fragmentSections[1];
    }

    return returnText;
};

function formatTimestamp(date: Date, timeoffset: string) {
    return DateTime.fromJSDate(date)
        .setZone(timeoffset)
        .toLocaleString(DateTime.DATETIME_MED);
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat(
        (bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals)
    )
        .toString()
        .concat(` ${sizes[i]}`);
}

router.param(
    "slug",
    async (req: ShareXRequest, res: Response, next: NextFunction) => {
        const slugString = encodeURIComponent(req.params.slug);

        let file;
        try {
            file = await prisma.file.findUnique({
                where: { slug: slugString },
            });
        } catch (error) {
            logger.error("Error finding file by slug: " + error);
            return res.status(500).json({ error: "Internal database error" });
        }

        if (file) {
            req.requestFile = file;
            next();
        } else {
            res.status(404).send("File not found.");
        }
    }
);

const rateLimiter = new RateLimiterMemory({
    points: Number(config.rateLimit.points),
    duration: Number(config.rateLimit.duration),
});

const rateLimiterMiddleware = (
    req: ShareXRequest,
    res: Response,
    next: NextFunction
) => {
    rateLimiter
        .consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send("Too Many Requests");
        });
};

router.get(
    "/:slug",
    rateLimiterMiddleware,
    async (req: ShareXRequest, res: Response) => {
        if (!req.requestFile) return res.status(404).send("File not found.");

        const slug = decodeURIComponent(req.requestFile.slug);
        const ogTags = [];

        if (req.requestFile.mimetype.split("/")[0] === "image") {
            ogTags.push(
                `<meta name="twitter:card" content="summary_large_image">`
            );
        } else if (req.requestFile.mimetype.split("/")[0] === "video") {
            ogTags.push(
                `<meta name="twitter:card" content="player">`,
                `<meta name="twitter:player:width" content="720">`,
                `<meta name="twitter:player:height" content="480">`,
                `<meta name="twitter:player:stream" content="${config.s3.accessUrl}${req.requestFile.id}.${req.requestFile.extension}">`,
                `<meta name="twitter:player:stream:content_type" content="${req.requestFile.mimetype}">`,
                `<meta property="og:url" content="${config.s3.accessUrl}${req.requestFile.id}.${req.requestFile.extension}">`,
                `<meta property="og:video" content="${config.s3.accessUrl}${req.requestFile.id}.${req.requestFile.extension}">`,
                `<meta property="og:video:secure_url" content="${config.s3.accessUrl}${req.requestFile.id}.${req.requestFile.extension}">`,
                `<meta property="og:video:type" content="${req.requestFile.mimetype}">`,
                `<meta name="og:video:width" content="720">`,
                `<meta name="og:video:height" content="480">`
            );
        }
        ogTags.push(
            `<meta name="theme-color" content="${req.requestFile.vibrant}">`
        );

        const mime = req.requestFile.mimetype.split("/")[0];

        res.render("preview", {
            title: req.requestFile.originalName,
            color: req.requestFile.vibrant,
            discordUrl: `${config.s3.accessUrl}${req.requestFile.id}.${req.requestFile.extension}`,
            oembedUrl: `${config.domain.from}/${slug}/oembed`,
            ogType:
                mime === "video"
                    ? "video.other"
                    : mime === "image"
                    ? "image"
                    : "website",
            urlType: `og:${
                mime === "video"
                    ? "video"
                    : mime === "audio"
                    ? "audio"
                    : "image"
            }`,
            opengraph: ogTags.join("\n"),
        });
    }
);

router.get("/:slug/oembed", async (req: ShareXRequest, res: Response) => {
    if (!req.requestFile) return res.status(404).send("File not found.");

    const mime = req.requestFile.mimetype.split("/")[0];

    const templateValues = {
        size: formatBytes(req.requestFile.size),
        filename: req.requestFile.originalName,
        timestamp: formatTimestamp(
            req.requestFile.createdAt,
            req.requestFile.timezone
        ),
    };

    res.json({
        version: "1.0",
        ogType:
            mime === "video" ? "video" : mime === "image" ? "photo" : "link",
        author_name: applyTemplate(
            req.requestFile.opengraphAuthor,
            templateValues
        ),
        provider_name: applyTemplate(
            req.requestFile.opengraphProvider,
            templateValues
        ),
    });
});

router.get(
    "/:slug/delete/:deleteId",
    async (req: ShareXRequest, res: Response) => {
        if (!req.requestFile) return res.status(404).send("File not found.");

        const deleteId = req.params.deleteId;

        if (deleteId === req.requestFile.deleteToken) {
            logger.info(
                `Deleting file ${req.requestFile.originalName} [${req.requestFile.id}]`
            );
            try {
                await prisma.file.delete({
                    where: { id: req.requestFile.id },
                });

                await deleteFile(
                    req.requestFile.id + "." + req.requestFile.extension
                );
            } catch (e) {
                res.status(500).send("Failed to delete file.");
            }

            res.redirect("/");
            logger.info(
                `Deleted file ${req.requestFile.originalName} [${req.requestFile.id}]`
            );

            let embed = new MessageEmbed()
                .setColor(req.requestFile.vibrant as ColorResolvable)
                .setTitle(
                    `${req.requestFile.originalName} (${
                        req.requestFile.mimetype
                    }, ${formatBytes(req.requestFile.size)})`
                )
                .setDescription(`File deleted from \`${req.ip}\``)
                .setTimestamp();

            (
                client.channels.cache.get(
                    config.discord.logChannel
                ) as TextChannel
            ).send({ embeds: [embed] });
        }
    }
);

export default router;
