import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setAvatar(user.avatar || "");
      setPreview(user.avatar || "");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ username, email, avatar }),
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      showToast("Profile updated!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="profile-page">
        <div className="profile-card glass-panel">
          <button type="button" className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>

          <h2>Edit Profile</h2>

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="profile-avatar-section">
              <div className="avatar-preview-container">
                {preview ? (
                  <img src={preview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">👤</div>
                )}
              </div>
              <label className="avatar-file-label">
                📷 Change avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
