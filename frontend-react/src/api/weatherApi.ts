import axios from "axios";

// ── Cloud / Local auto-detection ──────────────────────────────
// Set VITE_API_URL in .env.production for cloud deployment.
// Falls back to same-host (LAN / localhost) for local use.
const RAW_API = import.meta.env.VITE_API_URL as string | undefined;
const RAW_WS  = import.meta.env.VITE_WS_URL  as string | undefined;

export const API_BASE = RAW_API ?? `http://${window.location.hostname}:8000`;

// Convert http→ws / https→wss automatically
const wsBase = RAW_WS ?? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8000`;
export const WS_URL = `${wsBase}/ws/live`;

const api = axios.create({ baseURL: API_BASE });

export const getWeatherSummary = async () => {
    const response = await api.get("/dashboard/weather-summary/WTH001");
    return response.data;
};

export const getSensorHistory = async () => {
    const response = await api.get("/dashboard/history/WTH001");
    return response.data;
};

export default api;
