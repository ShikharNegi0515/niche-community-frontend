export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://niche-community-backend.onrender.com");

export const COMMUNITY_COLORS = [
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff", dot: "#a855f7" },
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", dot: "#f97316" },
  { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
  { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc", dot: "#06b6d4" },
  { bg: "#fefce8", text: "#a16207", border: "#fde68a", dot: "#eab308" },
  { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4", dot: "#14b8a6" },
  { bg: "#faf5ff", text: "#6d28d9", border: "#ddd6fe", dot: "#8b5cf6" },
];

export const getCommunityColor = (id = "") => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COMMUNITY_COLORS[hash % COMMUNITY_COLORS.length];
};

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getInitials(username) {
  if (!username) return "?";
  const names = username.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}
