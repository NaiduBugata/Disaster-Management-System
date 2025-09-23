import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/admin.css";

const AdminLogin = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    email_or_username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        setMessage("✅ " + data.message);

        // Redirect to AdminDashboard after a short delay
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 500); // 0.5s delay for message display
      } else {
        setMessage("❌ " + data.detail);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="admin-container">
      <form
        className="admin-form"
        onSubmit={handleSubmit}
        data-form-type="login"
      >
        <h2>Admin Login</h2>
        <input
          type="text"
          name="email_or_username"
          placeholder="Email or Username"
          value={formData.email_or_username}
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
        <button type="submit">Login</button>
        {message && <p className="message">{message}</p>}

        <div className="form-switch">
          Need an account? <a href="/admin/register">Register here</a>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
