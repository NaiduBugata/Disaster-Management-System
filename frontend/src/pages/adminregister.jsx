import React, { useState } from "react";
import "./styling/admin.css";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
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
        data-form-type="register"
      >
        <h2>Admin Register</h2>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
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
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
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
        <button type="submit">Register</button>
        {message && <p className="message">{message}</p>}

        <div className="form-switch">
          Already have an account? <a href="/admin/login">Login here</a>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;
