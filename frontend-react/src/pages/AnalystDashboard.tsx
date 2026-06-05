import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/weatherApi";
import LiveMiniChart from "../components/LiveMiniChart";
import { ChartSkeleton } from "../components/LoadingSkeleton";

interface DailyAvg {
    date: string;
    avg_temperature: number;
    avg_humidity: number;
    avg_pressure: number;
    avg_rainfall: number;
    avg_wind_speed: number;
    max_temperature: number;
    min_temperature: number;
    reading_count: number;
}

interface Stats {
    total_readings: number;
    temperature: { average: number; max: number; min: number };
    humidity: { average: number };
    pressure: { average: number };
    rainfall: { total: number };
    wind_speed: { average: number; max: number };
}

interface Prediction {
    forecast: {
        temperature: { next_3_readings: number[]; trend: string; confidence: number };
        humidity: { next_3_readings: number[]; trend: string; confidence: number };
        rainfall: { next_3_readings: number[]; rain_probability_percent: number };
        wind_speed: { next_3_readings: number[]; trend: string };
    };
    anomaly_detection: { anomalies_found: number; status: string; message: string };
}

const DEVICE_ID = "WTH001";

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function AnalystDashboard() {
    const navigate = useNavigate();
    const [daily, setDaily] = useState<DailyAvg[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    const logout = () => { localStorage.clear(); navigate("/"); };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/analytics/daily/${DEVICE_ID}?days=${days}`),
            api.get(`/analytics/statistics/${DEVICE_ID}`),
            api.get(`/predictions/${DEVICE_ID}`)
        ]).then(([d, s, p]) => {
            setDaily(d.data);
            setStats(s.data);
            setPrediction(p.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [days]);

    const dates = daily.map(d => d.date);
    const avgTemps = daily.map(d => d.avg_temperature);
    const avgHumidity = daily.map(d => d.avg_humidity);
    const avgRainfall = daily.map(d => d.avg_rainfall);
    const avgWind = daily.map(d => d.avg_wind_speed);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <h1 className="text-lg font-bold">Analytics Dashboard</h1>
                            <p className="text-xs text-gray-400">Weather Intelligence Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={days}
                            onChange={e => setDays(Number(e.target.value))}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                        </select>
                        <button onClick={logout} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

                {/* Statistics Summary */}
                {stats && stats.temperature && (
                    <div>
                        <h2 className="text-gray-300 font-semibold mb-3">📈 All-Time Statistics</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <StatBox label="Total Readings" value={stats.total_readings?.toLocaleString()} color="text-blue-400" />
                            <StatBox label="Avg Temperature" value={`${stats.temperature.average}°C`} color="text-orange-400" />
                            <StatBox label="Max Temperature" value={`${stats.temperature.max}°C`} color="text-red-400" />
                            <StatBox label="Min Temperature" value={`${stats.temperature.min}°C`} color="text-cyan-400" />
                            <StatBox label="Total Rainfall" value={`${stats.rainfall.total}mm`} color="text-blue-300" />
                            <StatBox label="Max Wind Speed" value={`${stats.wind_speed.max}m/s`} color="text-green-400" />
                        </div>
                    </div>
                )}

                {/* ML Predictions */}
                {prediction && prediction.forecast && (
                    <div>
                        <h2 className="text-gray-300 font-semibold mb-3">🤖 ML Predictions (Next 3 Readings)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                                <p className="text-gray-400 text-xs mb-2">🌡️ Temperature Forecast</p>
                                <div className="flex gap-2 mb-2">
                                    {prediction.forecast.temperature.next_3_readings.map((v, i) => (
                                        <span key={i} className="bg-orange-900 text-orange-300 text-sm px-2 py-1 rounded-lg font-mono">
                                            {v}°C
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Trend: <span className={prediction.forecast.temperature.trend === "rising" ? "text-red-400" : "text-blue-400"}>
                                        {prediction.forecast.temperature.trend === "rising" ? "↑ Rising" : "↓ Falling"}
                                    </span>
                                    {" · "}Confidence: {prediction.forecast.temperature.confidence}%
                                </p>
                            </div>
                            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                                <p className="text-gray-400 text-xs mb-2">🌧️ Rain Probability</p>
                                <div className="text-3xl font-bold text-cyan-400 mb-1">
                                    {prediction.forecast.rainfall.rain_probability_percent}%
                                </div>
                                <div className="flex gap-2">
                                    {prediction.forecast.rainfall.next_3_readings.map((v, i) => (
                                        <span key={i} className="bg-blue-900 text-blue-300 text-sm px-2 py-1 rounded-lg font-mono">
                                            {v}mm
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                                <p className="text-gray-400 text-xs mb-2">💨 Wind Forecast</p>
                                <div className="flex gap-2 mb-2">
                                    {prediction.forecast.wind_speed.next_3_readings.map((v, i) => (
                                        <span key={i} className="bg-green-900 text-green-300 text-sm px-2 py-1 rounded-lg font-mono">
                                            {v}m/s
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Trend: <span className={prediction.forecast.wind_speed.trend === "rising" ? "text-yellow-400" : "text-green-400"}>
                                        {prediction.forecast.wind_speed.trend === "rising" ? "↑ Rising" : "↓ Falling"}
                                    </span>
                                </p>
                            </div>
                            <div className={`rounded-2xl p-4 border ${prediction.anomaly_detection.status === "ALERT" ? "bg-red-950 border-red-700" : "bg-gray-800 border-gray-700"}`}>
                                <p className="text-gray-400 text-xs mb-2">🔍 Anomaly Detection</p>
                                <p className={`text-2xl font-bold mb-1 ${prediction.anomaly_detection.status === "ALERT" ? "text-red-400" : "text-green-400"}`}>
                                    {prediction.anomaly_detection.status}
                                </p>
                                <p className="text-xs text-gray-400">{prediction.anomaly_detection.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historical Charts */}
                <div>
                    <h2 className="text-gray-300 font-semibold mb-3">📅 Historical Trends ({days} days)</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => <ChartSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LiveMiniChart title="Daily Avg Temperature (°C)" data={avgTemps} timestamps={dates} color="#fb923c" unit="°C" />
                            <LiveMiniChart title="Daily Avg Humidity (%)" data={avgHumidity} timestamps={dates} color="#60a5fa" unit="%" />
                            <LiveMiniChart title="Daily Avg Rainfall (mm)" data={avgRainfall} timestamps={dates} color="#22d3ee" unit="mm" />
                            <LiveMiniChart title="Daily Avg Wind Speed (m/s)" data={avgWind} timestamps={dates} color="#4ade80" unit="m/s" />
                        </div>
                    )}
                </div>

                {/* Daily Table */}
                {daily.length > 0 && (
                    <div>
                        <h2 className="text-gray-300 font-semibold mb-3">📋 Daily Summary Table</h2>
                        <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-gray-400">
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-right">Avg Temp</th>
                                            <th className="px-4 py-3 text-right">Max Temp</th>
                                            <th className="px-4 py-3 text-right">Min Temp</th>
                                            <th className="px-4 py-3 text-right">Humidity</th>
                                            <th className="px-4 py-3 text-right">Rainfall</th>
                                            <th className="px-4 py-3 text-right">Wind</th>
                                            <th className="px-4 py-3 text-right">Readings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...daily].reverse().map((row, i) => (
                                            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                                <td className="px-4 py-3 font-mono text-gray-300">{row.date}</td>
                                                <td className="px-4 py-3 text-right text-orange-400">{row.avg_temperature}°C</td>
                                                <td className="px-4 py-3 text-right text-red-400">{row.max_temperature}°C</td>
                                                <td className="px-4 py-3 text-right text-blue-400">{row.min_temperature}°C</td>
                                                <td className="px-4 py-3 text-right text-blue-300">{row.avg_humidity}%</td>
                                                <td className="px-4 py-3 text-right text-cyan-400">{row.avg_rainfall}mm</td>
                                                <td className="px-4 py-3 text-right text-green-400">{row.avg_wind_speed}m/s</td>
                                                <td className="px-4 py-3 text-right text-gray-500">{row.reading_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AnalystDashboard;
