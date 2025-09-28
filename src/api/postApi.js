import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

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
