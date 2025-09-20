#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";

const root = process.cwd();
const contentDir = path.join(root, "content", "projects");
const projectsDir = path.join(root, "public", "projects");

async function listProjectSlugs() {
    try {
        const files = await fs.readdir(contentDir, { withFileTypes: true });
        return files
            .filter((d) => d.isFile() && d.name.endsWith(".md"))
            .map((d) => d.name.replace(/\.md$/, ""))
            .sort((a, b) => a.localeCompare(b));
    } catch (e) {
        if (e.code === "ENOENT") return [];
        throw e;
    }
}

async function main() {
    // 1) Gather slugs
    const slugs = await listProjectSlugs();
    if (slugs.length === 0) {
        console.log("No projects found in content/projects.");
        process.exit(0);
    }

    // 2) Select slug (arrow keys)
    const selectAns = await prompts({
        name: "slug",
        type: "select",
        message: "Select a project to delete",
        choices: slugs.map((s) => ({ title: s, value: s })),
    });

    const slug = selectAns.slug;
    if (!slug) {
        console.log("Cancelled.");
        process.exit(0);
    }

    // 3) Confirm (y/N)
    const confirmAns = await prompts({
        name: "ok",
        type: "confirm",
        initial: false,
        message: `Are you sure you want to delete "${slug}"? This will be permanent.`,
    });

    if (!confirmAns.ok) {
        console.log("Cancelled.");
        process.exit(0);
    }

    // 4) Paths to delete
    const mdPath = path.join(contentDir, `${slug}.md`);
    const assetsDir = path.join(projectsDir, slug);

    // 5) Delete .md
    try {
        await fs.unlink(mdPath);
        console.log(`Deleted: ${path.relative(root, mdPath)}`);
    } catch (e) {
        if (e.code === "ENOENT") {
            console.warn(`(Skip) Not found: ${path.relative(root, mdPath)}`);
        } else {
            throw e;
        }
    }

    // 6) Delete assets folder (recursive)
    try {
        await fs.rm(assetsDir, { recursive: true, force: true });
        console.log(`Deleted: ${path.relative(root, assetsDir)}/`);
    } catch (e) {
        if (e.code === "ENOENT") {
            console.warn(`(Skip) Not found: ${path.relative(root, assetsDir)}/`);
        } else {
            throw e;
        }
    }

    console.log(`\nDone. ${slug} deleted`);
    console.log('  git add -A && git commit -m "delete project ' + slug + '"\n');
}

main().catch((err) => {
    console.error("Delete failed:", err);
    process.exit(1);
});
