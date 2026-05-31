import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { BASE_URL } from "./utils.js";

const Navbar = ({ refreshCommunities }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const token = localStorage.getItem("token");

    const getInitials = (username) => {
        if (!username) return "?";
        const names = username.trim().split(" ");
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    // Fetch user notifications
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.ok ? await res.json() : [];
                setNotifications(data);
                // Calculate unread
                const unread = data.filter((n) => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 15 seconds
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [token]);

    const handleCreateCommunity = async () => {
        if (!name) return setSuccessMsg("❌ Community name is required");

        if (!token) return setSuccessMsg("❌ User not logged in");

        try {
            const res = await fetch(`${BASE_URL}/api/communities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, description }),
            });

            const data = await res.json();
            if (res.ok) {
                setName("");
                setDescription("");
                setShowModal(false);
                setSuccessMsg("✅ Community created successfully!");
                if (refreshCommunities) refreshCommunities();
                setTimeout(() => setSuccessMsg(""), 3000);
            } else {
                setSuccessMsg(`❌ ${data.message}`);
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            console.error(err);
            setSuccessMsg("❌ Error creating community");
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(
                    notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
                );
                setUnreadCount(Math.max(0, unreadCount - 1));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        setShowNotifications(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <nav className="navbar">
            <h2 onClick={() => navigate("/dashboard")}>🛸 NicheSphere</h2>

            <div className="navbar-right">
                <div className="nav-controls">
                    <button className="primary-btn" onClick={() => setShowModal(true)}>
                        <span>✨ Create Community</span>
                    </button>

                    {/* Notification Bell */}
                    <div className="notification-bell-container">
                        <button
                            className="notification-bell-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                            title="Notifications"
                        >
                            🔔
                            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
                        </button>

                        {/* Notifications Drawer */}
                        {showNotifications && (
                            <div className="notifications-drawer">
                                <div className="notifications-header">
                                    <h4>Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button className="clear-all-btn" onClick={markAllAsRead}>
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="notifications-list">
                                    {notifications.length === 0 ? (
                                        <div className="no-notifications">No notifications yet</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={`notification-item ${!n.isRead ? "unread" : ""}`}
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                <div className="notification-details">
                                                    <p>{n.message}</p>
                                                    <span>
                                                        {new Date(n.createdAt).toLocaleDateString()}{" "}
                                                        {new Date(n.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                {!n.isRead && <div className="mark-read-indicator"></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="secondary-btn" onClick={logout}>
                        Logout
                    </button>
                </div>

                {/* Profile Avatar */}
                <div
                    className="avatar"
                    onClick={() => navigate("/profile")}
                    title="Go to Profile"
                >
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" />
                    ) : (
                        getInitials(user?.username)
                    )}
                </div>
            </div>

            {successMsg && <div className="toast-message">{successMsg}</div>}

            {showModal && (
                <div className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(9, 13, 22, 0.75)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10000,
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-content glass-panel"
                        style={{
                            width: "90%",
                            maxWidth: "460px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Create New Community</h3>

                        <input
                            type="text"
                            placeholder="Community Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ minHeight: "100px", resize: "vertical" }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                            <button className="secondary-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="primary-btn" onClick={handleCreateCommunity}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
