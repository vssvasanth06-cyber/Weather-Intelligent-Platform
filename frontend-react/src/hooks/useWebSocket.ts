import { useEffect, useRef, useState, useCallback } from "react";
import type { WeatherData } from "../types/weather";
import { WS_URL } from "../api/weatherApi";

const MAX_HISTORY = 50;

export function useWeatherWebSocket() {
    const [latest, setLatest] = useState<WeatherData | null>(null);
    const [history, setHistory] = useState<WeatherData[]>([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onmessage = (event) => {
            try {
                const data: WeatherData = JSON.parse(event.data);
                data.timestamp = data.timestamp || new Date().toISOString();
                setLatest(data);
                setHistory((prev) => {
                    const next = [data, ...prev];
                    return next.slice(0, MAX_HISTORY);
                });
            } catch {
                // ignore malformed messages
            }
        };

        ws.onclose = () => {
            setConnected(false);
            // Auto-reconnect after 3 seconds
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => ws.close();
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    return { latest, history, connected };
}
