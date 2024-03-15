"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { Avatar } from "./avatar";

export async function User() {
  const session = await getServerSession(authOptions);

  return (
    session && (
      <div>
        <Avatar name={session.user.name!} image={session.user.image!} />
      </div>
    )
  );
}
