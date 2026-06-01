import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { showToast } = useToast();
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
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      showToast(`Welcome back, ${data.user.username}!`, "success");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-brand">🛸 NicheSphere</div>
        <h2>Welcome back</h2>
        <p>Sign in to your communities and conversations</p>

        {errorMsg && <div className="alert alert-error">⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <span onClick={() => navigate("/signup")}>Create one</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
