import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      showToast("Account created! Welcome to NicheSphere.", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-brand">🛸 NicheSphere</div>
        <h2>Join NicheSphere</h2>
        <p>Create an account to build and join niche communities</p>

        {errorMsg && <div className="alert alert-error">⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="your_handle"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
