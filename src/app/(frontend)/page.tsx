"use server";

import { redirect } from "next/navigation";
import { env } from "~/env";

export default async function Page() {
  if (env.NODE_ENV !== "production") {
    redirect("/admin");
  } else {
    redirect("//sixfal.ls/");
  }
}
