async function loadWeatherData() {

    const response = await fetch(
        "http://127.0.0.1:8000/dashboard/weather-summary/WTH001"
    );

    const data = await response.json();

    document.getElementById("temperature").innerHTML =
        data.temperature + " °C";

    document.getElementById("humidity").innerHTML =
        data.humidity + " %";

    document.getElementById("pressure").innerHTML =
        data.pressure + " hPa";

    document.getElementById("rainfall").innerHTML =
        data.rainfall + " mm";

    document.getElementById("wind_speed").innerHTML =
        data.wind_speed + " m/s";
}

loadWeatherData();

setInterval(
    loadWeatherData,
    5000
);