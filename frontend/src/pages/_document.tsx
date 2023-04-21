import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Html, Head, Main, NextScript } from "next/document";
import { Navbar } from "@/components/menu";

export default function Document() {
    return (
        <Html lang="en" className="dark">
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
