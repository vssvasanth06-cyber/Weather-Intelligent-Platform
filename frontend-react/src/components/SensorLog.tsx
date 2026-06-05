import { useRef, useEffect } from "react";
import type { WeatherData } from "../types/weather";

interface Props {
    history: WeatherData[];
}

function fmt(ts: string) {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
        d.getMinutes()
    )}:${pad(d.getSeconds())}`;
}

function SensorLog({ history }: Props) {
    const logRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top when new entries arrive (newest is at top)
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = 0;
    }, [history.length]);

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-green-400 font-mono font-bold text-sm">
                    📋 SENSOR LOG
                </span>
                <span className="text-gray-500 font-mono text-xs">
                    {history.length} entries
                </span>
            </div>
            <div
                ref={logRef}
                className="overflow-y-auto font-mono text-xs"
                style={{ height: "320px" }}
            >
                {history.length === 0 ? (
                    <p className="text-gray-600 p-4 text-center">
                        Waiting for sensor data...
                    </p>
                ) : (
                    history.map((entry, i) => (
                        <div
                            key={i}
                            className={`px-4 py-1.5 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                                i === 0 ? "bg-gray-800 text-green-300" : "text-green-500"
                            }`}
                        >
                            <span className="text-gray-500 mr-2">
                                [{fmt(entry.timestamp)}]
                            </span>
                            <span className="text-yellow-400">T:</span>
                            {entry.temperature?.toFixed(1)}°C{"  "}
                            <span className="text-blue-400">H:</span>
                            {entry.humidity?.toFixed(1)}%{"  "}
                            <span className="text-purple-400">P:</span>
                            {entry.pressure?.toFixed(1)}hPa{"  "}
                            <span className="text-cyan-400">R:</span>
                            {entry.rainfall?.toFixed(2)}mm{"  "}
                            <span className="text-orange-400">W:</span>
                            {entry.wind_speed?.toFixed(1)}m/s{"  "}
                            <span className="text-pink-400">L:</span>
                            {entry.light_intensity?.toFixed(0)}lux
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SensorLog;
