import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface Props {
    title: string;
    data: number[];
    color?: string;
}

function WeatherTrendChart({
    title,
    data
}: Props) {

    const chartRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!chartRef.current)
            return;

        const chart =
            echarts.init(chartRef.current);

        chart.setOption({

            tooltip: {
                trigger: "axis"
            },

            xAxis: {
                type: "category",
                data: data.map(
                    (_, index) => `R${index + 1}`
                )
            },

            yAxis: {
                type: "value"
            },

            series: [
                {
                    data,
                    type: "line",
                    smooth: true
                }
            ]
        });

        return () => {
            chart.dispose();
        };

    }, [data]);

    return (

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

            <h2 className="text-2xl font-bold mb-4">
                {title}
            </h2>

            <div
                ref={chartRef}
                style={{
                    width: "100%",
                    height: "350px"
                }}
            />

        </div>
    );
}

export default WeatherTrendChart;