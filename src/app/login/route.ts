import { NextResponse, type NextRequest } from "next/server";
import { getCsrfToken } from "next-auth/react";
import { env } from "~/env";

const DEFAULT_PROVIDER = "discord";

/**
 * This hash function relies on Edge Runtime.
 * Importing node.js crypto module will throw an error.
 */
async function hash(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(req: NextRequest) {
    const host = env.NEXTAUTH_URL;

    const isSecure = host.startsWith("https://");
    const cookieName = isSecure ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token";

    const cookieCsrfToken = req.cookies.get(cookieName)?.value;
    const csrfToken =
        cookieCsrfToken?.split("|")?.[0] ?? (await getCsrfToken()) ?? "";
    const csrfTokenHash =
        cookieCsrfToken?.split("|")?.[1] ??
        (await hash(`${csrfToken}${env.NEXTAUTH_SECRET}`));
    const cookie = `${csrfToken}|${csrfTokenHash}`;

    const res = await fetch(`${host}/api/auth/signin/${DEFAULT_PROVIDER}`, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Auth-Return-Redirect": "1",
            cookie: `${cookieName}=${cookie}`,
        },
        credentials: "include",
        redirect: "follow",
        body: new URLSearchParams({
            csrfToken,
            callbackUrl: req.nextUrl.searchParams.get("callbackUrl") ?? "/admin",
            json: "true",
        }),
    });
    const data = (await res.json()) as { url: string };

    return NextResponse.redirect(data.url, {
        headers: {
            "Set-Cookie": res.headers.get("set-cookie") ?? "",
        },
    });
}