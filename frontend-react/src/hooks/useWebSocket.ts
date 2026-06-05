/**
 * Smart data hook — tries WebSocket first, falls back to HTTP polling.
 * WebSocket works on local/paid servers.
 * HTTP polling works everywhere including Render free tier.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { WeatherData } from "../types/weather";
import { API_BASE, WS_URL } from "../api/weatherApi";
import axios from "axios";

const MAX_HISTORY = 50;
const POLL_INTERVAL = 3000; // 3 seconds

export function useWeatherWebSocket() {
    const [latest, setLatest] = useState<WeatherData | null>(null);
    const [history, setHistory] = useState<WeatherData[]>([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const usingPolling = useRef(false);

    const addReading = useCallback((data: WeatherData) => {
        data.timestamp = data.timestamp || new Date().toISOString();
        setLatest(data);
        setHistory(prev => [data, ...prev].slice(0, MAX_HISTORY));
    }, []);

    // HTTP polling fallback
    const startPolling = useCallback(() => {
        if (usingPolling.current) return;
        usingPolling.current = true;
        console.log("[Data] Switched to HTTP polling mode");

        const poll = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE}/dashboard/weather-summary/WTH001`
                );
                if (res.data && res.data.temperature !== undefined) {
                    setConnected(true);
                    addReading(res.data);
                }
            } catch {
                setConnected(false);
            }
        };

        poll(); // immediate first call
        pollRef.current = setInterval(poll, POLL_INTERVAL);
    }, [addReading]);

    // WebSocket attempt
    const connectWS = useCallback(() => {
        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            // If WS doesn't open in 5s → fallback to polling
            const timeout = setTimeout(() => {
                ws.close();
                startPolling();
            }, 5000);

            ws.onopen = () => {
                clearTimeout(timeout);
                setConnected(true);
                console.log("[Data] WebSocket connected");
            };

            ws.onmessage = (event) => {
                try {
                    const data: WeatherData = JSON.parse(event.data);
                    addReading(data);
                } catch { /* ignore */ }
            };

            ws.onclose = () => {
                clearTimeout(timeout);
                setConnected(false);
                if (!usingPolling.current) {
                    // WS closed unexpectedly → switch to polling
                    startPolling();
                }
            };

            ws.onerror = () => {
                clearTimeout(timeout);
                ws.close();
            };
        } catch {
            startPolling();
        }
    }, [addReading, startPolling]);

    useEffect(() => {
        connectWS();
        return () => {
            wsRef.current?.close();
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [connectWS]);

    return { latest, history, connected };
}
