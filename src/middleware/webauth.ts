import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database";
import { ShareXRequest } from "../types";
import config from "../config";

export default async (
    req: ShareXRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.userToken;

    if (!token) {
        return res.status(401).json({
            error: "No token provided.",
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        if (typeof decoded !== "object")
            return res
                .status(401)
                .json({ error: "Invalid token, regenerate it!" });

        const user = await prisma.user.findUnique({
            where: { username: decoded.username },
        });

        if (!user) return res.status(401).json({ error: "Invalid token." });

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid token.",
        });
    }
};
