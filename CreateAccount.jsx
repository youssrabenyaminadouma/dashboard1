import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/CreateAccount.css";

import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdAdminPanelSettings,
} from "react-icons/md";

function CreateAccount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin", // ✅ default admin
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="body">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-title">
          <h1>Create Account</h1>
          <p>Add a new member to the dashboard</p>
        </div>
        <button
          className="btn-back-members"
          onClick={() => navigate("/members")}
        >
          Back to Members
        </button>
      </div>

      {/* CONTENT */}
      <div className="content">
        <div className="signup-container">
          <div className="signuptext">
            <h1>Create Account</h1>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* NAME */}
            <div className="input-box">
              <MdPerson className="icon" />
              <input
                type="text"
                name="Full_name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="Full_name"
              />
            </div>

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
                autoComplete="email" // ✅ prevents weird overlay
              />
            </div>

            {/* ROLE */}
            <div className="input-box">
              <MdAdminPanelSettings className="icon" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role-select"
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
                <option value="supervisor">Supervisor</option>
                <option value="operator">Operator</option>
              </select>
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
                autoComplete="new-password"
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <MdVisibilityOff className="icon" />
                ) : (
                  <MdVisibility className="icon" />
                )}
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-box">
              <MdLock className="icon" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
                  <MdVisibilityOff className="icon" />
                ) : (
                  <MdVisibility className="icon" />
                )}
              </span>
            </div>

            {/* SUBMIT */}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;