"use client";

import dynamic from "next/dynamic";

// Do dynamic import *inside* a client component
const P5Canvas = dynamic(() => import("./P5Canvas"), { ssr: false });

export default function P5CanvasWrapper() {
    return <P5Canvas />;
}
