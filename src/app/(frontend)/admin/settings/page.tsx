"use server";
import { Label } from "~/components/ui/label";
import { TextRevealCard } from "~/components/ui/text-reveal";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function Page() {
  const user = await getServerAuthSession();
  if (!user) return;
  const userData = await db.user.findUnique({
    where: {
      id: user.user.id,
    },
  });
  if (!userData) return;

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">Settings</h1>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="apikey">API Key</Label>
        <div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
          <TextRevealCard
            text="Hover to reveal"
            revealText={userData.apiKey!}
          />
        </div>
      </div>
    </div>
  );
}
