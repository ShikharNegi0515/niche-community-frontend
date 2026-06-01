import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { getInitials, formatRelativeTime } from "./utils.js";

const Navbar = ({ refreshCommunities, onMenuToggle }) => {
  const { logout, user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRequest("/api/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      /* silent when logged out */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleCreateCommunity = async () => {
    if (!name.trim()) {
      showToast("Community name is required.", "error");
      return;
    }

    setCreating(true);
    try {
      await apiRequest("/api/communities", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      setName("");
      setDescription("");
      setShowModal(false);
      showToast("Community created!", "success");
      refreshCommunities?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {onMenuToggle && (
          <button type="button" className="menu-toggle-btn" onClick={onMenuToggle} aria-label="Menu">
            ☰
          </button>
        )}
        <h2 onClick={() => navigate("/dashboard")}>🛸 NicheSphere</h2>
      </div>

      <div className="navbar-right">
        <div className="nav-controls">
          <button type="button" className="primary-btn" onClick={() => setShowModal(true)}>
            ✨ Create Community
          </button>

          <div className="notification-bell-container">
            <button
              type="button"
              className="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <>
                <button
                  type="button"
                  className="notif-backdrop"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="notifications-drawer">
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button type="button" className="clear-all-btn" onClick={markAllAsRead}>
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
                            <span>{formatRelativeTime(n.createdAt)}</span>
                          </div>
                          {!n.isRead && <div className="mark-read-indicator" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="button" className="secondary-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div
          className="avatar"
          onClick={() => navigate("/profile")}
          title="Profile"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/profile")}
        >
          {user?.avatar ? <img src={user.avatar} alt="" /> : getInitials(user?.username)}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Community</h3>
            <p className="modal-desc">Start a space for people who share your niche interests.</p>
            <label className="field-label">Name</label>
            <input
              type="text"
              placeholder="e.g. Indie Game Devs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="field-label">Description</label>
            <textarea
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: "90px", resize: "vertical" }}
            />
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleCreateCommunity}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
