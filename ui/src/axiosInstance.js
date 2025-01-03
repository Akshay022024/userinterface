import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://notesapi-ewf7.onrender.com", // Replace with your backend's base URL
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;