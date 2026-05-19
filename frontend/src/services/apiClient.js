import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: BASE_URL, withCredentials: true });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Something went wrong";
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    toast.error(message);
    return Promise.reject(err);
  }
);

export const apiGet = (url, params) => client.get(url, { params });
export const apiPost = (url, data) => client.post(url, data);
export const apiPut = (url, data) => client.put(url, data);
export const apiPatch = (url, data) => client.patch(url, data);
export const apiDelete = (url) => client.delete(url);
export default client;