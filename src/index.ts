import express from "express";
import fs from "fs";
import logger from "./logger";
import Bot from "./bot";
import prisma from "./database";

const config = require("../config.json");

const app = express();
const client = Bot.getInstance();

app.enable("case sensitive routing");
app.disable("x-powered-by");
app.set("view engine", "pug");

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
