import { useNavigate } from "react-router-dom";
import { useWeatherWebSocket } from "../hooks/useWebSocket";

import WeatherCard from "../components/WeatherCard";
import LiveMiniChart from "../components/LiveMiniChart";
import SensorLog from "../components/SensorLog";
import AlertPanel from "../components/AlertPanel";
import ConnectionStatus from "../components/ConnectionStatus";

interface Props {
    embedded?: boolean;
}

function Dashboard({ embedded = false }: Props) {
    const navigate = useNavigate();
    const { latest, history, connected } = useWeatherWebSocket();

    const username = localStorage.getItem("username") || "User";
    const role = localStorage.getItem("role") || "";

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // Extract per-sensor history arrays (oldest → newest for charts)
    const reversed = [...history].reverse();
    const timestamps = reversed.map((r) => r.timestamp);
    const temps = reversed.map((r) => r.temperature);
    const humidity = reversed.map((r) => r.humidity);
    const pressure = reversed.map((r) => r.pressure);
    const rainfall = reversed.map((r) => r.rainfall);
    const wind = reversed.map((r) => r.wind_speed);
    const light = reversed.map((r) => r.light_intensity);

    return (
        <div className={embedded ? "text-white" : "min-h-screen bg-gray-950 text-white"}>

            {/* ── Top Navigation Bar ── */}
            {!embedded && <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌤️</span>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">
                                Weather Intelligence Platform
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {latest?.device_name
                                    ? `${latest.device_name} · ${latest.location}`
                                    : "Waiting for device..."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <ConnectionStatus connected={connected} />
                        <span className="text-gray-400 text-sm hidden md:block">
                            {role} · {username}
                        </span>
                        <button
                            onClick={logout}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>}

            <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

                {/* ── Sensor Cards ── */}
                {!latest && !connected && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-4xl mb-3">📡</p>
                        <p className="font-semibold">Connecting to live sensor stream...</p>
                        <p className="text-sm mt-1">Make sure the backend server is running</p>
                    </div>
                )}

                {!latest && connected && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-4xl mb-3 animate-pulse">⏳</p>
                        <p className="font-semibold">WebSocket connected — awaiting first sensor reading</p>
                        <p className="text-sm mt-1">Waiting for ESP32 to send data...</p>
                    </div>
                )}

                {latest && (
                    <>
                        {/* Sensor Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <WeatherCard
                                icon="🌡️"
                                title="Temperature"
                                value={latest.temperature?.toFixed(1)}
                                unit="°C"
                                color="text-orange-400"
                                timestamp={latest.timestamp}
                            />
                            <WeatherCard
                                icon="💧"
                                title="Humidity"
                                value={latest.humidity?.toFixed(1)}
                                unit="%"
                                color="text-blue-400"
                                timestamp={latest.timestamp}
                            />
                            <WeatherCard
                                icon="🌀"
                                title="Pressure"
                                value={latest.pressure?.toFixed(1)}
                                unit="hPa"
                                color="text-purple-400"
                                timestamp={latest.timestamp}
                            />
                            <WeatherCard
                                icon="🌧️"
                                title="Rainfall"
                                value={latest.rainfall?.toFixed(2)}
                                unit="mm"
                                color="text-cyan-400"
                                timestamp={latest.timestamp}
                            />
                            <WeatherCard
                                icon="💨"
                                title="Wind Speed"
                                value={latest.wind_speed?.toFixed(1)}
                                unit="m/s"
                                color="text-green-400"
                                timestamp={latest.timestamp}
                            />
                            <WeatherCard
                                icon="☀️"
                                title="Light"
                                value={latest.light_intensity?.toFixed(0)}
                                unit="lux"
                                color="text-yellow-400"
                                timestamp={latest.timestamp}
                            />
                        </div>

                        {/* ── Live Charts ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <LiveMiniChart
                                title="Temperature (°C)"
                                data={temps}
                                timestamps={timestamps}
                                color="#fb923c"
                                unit="°C"
                            />
                            <LiveMiniChart
                                title="Humidity (%)"
                                data={humidity}
                                timestamps={timestamps}
                                color="#60a5fa"
                                unit="%"
                            />
                            <LiveMiniChart
                                title="Pressure (hPa)"
                                data={pressure}
                                timestamps={timestamps}
                                color="#c084fc"
                                unit="hPa"
                            />
                            <LiveMiniChart
                                title="Rainfall (mm)"
                                data={rainfall}
                                timestamps={timestamps}
                                color="#22d3ee"
                                unit="mm"
                            />
                            <LiveMiniChart
                                title="Wind Speed (m/s)"
                                data={wind}
                                timestamps={timestamps}
                                color="#4ade80"
                                unit="m/s"
                            />
                            <LiveMiniChart
                                title="Light Intensity (lux)"
                                data={light}
                                timestamps={timestamps}
                                color="#facc15"
                                unit="lux"
                            />
                        </div>

                        {/* ── Log + Alerts ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <SensorLog history={history} />
                            <AlertPanel data={latest} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
