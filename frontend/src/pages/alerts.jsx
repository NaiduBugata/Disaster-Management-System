import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import Chart from "chart.js/auto";
import "leaflet/dist/leaflet.css";
import "./styling/alerts.css";

const API_BASE = "http://localhost:8000";

export default function DisasterManagement() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [persons, setPersons] = useState([]);
  const [stats, setStats] = useState([]);

  const chartRef = useRef(null);    // store chart instance
  const mapRef = useRef(null);      // ref for map container
  const mapInstance = useRef(null); // store map instance

  // Initialize Leaflet map only when dashboard is active
  useEffect(() => {
    if (activeSection !== "dashboard") return;

    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeSection]);

  // Fetch functions
  const loadDonations = async () => {
    try {
      const res = await fetch(`${API_BASE}/donations`);
      setDonations(await res.json());
    } catch (err) {
      console.error("Error fetching donations", err);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests`);
      setRequests(await res.json());
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const loadPersons = async () => {
    try {
      const res = await fetch(`${API_BASE}/persons`);
      setPersons(await res.json());
    } catch (err) {
      console.error("Error fetching persons", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/donations/stats`);
      setStats(await res.json());
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDonations();
    loadRequests();
    loadPersons();
    loadStats();
  }, []);

  // Render chart whenever stats or dashboard tab changes
  useEffect(() => {
    if (activeSection !== "dashboard" || stats.length === 0) return;

    const ctx = document.getElementById("statsChart");
    if (!ctx) return;

    // Destroy old chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: stats.map((s) => s.category),
        datasets: [
          {
            label: "Donation Quantities",
            data: stats.map((s) => s.total),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
          },
        ],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [stats, activeSection]);

  return (
    <div className="container">
      <header>
        <h1>Disaster Management System</h1>
        <nav>
          {["dashboard", "donations", "requests", "personnel"].map((section) => (
            <button
              key={section}
              className={`nav-btn ${activeSection === section ? "active" : ""}`}
              onClick={() => setActiveSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <section id="dashboard" className="section active">
            <div className="dashboard-grid">
              <div className="card map-card">
                <h2>Donation Locations</h2>
                <div ref={mapRef} style={{ height: "400px" }}></div>
              </div>
              <div className="card stats-card">
                <h2>Donation Statistics</h2>
                <canvas id="statsChart"></canvas>
              </div>
            </div>
          </section>
        )}

        {/* Donations */}
        {activeSection === "donations" && (
          <section id="donations" className="section active">
            <h2>Donation Management</h2>
            <div className="content-grid">
              <div className="card">
                <h3>All Donations</h3>
                {donations.map((don) => (
                  <div key={don.id} className="list-item">
                    <h4>{don.item_name}</h4>
                    <p>
                      Category: {don.category} | Quantity: {don.quantity}
                    </p>
                    <p>Location: {don.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Requests */}
        {activeSection === "requests" && (
          <section id="requests" className="section active">
            <h2>Request Management</h2>
            <div className="content-grid">
              <div className="card">
                <h3>Manage Requests</h3>
                {requests.map((req) => (
                  <div key={req.id} className="list-item">
                    <h4>{req.item_needed}</h4>
                    <p>Location: {req.location}</p>
                    <p>Status: {req.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Personnel */}
        {activeSection === "personnel" && (
          <section id="personnel" className="section active">
            <h2>Personnel Management</h2>
            <div className="content-grid">
              <div className="card">
                <h3>All Personnel</h3>
                {persons.map((p) => (
                  <div key={p.id} className="list-item">
                    <h4>{p.name}</h4>
                    <p>
                      Role: {p.role} | {p.allocated ? "Allocated" : "Available"}
                    </p>
                    {p.email && <p>Email: {p.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
