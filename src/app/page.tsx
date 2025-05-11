import P5Canvas from "@/components/P5Canvas";

export default function Home() {
    return (
        <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div style={{ position: "absolute", width: "100vw", height: "100vh" }}>
                <P5Canvas />
            </div>
            <h4 style={{ zIndex: 100 }}>Like life, a work in progress. Check back soon...</h4>
        </div>
    );
}
