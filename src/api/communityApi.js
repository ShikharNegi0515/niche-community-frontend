import axios from "axios";
import { BASE_URL } from "../components/utils.js"; 

const API_URL = `${BASE_URL}/api/communities`;

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
