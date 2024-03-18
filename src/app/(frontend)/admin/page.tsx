"use server";
import {
  ArchiveIcon,
  EyeOpenIcon,
  FileIcon,
  Link2Icon,
} from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatBytes, formatNumber } from "~/lib/resource";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) return;
  const files = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      _count: {
        select: {
          resources: {
            where: {
              file: {
                isNot: null,
              },
            },
          },
        },
      },
    },
  });
  if (!files) return;
  const filesSize = await db.$queryRaw<[{ total_file_size: number }]>`
    SELECT SUM(f.size) AS total_file_size
    FROM "resources" r
    LEFT JOIN "files" f ON r."slug" = f."slug"
    WHERE r."createdById" = ${session.user.id}
    AND NOT EXISTS (
      SELECT 1 
      FROM "Link" l
      WHERE l."slug" = r."slug"
    );
  `;
  const links = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      _count: {
        select: {
          resources: {
            where: {
              link: {
                isNot: null,
              },
            },
          },
        },
      },
    },
  });
  if (!links) return;
  const views = await db.resource.aggregate({
    where: {
      createdById: session.user.id,
    },
    _sum: {
      views: true,
    },
  });

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">
        Welcome back, {session?.user.name}
      </h1>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File Count</CardTitle>
              <FileIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(files._count.resources)}
              </div>
              <p className="text-xs text-muted-foreground">files uploaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Storage Used
              </CardTitle>
              <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(Number(filesSize?.[0]?.total_file_size ?? 0))}
              </div>
              <p className="text-xs text-muted-foreground">storage used</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Links Created
              </CardTitle>
              <Link2Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(links._count.resources)}
              </div>
              <p className="text-xs text-muted-foreground">links</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(views._sum.views ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">link views</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
