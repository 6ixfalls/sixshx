import { File, User } from "@prisma/client";
import { Client } from "discord.js";
import { Request, Response } from "express";
import { Jwt, JwtPayload } from "jsonwebtoken";

declare module "discord.js" {
    export interface Client extends Client {
        commands: Collection<unknown, any>;
    }
}

interface ShareXRequest extends Request {
    user?: User;
    requestFile?: File;
}
