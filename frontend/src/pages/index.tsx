import Image from "next/image";
import { Activity, File, Users, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import useSWR from "swr";

export default function Home() {
    const { data } = useSWR("/api/stats", (...args) =>
        fetch(...args).then((res) => res.json())
    );

    return (
        <>
            <div className="flex flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        File Count
                                    </CardTitle>
                                    <File className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {data?.files}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        files uploaded
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Storage Used
                                    </CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {data?.storage}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        out of (250GB) storage used
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
