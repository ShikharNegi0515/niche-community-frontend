import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const token = localStorage.getItem("token");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState(""); // For profile picture
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setAvatar(user.avatar || "");
            setPreview(user.avatar || "");
        }
    }, [user]);

    // Handle avatar preview
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Update profile
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        if (avatar) formData.append("avatar", avatar);

        try {
            const res = await fetch("http://localhost:5000/api/users/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                alert("Profile updated successfully");
                setUser(data); // update context
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="profile-page">
            <h2>My Profile</h2>
            <form onSubmit={handleUpdate} className="profile-form">
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Avatar:</label>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    {preview && <img src={preview} alt="avatar preview" className="avatar-preview" />}
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default Profile;
