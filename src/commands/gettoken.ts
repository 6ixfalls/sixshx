import {
    CommandInteraction,
    Client,
    ApplicationCommandOptionData,
} from "discord.js";
import { Command } from "../Command";
import prisma from "../database";
import jwt from "jsonwebtoken";
import config from "../config";

export default {
    name: "gettoken",
    description: "Retrieves the token for a user.",
    type: "CHAT_INPUT",
    options: [
        {
            type: "STRING",
            name: "username",
            description: "The username of the user to retrieve the token from.",
            required: true,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const foundUser = await prisma.user.findUnique({
            where: {
                username: interaction.options.getString("username", true),
            },
        });

        if (foundUser) {
            interaction.reply({
                content: `Auth token for user ${foundUser.username}: \`${foundUser.token}\``,
                ephemeral: true,
            });
        } else {
            interaction.reply({
                content: `That user doesn't exist!`,
                ephemeral: true,
            });
        }
    },
};
