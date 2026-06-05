import { useEffect, useState } from "react";

interface Props {
    icon: string;
    title: string;
    value: string;
    unit: string;
    color: string;
    timestamp?: string;
}

function WeatherCard({ icon, title, value, unit, color, timestamp }: Props) {
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 600);
        return () => clearTimeout(t);
    }, [value]);

    const relativeTime = (ts?: string) => {
        if (!ts) return "";
        const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
        if (diff < 5) return "just now";
        if (diff < 60) return `${diff}s ago`;
        return `${Math.floor(diff / 60)}m ago`;
    };

    return (
        <div
            className={`rounded-2xl p-5 border transition-all duration-300 ${
                flash
                    ? "border-opacity-80 scale-[1.02]"
                    : "border-opacity-20"
            } bg-gray-800 border-gray-600`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-gray-400 font-mono">
                    {relativeTime(timestamp)}
                </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>
                {value}
                <span className="text-base ml-1 text-gray-400">{unit}</span>
            </p>
        </div>
    );
}

export default WeatherCard;
