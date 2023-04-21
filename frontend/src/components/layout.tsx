import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "./menu";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <Toaster />
            <Navbar />
            <main>{children}</main>
        </>
    );
}
