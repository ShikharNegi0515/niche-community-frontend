import axios from "axios";
import { BASE_URL } from "../components/utils.js";
const API_URL = `${BASE_URL}/api/auth`;

export const signup = async (data) => {
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
};

export const login = async (data) => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
};
