import React, { useState, useContext } from "react";
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

    const getInitials = (username) => {
        if (!username) return "?";
        const names = username.split(" ");
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[1][0]).toUpperCase();
    };

    const handleCreateCommunity = async () => {
        if (!name) return setSuccessMsg("❌ Community name is required");

        const token = localStorage.getItem("token");
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

    return (
        <nav className="navbar">
            <h2>My Niche Community</h2>

            <div className="navbar-right">
                <button className="primary-btn" onClick={() => setShowModal(true)}>Create Community</button>
                <button className="secondary-btn" onClick={logout}>Logout</button>

                <div
                    className="avatar"
                    onClick={() => navigate("/profile")}
                    title="Go to Profile"
                >
                    {getInitials(user?.username)}
                </div>
            </div>

            {successMsg && <div className="toast-message">{successMsg}</div>}

            {showModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "#fff",
                            padding: "2rem",
                            borderRadius: "12px",
                            minWidth: "360px",
                            maxWidth: "480px",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            animation: "fadeIn 0.3s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: "0.5rem" }}>Create New Community</h3>

                        <input
                            type="text"
                            placeholder="Community Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                width: "100%",
                            }}
                        />

                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                width: "100%",
                                minHeight: "80px",
                                resize: "vertical",
                            }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button
                                onClick={handleCreateCommunity}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    backgroundColor: "#4CAF50",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    backgroundColor: "#f44336",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#da190b"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#f44336"}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
