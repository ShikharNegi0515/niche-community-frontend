export const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://niche-community-backend.onrender.com";

// Curated vibrant color palettes — each [bg, text, border, dot]
const COMMUNITY_COLORS = [
    { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" }, // blue
    { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" }, // green
    { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff", dot: "#a855f7" }, // purple
    { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", dot: "#f97316" }, // orange
    { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" }, // red
    { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc", dot: "#06b6d4" }, // cyan
    { bg: "#fefce8", text: "#a16207", border: "#fde68a", dot: "#eab308" }, // yellow
    { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" }, // rose
    { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4", dot: "#14b8a6" }, // teal
    { bg: "#faf5ff", text: "#6d28d9", border: "#ddd6fe", dot: "#8b5cf6" }, // violet
];

/**
 * Returns a consistent color palette for a given community ID.
 * Uses a simple hash of the ID string so the same community always
 * gets the same color across renders and page loads.
 */
export const getCommunityColor = (id = "") => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return COMMUNITY_COLORS[hash % COMMUNITY_COLORS.length];
};
