import { DateTime } from "luxon";

export function applyTemplate(string: string, values: Record<string, string>) {
    let returnText = "";

    const fragments = string.split("[");

    returnText += fragments[0];

    for (let i = 1; i < fragments.length; i++) {
        const fragmentSections = fragments[i]!.split("]");
        returnText += values[fragmentSections[0]!];
        returnText += fragmentSections[1];
    }

    return returnText;
};

export function formatTimestamp(date: Date, timeoffset: string) {
    return DateTime.fromJSDate(date)
        .setZone(timeoffset)
        .toLocaleString(DateTime.DATETIME_MED);
}

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat(
        (bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals)
    )
        .toString()
        .concat(` ${sizes[i]}`);
}