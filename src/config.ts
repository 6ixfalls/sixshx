interface Config {
    [key: string]: {
        [key: string]: string;
    };
}

export default {
    domain: {
        from: process.env.DOMAIN_FROM,
        port: process.env.DOMAIN_PORT,
    },
    s3: {
        accessUrl: process.env.S3_ACCESSURL,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        accessKey: process.env.S3_ACCESSKEY,
        secretKey: process.env.S3_SECRETKEY,
    },
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENTID,
        guildId: process.env.DISCORD_GUILDID,
        logChannel: process.env.DISCORD_LOGCHANNEL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    rateLimit: {
        points: process.env.RATELIMIT_POINTS,
        duration: process.env.RATELIMIT_DURATION,
    },
} as Config;
