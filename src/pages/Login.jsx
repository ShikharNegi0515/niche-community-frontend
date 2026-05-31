import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { BASE_URL } from "../components/utils.js"; 

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token); // store token for auth requests
                navigate("/dashboard");
            } else {
                setErrorMsg(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-panel">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access your NicheSphere communities</p>
                
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

                <form onSubmit={handleSubmit}>
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
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>
                <p style={{ marginTop: "1.5rem", marginBottom: 0 }}>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
