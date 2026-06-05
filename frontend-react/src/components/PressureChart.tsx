import { useEffect, useState } from "react";
import { getSensorHistory } from "../api/weatherApi";
import WeatherTrendChart from "./WeatherTrendChart";

function HumidityChart() {

    const [data, setData] = useState<number[]>([]);

    useEffect(() => {

        const loadHistory = async () => {

            const history = await getSensorHistory();

            setData(
                history.map(
                    (item: any) => item.pressure
                )
            );
        };

        loadHistory();

    }, []);

    return (
        <WeatherTrendChart
            title="Pressure Trend"
            data={data}
        />
    );
}

export default HumidityChart;