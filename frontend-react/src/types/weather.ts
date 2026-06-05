export interface WeatherData {
    device_id: string;
    device_name?: string;
    location?: string;
    status?: string;

    temperature: number;
    humidity: number;
    pressure: number;
    rainfall: number;
    wind_speed: number;
    light_intensity: number;

    timestamp: string;
}

export interface SensorHistory {
    id: number;
    device_id: string;

    temperature: number;
    humidity: number;
    pressure: number;
    rainfall: number;
    wind_speed: number;
    light_intensity: number;

    timestamp: string;
}
