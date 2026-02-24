import { getAllLinks } from "@/lib/linkStore";

export const runtime = "nodejs";

export default async function LinksPage() {
    const links = await getAllLinks();

    const publicLinks = links.filter((l) => l.public).sort((a, b) => a.slug.localeCompare(b.slug));

    return (
        <main>
            <h1>Public Links</h1>

            <ul>
                {publicLinks.map((link) => (
                    <li key={link.slug}>
                        <h2>
                            <a href={`/${link.slug}`}>{link.title ?? link.slug}</a>
                        </h2>

                        {link.description && <p>{link.description}</p>}

                        <p>
                            <a href={`/${link.slug}.png`}>QR</a>
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
