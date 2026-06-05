import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface Props {
    title: string;
    data: number[];
    timestamps: string[];
    color: string;
    unit: string;
}

function LiveMiniChart({ title, data, timestamps, color, unit }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        if (!chartRef.current) {
            chartRef.current = echarts.init(ref.current, "dark");
        }
        const chart = chartRef.current;

        chart.setOption({
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                formatter: (params: any) => {
                    const p = params[0];
                    return `${p.name}<br/>${p.value} ${unit}`;
                },
            },
            grid: { left: 40, right: 10, top: 10, bottom: 30 },
            xAxis: {
                type: "category",
                data: timestamps.map((t) => {
                    const d = new Date(t);
                    return `${d.getHours().toString().padStart(2, "0")}:${d
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:${d
                        .getSeconds()
                        .toString()
                        .padStart(2, "0")}`;
                }),
                axisLabel: { color: "#9ca3af", fontSize: 9, rotate: 30 },
                axisLine: { lineStyle: { color: "#374151" } },
            },
            yAxis: {
                type: "value",
                axisLabel: { color: "#9ca3af", fontSize: 9 },
                splitLine: { lineStyle: { color: "#1f2937" } },
            },
            series: [
                {
                    data,
                    type: "line",
                    smooth: true,
                    symbol: "none",
                    lineStyle: { color, width: 2 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: color + "55" },
                            { offset: 1, color: color + "00" },
                        ]),
                    },
                },
            ],
        });

        return () => {
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.setOption({
            xAxis: {
                data: timestamps.map((t) => {
                    const d = new Date(t);
                    return `${d.getHours().toString().padStart(2, "0")}:${d
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:${d
                        .getSeconds()
                        .toString()
                        .padStart(2, "0")}`;
                }),
            },
            series: [{ data }],
        });
    }, [data, timestamps]);

    return (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-gray-300 font-semibold text-sm mb-2">{title}</h3>
            <div ref={ref} style={{ width: "100%", height: "160px" }} />
        </div>
    );
}

export default LiveMiniChart;
