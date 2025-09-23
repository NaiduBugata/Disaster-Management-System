// src/pages/SchoolDashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function SchoolDashboard() {
  const { id } = useParams(); // 👈 get school_id from URL
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/schools/dashboard/${id}`, // 👈 use id
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSchool(response.data.school);
        setStudents(response.data.students);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    if (id && token) {
      fetchDashboard();
    }
  }, [id, token]);

  // 📂 Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ⬆️ Upload students file
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `http://localhost:8000/students/bulk-upload?school_id=${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Students uploaded successfully ✅");

      // Refresh data after upload
      const refreshed = await axios.get(
        `http://localhost:8000/schools/dashboard/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(refreshed.data.students);
      setStats(refreshed.data.stats);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed ❌");
    }
  };

  // ⬇️ Download students
  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/students/download/${id}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `students_school_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>School Dashboard</h1>

      {school ? (
        <div>
          <h2>{school.school_name}</h2>
          <p>Type: {school.school_type}</p>
          <p>Region/State: {stats.region_state}</p>
          <p>Total Staff: {stats.total_staff}</p>
          <p>Total Students: {stats.total_students}</p>

          <hr />

          <h3>Students</h3>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.username}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <h3>Upload Students (CSV/XLSX)</h3>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          <p>{message}</p>

          <h3>Download Students</h3>
          <button onClick={handleDownload}>Download CSV</button>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </div>
  );
}

export default SchoolDashboard;
