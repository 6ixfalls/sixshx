import { Client, Collection, Intents } from "discord.js";
import fs from "fs";
import logger from "./logger";
import config from "./config";

export default class Bot {
    private static instance: Bot;
    private client: Client;

    private constructor() {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });

        this.client.commands = new Collection();
        const commandFiles = fs
            .readdirSync("./commands")
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`).default;
            this.client.commands.set(command.name, command);
        }

        this.client.once("ready", async () => {
            if (!this.client.user || !this.client.application) {
                return;
            }

            await this.client.application.commands.set(
                Array.from(this.client.commands.values())
            );

            logger.info(`Logged in to discord as ${this.client.user.tag}`);
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isCommand()) return;

            const command = this.client.commands.get(interaction.commandName);

            if (!command) {
                interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
                return;
            }

            try {
                await command.run(this.client, interaction);
            } catch (error) {
                logger.error(error);
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        });

        this.client.login(config.discord.token);
    }

    public static getInstance() {
        if (!Bot.instance) {
            Bot.instance = new Bot();
        }

        return Bot.instance;
    }

    public getClient() {
        return this.client;
    }
}
