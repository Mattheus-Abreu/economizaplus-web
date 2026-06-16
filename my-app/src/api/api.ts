import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
    baseURL: "https://economizaplus-backend-git-develop-gustavodelttas-projects.vercel.app"
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      delete api.defaults.headers.common["Authorization"];
      await AsyncStorage.removeItem("@myapp:auth-state");
    }
    if (error.response?.status === 500) {
      console.log("[API 500]", error.config?.method?.toUpperCase(), error.config?.url, error.response?.data);
    }
    return Promise.reject(error);
  }
);
