import axios from "axios";

const API_URL = "http://localhost:5000/api/communities";

export const getCommunities = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const createCommunity = async (data, token) => {
    const res = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
