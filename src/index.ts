import express from "express";
import helmet from "helmet";
import fs from "fs";
import * as eta from "eta";
import logger from "./logger";
import Bot from "./bot";
import prisma from "./database";
import config from "./config";

const app = express();
const client = Bot.getInstance();

app.enable("case sensitive routing");
app.disable("x-powered-by");
app.engine("eta", eta.renderFile);
app.set("view engine", "eta");
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "img-src": ["'self'", "data:", "s3.sixfalls.me"],
            },
        },
    })
);

const routerFiles = fs
    .readdirSync("./routers")
    .filter((file) => file.endsWith(".js"));

for (const file of routerFiles) {
    const router = require(`./routers/${file}`).default;
    app.use(router);
}

app.get("*", (req, res) => {
    res.redirect("https://sixfalls.me/");
});

app.listen(config.domain.port, () => {
    logger.info(
        `Server listening at 0.0.0.0:${config.domain.port} (${config.domain.from})`
    );
});

prisma.$connect().then(async () => {
    logger.info(`Connected to database through prisma`);
});
