import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = ({ refreshCommunities }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Helper to get initials from username
    const getInitials = (username) => {
        if (!username) return "?";
        const names = username.split(" ");
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[1][0]).toUpperCase();
    };

    // Create community
    const handleCreateCommunity = async () => {
        if (!name) return setSuccessMsg("❌ Community name is required");

        const token = localStorage.getItem("token");
        if (!token) return setSuccessMsg("❌ User not logged in");

        try {
            const res = await fetch("http://localhost:5000/api/communities", {
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
                <button onClick={() => setShowModal(true)}>Create Community</button>
                <button onClick={logout}>Logout</button>

                {/* Avatar next to Logout */}
                <div
                    className="avatar"
                    onClick={() => navigate("/profile")}
                    title="Go to Profile"
                >
                    {getInitials(user?.username)}
                </div>
            </div>

            {/* Toast message */}
            {successMsg && <div className="toast-message">{successMsg}</div>}

            {/* Create Community Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                        />
                        <button onClick={handleCreateCommunity}>Create</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
