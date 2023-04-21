import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogInIcon, TrashIcon } from "lucide-react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { JwtPayload, decode } from "jsonwebtoken";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import useSWR from "swr";

export function Navbar() {
    const { data, mutate } = useSWR("/api/validate", (...args) =>
        fetch(...args).then(async (res) => {
            return {
                ...(await res.json()),
                userToken: getCookie("userToken", {
                    sameSite: "lax",
                    secure: true,
                }),
            };
        })
    );

    const [open, setOpen] = React.useState(false);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        const formData = new FormData(event.currentTarget);
        const token = formData.get("userToken");
        if (token === "") {
            deleteCookie("userToken", { sameSite: "lax", secure: true });
        } else {
            setCookie("userToken", token, { sameSite: "lax", secure: true });
        }

        const decoded = decode(token as string) as JwtPayload;
        mutate({ ...decoded, userToken: token });
    };

    return (
        <NavigationMenu className="p-2 px-4 border-b justify-between">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                        >
                            Home
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/gallery" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                        >
                            Gallery
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {data && data.username ? (
                        <Button
                            variant="ghost"
                            className="self-end flex justify-center items-center gap-3 mx-2"
                        >
                            <Avatar>
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <span>{data.username}</span>
                        </Button>
                    ) : (
                        <Button variant="outline">
                            <LogInIcon className="mr-2 h-4 w-4" /> Login
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form
                        onSubmit={(event) => {
                            setOpen(false);
                            event.preventDefault();
                            handleSubmit(event);
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Edit token</DialogTitle>
                            <DialogDescription>
                                Make changes to your authentication token.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="userToken"
                                    className="text-right"
                                >
                                    Token
                                </Label>
                                <Input
                                    id="userToken"
                                    name="userToken"
                                    type="password"
                                    defaultValue={data ? data.userToken : ""}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </NavigationMenu>
    );
}
