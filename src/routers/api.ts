import { Response, Router } from "express";
import auth from "../middleware/webauth";
import prisma from "../database";
import logger from "../logger";
import config from "../config";
import { ShareXRequest } from "../types";
import { formatBytes } from "./upload";

const router = Router();

router.get("/api/validate", auth, async (req: ShareXRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized." });

    res.json({ id: req.user.id, username: req.user.username });
});

router.get("/api/stats", auth, async (req: ShareXRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized." });

    const files = await prisma.file.count({
        where: {
            uid: req.user.id,
        },
    });
    const storage = await prisma.file.aggregate({
        where: {
            uid: req.user.id,
        },
        _sum: {
            size: true,
        },
    });

    res.json({
        files,
        storage: formatBytes(storage._sum.size || 0),
    });
});

router.get(
    "/api/files/list",
    auth,
    async (req: ShareXRequest, res: Response) => {
        if (!req.user) return res.status(401).json({ error: "Unauthorized." });

        res.send(
            await prisma.file.findMany({
                where: {
                    uid: req.user.id,
                },
                select: {
                    id: true,
                    extension: true,
                    originalName: true,
                    slug: true,
                    deleteToken: true,
                    mimetype: true,
                    size: true,
                    createdAt: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
                skip: req.query.skip ? parseInt(req.query.skip as string) : 0,
                take: req.query.take ? parseInt(req.query.take as string) : 10,
                orderBy: {
                    createdAt: "desc",
                },
            })
        );
    }
);

export default router;
