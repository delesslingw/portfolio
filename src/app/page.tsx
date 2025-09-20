import P5Canvas from "@/src/components/P5Canvas";
import Projects from "../components/Projects";
export const revalidate = false; // SSG at build; set to a number for ISR

export default function Home() {
    return (
        <>
            <header className="relative overflow-hidden grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <div className="absolute inset-0 -z-10">
                    <P5Canvas />
                </div>
                <h1 style={{ zIndex: 100 }}>Like life, a work in progress. Check back soon...</h1>
            </header>
            <main>
                <Projects />
            </main>
        </>
    );
}
