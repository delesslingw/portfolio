import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";

export type Project = {
    slug: string;
    title: string;
    dates: string;
    location?: string;
    description?: string;
    images?: string[]; // e.g. "/images/indigenous-album.jpg"
    audio?: string[]; // e.g. "/audio/album-snippet.mp3"
    contentHtml: string; // parsed markdown body
};

const DIR = path.join(process.cwd(), "content", "projects");

export async function getAllProjects(): Promise<Project[]> {
    let files: string[] = [];
    try {
        files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
    } catch {
        return [];
    }
    const projects = await Promise.all(
        files.map(async (file) => {
            const slug = file.replace(/\.md$/, "");
            const raw = await fs.readFile(path.join(DIR, file), "utf8");
            const { data, content } = matter(raw);

            const html = String(await unified().use(remarkParse).use(remarkHtml).process(content));
            console.log(data);
            return {
                slug,
                title: data.title,
                dates: data.dates,
                location: data.location ?? "",
                description: data.description ?? "",
                images: filterArray(data.images).map((file) => `${data.mediaRoot}${file}`),
                audio: filterArray(data.audio).map((file) => `${data.mediaRoot}${file}`),
                contentHtml: html,
            };
        })
    );

    // sort newest-first by dates if you like
    return projects;
}

function filterArray(arr: string[]) {
    console.log(arr);
    console.log(arr.length);
    if (arr.length === 0) {
        return [];
    }
    return arr.filter((entry) => typeof entry === "string" && entry.length > 0);
}
