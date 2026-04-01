import axios from "axios";

export const api = axios.create({
    baseURL: "http://192.168.3.28:3000", // troca pro IPv4 da tua máquina
});