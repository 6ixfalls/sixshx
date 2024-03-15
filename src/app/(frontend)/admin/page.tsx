import {
  ArchiveIcon,
  EyeOpenIcon,
  FileIcon,
  Link2Icon,
} from "@radix-ui/react-icons";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function Page() {
  const session = await getServerSession(authOptions);

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
              <div className="text-2xl font-bold">2.4K</div>
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
              <div className="text-2xl font-bold">142 GB</div>
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
              <div className="text-2xl font-bold">924</div>
              <p className="text-xs text-muted-foreground">links</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">596.2K</div>
              <p className="text-xs text-muted-foreground">link views</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
