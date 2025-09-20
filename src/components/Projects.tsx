import { getAllProjects, Project as ProjectType } from "../lib/projects";
import Image from "next/image";
export default async function Projects() {
    const projects = await getAllProjects();
    return (
        <section className="">
            {projects.map((p) => (
                <Project p={p} key={p.slug} />
            ))}
        </section>
    );
}

const Project = ({ p }: { p: ProjectType }) => {
    return (
        <article key={p.slug}>
            <h2>{p.title}</h2>
            <p>
                {p.dates}
                {p.location ? ` • ${p.location}` : ""}
            </p>

            {p.description && <p>{p.description}</p>}

            {p.images &&
                p.images.length > 0 &&
                p.images.map((img) => (
                    <div key={img}>
                        <Image src={img} alt={p.title} width={1200} height={700} />
                    </div>
                ))}

            {/* Markdown body */}
            <div dangerouslySetInnerHTML={{ __html: p.contentHtml }} />

            {p.audio &&
                p.audio.length > 0 &&
                p.audio.map((aud) => (
                    <audio controls key={aud}>
                        <source src={aud} />
                    </audio>
                ))}

            <hr />
        </article>
    );
};
