// AdminDashboard.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styling/admindashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken"); // JWT from login
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // -------------------- State --------------------
  // School registration
  const [schoolData, setSchoolData] = useState({
    school_name: "",
    school_type: "",
    address: "",
    region_state: "",
    contact_info: "",
    num_students: "",
    num_staff: "",
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    password: "",
    terms_accepted: false,
    emergency_contact_pref: "",
  });

  // Admin password update
  const [adminPassword, setAdminPassword] = useState({
    admin_id: "",
    old_password: "",
    new_password: "",
  });

  // School password update
  const [schoolPassword, setSchoolPassword] = useState({
    school_id: "",
    old_password: "",
    new_password: "",
  });

  // Delete admin & school
  const [deleteAdminId, setDeleteAdminId] = useState("");
  const [deleteSchoolId, setDeleteSchoolId] = useState("");

  // -------------------- Handlers --------------------
  const handleSchoolRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...schoolData,
        num_students: Number(schoolData.num_students),
        num_staff: Number(schoolData.num_staff),
        terms_accepted: Boolean(schoolData.terms_accepted),
      };

      const res = await axios.post(
        "http://localhost:8000/schools/register",
        payload,
        config
      );

      alert(res.data.message);

      // Reset form
      setSchoolData({
        school_name: "",
        school_type: "",
        address: "",
        region_state: "",
        contact_info: "",
        num_students: "",
        num_staff: "",
        admin_name: "",
        admin_email: "",
        admin_phone: "",
        password: "",
        terms_accepted: false,
        emergency_contact_pref: "",
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Error registering school");
    }
  };

  const handleAdminPasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:8000/admin/update-password",
        adminPassword,
        config
      );
      alert(res.data.message);
      setAdminPassword({ admin_id: "", old_password: "", new_password: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Error updating admin password");
    }
  };

  const handleSchoolPasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:8000/schools/update-password",
        schoolPassword,
        config
      );
      alert(res.data.message);
      setSchoolPassword({ school_id: "", old_password: "", new_password: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Error updating school password");
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      const res = await axios.delete("http://localhost:8000/admin/delete", {
        headers: config.headers,
        data: { admin_id: deleteAdminId },
      });
      alert(res.data.message);
      setDeleteAdminId("");
    } catch (err) {
      alert(err.response?.data?.detail || "Error deleting admin");
    }
  };

  const handleDeleteSchool = async () => {
    try {
      const res = await axios.delete("http://localhost:8000/schools/delete", {
        headers: config.headers,
        data: { school_id: deleteSchoolId },
      });
      alert(res.data.message);
      setDeleteSchoolId("");
    } catch (err) {
      alert(err.response?.data?.detail || "Error deleting school");
    }
  };

  // -------------------- JSX --------------------
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* ---------------- Manage Courses ---------------- */}
      <section>
        <h2>Courses</h2>
        <button onClick={() => navigate("/admin/create-course")}>
          ➕ Create New Course
        </button>
      </section>

      {/* ---------------- School Registration ---------------- */}
      <section>
        <h2>Register School</h2>
        <form onSubmit={handleSchoolRegister}>
          <input
            placeholder="School Name"
            value={schoolData.school_name}
            onChange={(e) =>
              setSchoolData({ ...schoolData, school_name: e.target.value })
            }
            required
          />
          <input
            placeholder="School Type"
            value={schoolData.school_type}
            onChange={(e) =>
              setSchoolData({ ...schoolData, school_type: e.target.value })
            }
            required
          />
          <input
            placeholder="Address"
            value={schoolData.address}
            onChange={(e) =>
              setSchoolData({ ...schoolData, address: e.target.value })
            }
            required
          />
          <input
            placeholder="Region/State"
            value={schoolData.region_state}
            onChange={(e) =>
              setSchoolData({ ...schoolData, region_state: e.target.value })
            }
            required
          />
          <input
            placeholder="Contact Info"
            value={schoolData.contact_info}
            onChange={(e) =>
              setSchoolData({ ...schoolData, contact_info: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Number of Students"
            value={schoolData.num_students}
            onChange={(e) =>
              setSchoolData({ ...schoolData, num_students: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Number of Staff"
            value={schoolData.num_staff}
            onChange={(e) =>
              setSchoolData({ ...schoolData, num_staff: e.target.value })
            }
            required
          />
          <input
            placeholder="Admin Name"
            value={schoolData.admin_name}
            onChange={(e) =>
              setSchoolData({ ...schoolData, admin_name: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Admin Email"
            value={schoolData.admin_email}
            onChange={(e) =>
              setSchoolData({ ...schoolData, admin_email: e.target.value })
            }
            required
          />
          <input
            placeholder="Admin Phone"
            value={schoolData.admin_phone}
            onChange={(e) =>
              setSchoolData({ ...schoolData, admin_phone: e.target.value })
            }
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={schoolData.password}
            onChange={(e) =>
              setSchoolData({ ...schoolData, password: e.target.value })
            }
            required
          />
          <input
            placeholder="Emergency Contact Preference"
            value={schoolData.emergency_contact_pref}
            onChange={(e) =>
              setSchoolData({
                ...schoolData,
                emergency_contact_pref: e.target.value,
              })
            }
            required
          />
          <label>
            <input
              type="checkbox"
              checked={schoolData.terms_accepted}
              onChange={(e) =>
                setSchoolData({
                  ...schoolData,
                  terms_accepted: e.target.checked,
                })
              }
            />
            Accept Terms & Conditions
          </label>
          <button type="submit">Register School</button>
        </form>
      </section>

      {/* ---------------- Update Admin Password ---------------- */}
      <section>
        <h2>Update Admin Password</h2>
        <form onSubmit={handleAdminPasswordUpdate}>
          <input
            placeholder="Admin ID"
            value={adminPassword.admin_id}
            onChange={(e) =>
              setAdminPassword({ ...adminPassword, admin_id: e.target.value })
            }
            required
          />
          <input
            placeholder="Old Password"
            type="password"
            value={adminPassword.old_password}
            onChange={(e) =>
              setAdminPassword({
                ...adminPassword,
                old_password: e.target.value,
              })
            }
            required
          />
          <input
            placeholder="New Password"
            type="password"
            value={adminPassword.new_password}
            onChange={(e) =>
              setAdminPassword({
                ...adminPassword,
                new_password: e.target.value,
              })
            }
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </section>

      {/* ---------------- Update School Password ---------------- */}
      <section>
        <h2>Update School Password</h2>
        <form onSubmit={handleSchoolPasswordUpdate}>
          <input
            placeholder="School ID"
            value={schoolPassword.school_id}
            onChange={(e) =>
              setSchoolPassword({ ...schoolPassword, school_id: e.target.value })
            }
            required
          />
          <input
            placeholder="Old Password"
            type="password"
            value={schoolPassword.old_password}
            onChange={(e) =>
              setSchoolPassword({
                ...schoolPassword,
                old_password: e.target.value,
              })
            }
            required
          />
          <input
            placeholder="New Password"
            type="password"
            value={schoolPassword.new_password}
            onChange={(e) =>
              setSchoolPassword({
                ...schoolPassword,
                new_password: e.target.value,
              })
            }
            required
          />
          <button type="submit">Update School Password</button>
        </form>
      </section>

      {/* ---------------- Delete Admin ---------------- */}
      <section>
        <h2>Delete Admin</h2>
        <input
          placeholder="Admin ID"
          value={deleteAdminId}
          onChange={(e) => setDeleteAdminId(e.target.value)}
        />
        <button onClick={handleDeleteAdmin}>Delete Admin</button>
      </section>

      {/* ---------------- Delete School ---------------- */}
      <section>
        <h2>Delete School</h2>
        <input
          placeholder="School ID"
          value={deleteSchoolId}
          onChange={(e) => setDeleteSchoolId(e.target.value)}
        />
        <button onClick={handleDeleteSchool}>Delete School</button>
      </section>
    </div>
  );
};

export default AdminDashboard;
