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
    name: "adduser",
    description: "Adds a user to the host.",
    type: "CHAT_INPUT",
    options: [
        {
            type: "STRING",
            name: "username",
            description: "The username of the user to add.",
            required: true,
        },
    ],
    defaultMemberPermissions: ["ADMINISTRATOR"],
    run: async (client: Client, interaction: CommandInteraction) => {
        const user = await prisma.user.create({
            data: {
                username: interaction.options.getString("username", true),
                token: jwt.sign(
                    {
                        username: interaction.options.getString(
                            "username",
                            true
                        ),
                    },
                    config.jwt.secret
                ),
            },
        });

        interaction.reply({
            content: `Created user ${user.username} with ID ${user.id}! Auth token: \`${user.token}\``,
            ephemeral: true,
        });
    },
};
