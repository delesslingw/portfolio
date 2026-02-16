"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MAP_IMAGE from "../../../public/images/time-zone-map-usa.png";

const ZONE_COLORS = {
    eastern: "#6fff6a",
    central: "#f4ff6a",
    mountain: "#ffad6a",
    arizonaMountain: "#ff6ab1",
    pacific: "#d56aff",
    alaska: "#6aadff",
    hawaii: "#6affc7",
};

const ZONE_CONFIG = {
    hawaii: { tz: "Pacific/Honolulu", label: "HST" },
    alaska: { tz: "America/Anchorage", label: "AKST" },
    pacific: { tz: "America/Los_Angeles", label: "PST" },
    arizonaMountain: { tz: "America/Phoenix", label: "MST (AZ)" },
    mountain: { tz: "America/Denver", label: "MST" },
    central: { tz: "America/Chicago", label: "CST" },
    eastern: { tz: "America/New_York", label: "EST" },
};

function getOffsetHours(tz: string) {
    const now = new Date();

    const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

    const target = new Date(now.toLocaleString("en-US", { timeZone: tz }));

    return (target.getTime() - eastern.getTime()) / (1000 * 60 * 60);
}

export default function NFEAIELandingPage() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen">
            <div className="w-[1500px] h-[200px] flex justify-between items-center px-4">
                {Object.entries(ZONE_CONFIG).map(([zone, config]) => {
                    const time = now.toLocaleTimeString("en-US", {
                        timeZone: config.tz,
                        hour: "numeric",
                        minute: "2-digit",
                    });

                    const offset = getOffsetHours(config.tz);
                    const offsetLabel =
                        offset === 0
                            ? "Same as Eastern"
                            : `${offset > 0 ? "+" : ""}${offset} hour${Math.abs(offset) !== 1 ? "s" : ""}`;

                    return (
                        <div
                            key={zone}
                            className="flex-1 mx-2 h-full flex flex-col items-center justify-center text-black"
                            style={{ backgroundColor: ZONE_COLORS[zone as keyof typeof ZONE_COLORS] }}
                        >
                            <div className="text-lg font-semibold">{config.label}</div>

                            <div className="text-3xl font-bold">{time}</div>

                            <div className="text-sm">{offsetLabel}</div>
                        </div>
                    );
                })}
            </div>

            <Image src={MAP_IMAGE} alt="A map of US timezones" width={1500} height={350} />
        </div>
    );
}
