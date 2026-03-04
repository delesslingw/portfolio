import MotionTitle from "@/components/MotionTitle";
import MusicPlayer from "@/components/MusicPlayer";
import colors from "@/lib/colors";
import { getDistroKidLinks } from "@/lib/distrokid";
import { getSongBySlug } from "@/lib/songs";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function Song({ params }: Props) {
    const { slug } = await params;
    const song = await getSongBySlug(slug);

    if (!song) {
        notFound();
    }

    const bandcamp = song.streamingLinks.find((link) => link.label.toLowerCase() === "bandcamp");
    const distrokid = song.streamingLinks.find((link) => link.label.toLowerCase() === "distrokid");
    const streamingLinks = distrokid ? await getDistroKidLinks(distrokid.url) : [];

    return (
        <main className="overflow-x-hidden">
            <MotionTitle />
            <section className="h-screen w-screen">
                <MusicPlayer song={song} />
            </section>

            {bandcamp && (
                <section className="flex flex-col md:flex-row items-stretch" style={{ backgroundColor: colors[3] }}>
                    <div className="hidden md:block relative md:w-[500px] min-h-[500px] shrink-0">
                        <Image src={song.images[0]} fill className="object-cover" alt={`${song.name} album art`} />
                    </div>
                    <div className="flex-1 flex items-center justify-center px-10 py-16">
                        <div className="max-w-lg space-y-6">
                            <p className="text-sm font-bold uppercase tracking-widest opacity-70">
                                Support independent music
                            </p>
                            <h1
                                className="italic font-bold leading-tight"
                                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                            >
                                Want to support my music?
                            </h1>
                            <p className="text-lg opacity-80">
                                The best way is to buy this track directly on Bandcamp — 100% of your purchase goes
                                straight to the artist.
                            </p>
                            <a
                                href={bandcamp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 rounded-xl px-6 py-4 font-bold text-white text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                style={{ backgroundColor: "#1da0c3" }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-7 h-7 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z" />
                                </svg>
                                <span>Buy &ldquo;{song.name}&rdquo; on Bandcamp</span>
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {streamingLinks.length > 0 && (
                <section className="flex flex-col items-center py-16 px-4 gap-8" style={{ backgroundColor: colors[9] }}>
                    <h2 className="text-white text-2xl font-bold tracking-wide">Stream on all platforms</h2>
                    <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                        {streamingLinks.map((link) => (
                            <a
                                key={link.service}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors rounded-xl px-5 py-3 text-white font-semibold shadow"
                            >
                                <Image
                                    src={link.iconUrl}
                                    alt={link.service}
                                    width={28}
                                    height={28}
                                    className="rounded-md"
                                />
                                {link.service}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
