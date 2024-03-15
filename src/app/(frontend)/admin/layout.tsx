"use server";

import { type PropsWithChildren } from "react";
import { Navbar } from "~/components/navbar";
import { User } from "~/components/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function App({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container min-h-screen w-screen">
      <Navbar>
        <User />
      </Navbar>
      {children}
    </main>
  );
}
