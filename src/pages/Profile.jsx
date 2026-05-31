import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { BASE_URL } from "../components/utils.js";
import Navbar from "../components/Navbar.jsx";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [preview, setPreview] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

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
        if (file) {
            // Size limit check (e.g. 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg("⚠️ Image size should be under 2MB");
                return;
            }
            setErrorMsg("");
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Base64 string
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch(`${BASE_URL}/api/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    email,
                    avatar, // Base64 string
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("✨ Profile updated successfully!");
                setUser(data);
                // Update local storage user state
                localStorage.setItem("user", JSON.stringify(data));
                setTimeout(() => setSuccessMsg(""), 3000);
            } else {
                setErrorMsg(`❌ ${data.message || "Failed to update profile"}`);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("❌ Network error updating profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh" }}>
            <Navbar />
            <div className="profile-page">
                <div className="profile-card glass-panel">
                    <button className="back-btn" onClick={() => navigate("/dashboard")}>
                        ← Back to Dashboard
                    </button>
                    
                    <h2>Edit Profile</h2>

                    {errorMsg && (
                        <div style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "var(--danger)",
                            padding: "0.75rem",
                            borderRadius: "10px",
                            fontSize: "0.9rem",
                            marginBottom: "1rem",
                            textAlign: "center"
                        }}>
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            color: "var(--success)",
                            padding: "0.75rem",
                            borderRadius: "10px",
                            fontSize: "0.9rem",
                            marginBottom: "1rem",
                            textAlign: "center"
                        }}>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="profile-form">
                        
                        {/* Avatar Upload */}
                        <div className="profile-avatar-section">
                            <div className="avatar-preview-container">
                                {preview ? (
                                    <img src={preview} alt="avatar preview" className="avatar-preview" />
                                ) : (
                                    <div className="avatar-placeholder">👤</div>
                                )}
                            </div>
                            <label className="avatar-file-label">
                                📷 Choose Avatar Image
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>

                        {/* Username Input */}
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="primary-btn" disabled={loading} style={{ justifyContent: "center" }}>
                            {loading ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
