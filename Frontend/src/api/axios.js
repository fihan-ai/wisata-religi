import axios from 'axios';

const base = import.meta.env.VITE_API_URL || ('http://127.0.0.1:8000/api');

const api = axios.create({
    baseURL: base,
    withCredentials: true,
    headers: {
        'Accept': 'application/json'
    }
});

export default api;