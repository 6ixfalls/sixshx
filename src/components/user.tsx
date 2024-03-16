"use server";

import { getServerAuthSession } from "~/server/auth";
import { Avatar } from "./avatar";

export async function User() {
  const session = await getServerAuthSession();

  return (
    session && (
      <div>
        <Avatar name={session.user.name!} image={session.user.image!} />
      </div>
    )
  );
}
