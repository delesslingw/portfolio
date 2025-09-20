#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";

const root = process.cwd();
const contentDir = path.join(root, "content", "projects");
const projectsDir = path.join(root, "public", "projects");

// paths to your reusable example assets
const exampleImage = path.join(root, "public", "images", "example.jpg");
const exampleAudio = path.join(root, "public", "audio", "example.mp3");

const res = await prompts([
    { name: "slug", message: "Slug (e.g. indigenous-album)", type: "text", validate: (v) => (v ? true : "Required") },
    { name: "title", message: "Title", type: "text" },
    { name: "dates", message: "Dates", type: "text" },
    { name: "location", message: "Location", type: "text" },
    { name: "description", message: "Short description", type: "text" },
    { name: "content", message: "The body of the project. The primary text", type: "text" },
]);

const { slug, title, dates, location, description, content } = res;
if (!slug) process.exit(1);

// Markdown file path
const mdPath = path.join(contentDir, `${slug}.md`);

// Project asset folder
const projectAssetDir = path.join(projectsDir, slug);

// Default file names inside each project folder
const imageFilename = "example.jpg";
const audioFilename = "example.mp3";

// Markdown template
const md = `---
title: "${title || ""}"
dates: "${dates || ""}"
location: "${location || ""}"
description: "${description || ""}"
mediaRoot: "/projects/${slug}/"
images:
  - "${imageFilename}"
audio:
  - "${audioFilename}"
---

# ${title || ""}
${content || ""}
`;

// Ensure directories exist
await fs.mkdir(contentDir, { recursive: true });
await fs.mkdir(projectAssetDir, { recursive: true });

// Write markdown file
await fs.writeFile(mdPath, md, "utf8");

// Copy default assets into project folder
try {
    await fs.copyFile(exampleImage, path.join(projectAssetDir, imageFilename));
    await fs.copyFile(exampleAudio, path.join(projectAssetDir, audioFilename));
} catch (err) {
    console.warn("⚠️ Could not copy example assets:", err.message);
}

console.log(`\nCreated:
- ${path.relative(root, mdPath)}
- ${path.relative(root, projectAssetDir)}/ with example assets\n`);
