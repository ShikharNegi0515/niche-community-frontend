import axios from "axios";
import { BASE_URL } from "../components/utils.js"; 

const API_URL = `${BASE_URL}/api/posts`;

export const getPosts = async (token) => {
    const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createPost = async (data, token) => {
    const res = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
