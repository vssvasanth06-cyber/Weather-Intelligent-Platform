import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const getAlerts = async () => {

    const response = await axios.get(
        `${API_BASE_URL}/alerts/WTH001`
    );

    return response.data;
};