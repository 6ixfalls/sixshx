"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { EnterIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react";

export function Navbar() {
  const loggedIn = false;

  return (
    <NavigationMenu className="max-w-none justify-between border-b p-2 px-4">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/admin" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/admin/gallery" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Gallery
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      {loggedIn ? (
        <></>
      ) : (
        <Button variant="outline" onClick={() => signIn("discord")}>
          <EnterIcon className="mr-2 h-4 w-4" /> Login
        </Button>
      )}
    </NavigationMenu>
  );
}
