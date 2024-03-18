"use client";

import { Avatar as AvatarComponent, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "~/components/ui/dropdown-menu";
import { useHotkeys } from "react-hotkeys-hook";
import { redirect } from "next/navigation";
import Link from "next/link";

export function Avatar({ name, image }: { name: string; image: string }) {
  useHotkeys("shift+command+q, ctrl+shift+q", () => void signOut());
  useHotkeys("command+s, ctrl+s", () => redirect("/admin/settings"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AvatarComponent className="flex cursor-pointer items-center justify-center text-center">
          <AvatarImage src={image} alt={`@${name}`} />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </AvatarComponent>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {name}
          <span className="block font-normal text-zinc-400">Administrator</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/admin/settings">
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
