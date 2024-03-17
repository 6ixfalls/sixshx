import { db } from "~/server/db";
import { init } from "@paralleldrive/cuid2";

const createId = init({ length: 12 });

export async function generateSlug(
    count = 0
): Promise<string | undefined> {
    const slug = createId();

    console.log(`Generated slug ${count}: ${slug}`);

    const sameSlug = await db.resource.findUnique({
        where: { slug },
    });

    if (count > 25) return;

    if (sameSlug && sameSlug.slug === slug) {
        console.log(`Slug ${slug} already exists on file ${sameSlug.id}`);
        return generateSlug(count + 1);
    }

    console.log(`Slug was available to use (${slug})`);

    return slug;
}