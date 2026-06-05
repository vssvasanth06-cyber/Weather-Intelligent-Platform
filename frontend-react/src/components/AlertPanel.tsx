import type { WeatherData } from "../types/weather";

interface Alert {
    type: string;
    message: string;
    severity: "critical" | "warning" | "info";
}

function deriveAlerts(data: WeatherData | null): Alert[] {
    if (!data) return [];
    const alerts: Alert[] = [];

    if (data.temperature > 40)
        alerts.push({ type: "EXTREME HEAT", message: `${data.temperature}°C — extreme heat`, severity: "critical" });
    else if (data.temperature > 35)
        alerts.push({ type: "HIGH TEMP", message: `${data.temperature}°C — high temperature`, severity: "warning" });

    if (data.humidity < 20)
        alerts.push({ type: "LOW HUMIDITY", message: `${data.humidity}% — dry conditions`, severity: "warning" });
    else if (data.humidity > 90)
        alerts.push({ type: "HIGH HUMIDITY", message: `${data.humidity}% — very humid`, severity: "warning" });

    if (data.rainfall > 0.8)
        alerts.push({ type: "HEAVY RAIN", message: `${data.rainfall}mm — heavy rainfall`, severity: "critical" });

    if (data.wind_speed > 8)
        alerts.push({ type: "HIGH WIND", message: `${data.wind_speed}m/s — strong winds`, severity: "warning" });

    return alerts;
}

const severityStyle: Record<string, string> = {
    critical: "bg-red-900 border-red-500 text-red-200",
    warning: "bg-yellow-900 border-yellow-500 text-yellow-200",
    info: "bg-blue-900 border-blue-500 text-blue-200",
};

interface Props {
    data: WeatherData | null;
}

function AlertPanel({ data }: Props) {
    const alerts = deriveAlerts(data);

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-red-400 font-bold text-sm">🚨 ALERTS</span>
                {alerts.length > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {alerts.length}
                    </span>
                )}
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: "280px" }}>
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="text-3xl mb-2">✅</span>
                        <p className="text-green-400 font-semibold">All Clear</p>
                        <p className="text-gray-500 text-xs mt-1">No active weather alerts</p>
                    </div>
                ) : (
                    alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`border-l-4 p-3 mb-2 rounded-r-lg text-sm ${severityStyle[alert.severity]}`}
                        >
                            <p className="font-bold">{alert.type}</p>
                            <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AlertPanel;
