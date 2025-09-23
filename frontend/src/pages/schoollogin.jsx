import React, { useState } from "react";
import axios from "axios";
import "./styling/schoollogin.css";

const SchoolLogin = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/schools/login", {
        email_or_username: emailOrUsername,
        password: password,
      });

      // Save token & school ID
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("school_id", response.data.school_id);

      alert("Login successful!");

      // Redirect to dashboard
      window.location.href = `/schools/dashboard/${response.data.school_id}`;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  
return (
    <div className="login-container">
      {/* Decorative elements */}
      <div className="form-decoration decoration-1"></div>
      <div className="form-decoration decoration-2"></div>
      
      <form className="login-form" onSubmit={handleLogin}>
        <h2>School Login</h2>

        {error && <p className="error">{error}</p>}

        <label>Email or Username</label>
        <input
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default SchoolLogin;
