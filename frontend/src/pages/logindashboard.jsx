import React from "react";
import { Link } from "react-router-dom";
import "./styling/logindashboard.css";

const LoginDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Login Dashboard</h1>
      <div className="login-boxes">
        <Link to="/admin/login" className="login-box admin">
          <h2>Admin Login</h2>
        </Link>

        <Link to="/schoollogin" className="login-box school">
          <h2>School Login</h2>
        </Link>

        <Link to="/student/login" className="login-box student">
          <h2>Student Login</h2>
        </Link>

        {/* <Link to="/facultylogin" className="login-box faculty">
          <h2>Faculty Login</h2>
        </Link> */}
      </div>
    </div>
  );
};

export default LoginDashboard;
