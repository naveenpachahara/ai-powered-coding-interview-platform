import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.PROD ? "/api" : "http://localhost:3000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;
