import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../components/utils.js";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                setSuccessMsg("🎉 Signup successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setErrorMsg(data.message || "Signup failed");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-panel">
                <h2>Join NicheSphere</h2>
                <p>Create an account to build and join amazing communities</p>

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
                        ⚠️ {errorMsg}
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

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Choose Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="primary-btn" disabled={loading} style={{ justifyContent: "center" }}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
                <p style={{ marginTop: "1.5rem", marginBottom: 0 }}>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
