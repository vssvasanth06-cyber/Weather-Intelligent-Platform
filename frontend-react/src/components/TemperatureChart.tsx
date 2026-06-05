import { useEffect, useState } from "react";

import { getSensorHistory } from "../api/weatherApi";

import WeatherTrendChart from "./WeatherTrendChart";

function TemperatureChart() {

    const [temperatures, setTemperatures] =
        useState<number[]>([]);

    useEffect(() => {

        const loadHistory = async () => {

            const history =
                await getSensorHistory();

            const tempData =
                history.map(
                    (item: any) =>
                        item.temperature
                );

            setTemperatures(tempData);
        };

        loadHistory();

    }, []);

    return (
        <WeatherTrendChart
            title="Temperature Trend"
            data={temperatures}
        />
    );
}

export default TemperatureChart;