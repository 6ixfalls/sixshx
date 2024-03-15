"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "~/server/db";
import Head from "next/head";
import { env } from "~/env";
import { useEffect, useState } from "react";
import type { File } from "@prisma/client";

export default async function ResourceView({
  params,
}: {
  params: { slug: string };
}) {
  const resource = await db.resource.findUnique({
    where: { slug: params.slug },
    include: { file: true, link: true, createdBy: true },
  });

  if (!resource) {
    notFound();
  }

  // resource views
  void db.resource.update({
    where: { slug: params.slug },
    data: { views: { increment: 1 } },
  });

  const [file] = useState<File | null>(resource.file);

  useEffect(() => {
    if (file) {
      if (
        !file.mimetype.startsWith("image") &&
        !file.mimetype.startsWith("video") &&
        !file.mimetype.startsWith("audio")
      ) {
        redirect(`${env.S3_ACCESSURL}${resource.id}.${file.extension}`);
      }
    }
  }, [file, resource.id]);

  if (resource.link) {
    redirect(resource.link.url);
  } else if (file) {
    return (
      <>
        <Head>
          <meta property="og:title" content={file.originalName} />
          <meta property="theme-color" content={file.vibrant} />
          {file.mimetype.startsWith("image") && (
            <>
              <meta property="og:type" content="image" />
              <meta
                property="og:image"
                itemProp="image"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta property="twitter:card" content="summary_large_image" />
              <meta
                property="twitter:image"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta property="twitter:title" content={file.originalName} />
            </>
          )}
          {file.mimetype.startsWith("video") && (
            <>
              <meta name="twitter:card" content="player" />
              <meta
                name="twitter:player"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                name="twitter:player:stream"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                name="twitter:player:stream:content_type"
                content={file.mimetype}
              />
              <meta name="twitter:title" content={file.originalName} />

              <meta property="og:type" content={"video.other"} />
              <meta
                property="og:url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:video"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:video:url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:video:secure_url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta property="og:video:type" content={file.mimetype} />
            </>
          )}
          {file.mimetype.startsWith("audio") && (
            <>
              <meta name="twitter:card" content="player" />
              <meta
                name="twitter:player"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                name="twitter:player:stream"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                name="twitter:player:stream:content_type"
                content={file.mimetype}
              />
              <meta name="twitter:title" content={file.originalName} />
              <meta name="twitter:player:width" content="720" />
              <meta name="twitter:player:height" content="480" />

              <meta property="og:type" content="music.song" />
              <meta
                property="og:url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:audio"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta
                property="og:audio:secure_url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
              <meta property="og:audio:type" content={file.mimetype} />
            </>
          )}
          {!file.mimetype.startsWith("video") &&
            !file.mimetype.startsWith("image") && (
              <meta
                property="og:url"
                content={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
            )}
          <title>{file.originalName}</title>
        </Head>
        <body className="m-0 flex h-full bg-[#0e0e0e]">
          {(file.mimetype.startsWith("video") ||
            file.mimetype.startsWith("audio")) && (
            <video
              className="absolute bottom-0 left-0 right-0 top-0 m-auto max-h-full max-w-full object-contain"
              controls
              autoPlay
              crossOrigin="anonymous"
            >
              <source
                src={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              />
            </video>
          )}
          {file.mimetype.startsWith("image") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${env.S3_ACCESSURL}${resource.id}.${file.extension}`}
              className="m-auto block select-none bg-[hsl(0,0%,90%)] transition-colors duration-300"
              crossOrigin="anonymous"
              alt={file.originalName}
            />
          )}
        </body>
      </>
    );
  }
}
