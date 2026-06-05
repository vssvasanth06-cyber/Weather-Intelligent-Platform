import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/weatherApi";
import Dashboard from "./Dashboard";

interface AdminStats {
    users: number;
    devices: number;
    audit_logs: number;
    security_events: number;
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: number | string;
    color: string;
}) {
    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <p className={`text-4xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [tab, setTab] = useState<"live" | "admin">("live");

    useEffect(() => {
        const token = localStorage.getItem("token");
        api
            .get("/admin/statistics", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setStats(r.data))
            .catch(console.error);
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Top bar */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                            <h1 className="text-lg font-bold">Admin Panel</h1>
                            <p className="text-xs text-gray-400">
                                Weather Intelligence Platform
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTab("live")}
                            className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${
                                tab === "live"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Live Dashboard
                        </button>
                        <button
                            onClick={() => setTab("admin")}
                            className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${
                                tab === "admin"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Admin Stats
                        </button>
                        <button
                            onClick={logout}
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {tab === "live" ? (
                /* Reuse the live sensor dashboard (without its own header) */
                <LiveSection />
            ) : (
                <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon="👤"
                            label="Total Users"
                            value={stats?.users ?? "—"}
                            color="text-blue-400"
                        />
                        <StatCard
                            icon="📡"
                            label="Devices"
                            value={stats?.devices ?? "—"}
                            color="text-green-400"
                        />
                        <StatCard
                            icon="📋"
                            label="Audit Logs"
                            value={stats?.audit_logs ?? "—"}
                            color="text-yellow-400"
                        />
                        <StatCard
                            icon="🔒"
                            label="Security Events"
                            value={stats?.security_events ?? "—"}
                            color="text-red-400"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveSection() {
    return <Dashboard embedded />;
}

export default AdminDashboard;
