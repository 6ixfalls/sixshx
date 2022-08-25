import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database";
import { ShareXRequest } from "../types";

const config = require("../../config.json");

export default async (
    req: ShareXRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            error: "No token provided.",
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);

        const user = await prisma.user.findUnique({
            where: { token: token },
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
