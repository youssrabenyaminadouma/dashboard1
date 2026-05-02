import "../css/Login.css";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  MdEmail,
  MdLock,
  MdHome,
  MdPrivacyTip,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials.");
      } else {
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure Flask is running.");
    }

    setLoading(false);
  };

  return (
    <div className="body">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">Nestlé</div>

        <ul className="nav-links">
          <li className="nav-item" onClick={() => navigate("/")}>
            <MdHome className="nav-icon" />
            <span>Home</span>
          </li>

          <li className="nav-item" onClick={() => navigate("/privacy")}>
            <MdPrivacyTip className="nav-icon" />
            <span>Privacy</span>
          </li>
        </ul>
      </nav>

      {/* CONTENT */}
      <div className="content">
        <div className="login-container">
          <div className="text-container">
            <div className="logintext">
              <h1>Sign In</h1>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="input-box">
              <MdEmail className="icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="input-box">
              <MdLock className="icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? (
                  <MdVisibilityOff className="icon" />
                ) : (
                  <MdVisibility className="icon" />
                )}
              </span>
            </div>

            {/* SUBMIT */}
            <button className="submit-btn" type="submit" disabled={loading}>
              <p className="btn-text">
                {loading ? "Signing in..." : "Sign In"}
              </p>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
