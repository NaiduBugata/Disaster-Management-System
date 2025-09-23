// src/pages/StudentLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/studentlogin.css";

function StudentLogin() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_or_username: emailOrUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // ✅ Save token and IDs in localStorage
      localStorage.setItem("student_token", data.token);
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("school_id", data.school_id);

      setMessage("Login successful ✅");

      // ✅ Navigate using dynamic route with student_id
      navigate(`/student/dashboard/${data.student_id}`);
    } catch (error) {
      setMessage(`Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-container">
      <h2>Student Login</h2>
      <form onSubmit={handleLogin} className="student-login-form">
        <div className="form-group">
          <label>Email or Username:</label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            placeholder="Enter email or username"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}

export default StudentLogin;
