import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import useSWR from "swr";

const JSONFetcher = (a: any) => fetch(a).then((res) => res.json());
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat(
        (bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals)
    )
        .toString()
        .concat(` ${sizes[i]}`);
};

export default function Home() {
    const { data } = useSWR("/api/stats", JSONFetcher);

    const { toast } = useToast();

    const ItemsPerPage = 24;
    const [totalPages, setTotalPages] = React.useState(0);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [textPageNumber, setTextPageNumber] = React.useState("1");

    const { data: files, error } = useSWR(
        `/api/files/list?skip=${
            ItemsPerPage * (pageNumber - 1)
        }&take=${ItemsPerPage}`,
        JSONFetcher
    );

    React.useEffect(() => {
        setTextPageNumber(pageNumber.toString());
    }, [pageNumber]);
    React.useEffect(() => {
        if (data && data.files) {
            setTotalPages(Math.ceil(data?.files / ItemsPerPage));
        }
    }, [data]);

    return (
        <div className="p-4">
            <div className="grid grid-cols-4 gap-2 pb-4">
                {!error &&
                    files &&
                    files.map((file: any) => (
                        <Link
                            key={file.id}
                            href={`https://cdn.sixfalls.me/${file.slug}`}
                            target="_blank"
                        >
                            <Card className="p-4 flex flex-col gap-2">
                                <CardTitle>{file.originalName}</CardTitle>
                                <CardDescription>
                                    {file.mimetype}, {formatBytes(file.size)}
                                </CardDescription>
                                <CardContent>
                                    {file.mimetype.startsWith("image/") ? (
                                        <Image
                                            src={`https://s3.sixfalls.me/${file.id}.${file.extension}`}
                                            alt="image"
                                            width={512}
                                            height={512}
                                            className="aspect-video object-contain w-full"
                                        />
                                    ) : file.mimetype.startsWith("video/") ? (
                                        <video
                                            src={`https://s3.sixfalls.me/${file.id}.${file.extension}`}
                                            width={512}
                                            height={512}
                                            className="aspect-video object-contain w-full"
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </CardContent>
                                <CardDescription>
                                    Uploaded at{" "}
                                    {new Date(file.createdAt).toLocaleString()}
                                    Uploaded by <kbd>{file.user.username}</kbd>
                                </CardDescription>
                            </Card>
                        </Link>
                    ))}
            </div>

            <div className="flex flex-row w-auto justify-center">
                <Button
                    variant="ghost"
                    className="aspect-square p-0"
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                >
                    <ChevronLeft className="w-4 h-4 m-0" />
                </Button>
                <div className="flex flex-row items-center justify-center">
                    <Input
                        value={textPageNumber}
                        className="text-center px-0 w-8"
                        onChange={(e) => {
                            e.target.style.width = `calc(${
                                e.target.value.length - 1
                            }ch + 2rem)`;
                            setTextPageNumber(
                                (e.target as HTMLInputElement).value
                            );
                        }}
                        onBlur={(e) => {
                            const int = Number(textPageNumber);
                            if (
                                Number.isNaN(int) ||
                                int > totalPages ||
                                int < 1
                            ) {
                                const pageNum = pageNumber.toString();
                                setTextPageNumber(pageNum);
                                e.target.style.width = `calc(${
                                    pageNum.length - 1
                                }ch + 2rem)`;
                                toast({
                                    title: "Invalid page number",
                                    description:
                                        "Please enter a valid page number",
                                    variant: "destructive",
                                });
                            } else {
                                e.target.style.width = `calc(${
                                    int.toString().length - 1
                                }ch + 2rem)`;
                                setPageNumber(int);
                            }
                        }}
                    />
                    <span className="text-sm">/{totalPages}</span>
                </div>

                <Button
                    variant="ghost"
                    className="aspect-square p-0"
                    onClick={() =>
                        setPageNumber(Math.min(pageNumber + 1, totalPages))
                    }
                >
                    <ChevronRight className="w-4 h-4 m-0" />
                </Button>
            </div>
        </div>
    );
}
