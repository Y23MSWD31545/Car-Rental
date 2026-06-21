import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username") || "Guest";
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : {};
  const role = userData.role || "user";

  useEffect(() => {
    if (!username || username === "Guest") {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/bookings/user/${username}`
        );
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, username]);

  const count = (status) =>
    bookings.filter((b) => b.status?.toLowerCase() === status).length;

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "📋", color: "stat-blue" },
    { label: "Completed Trips", value: count("completed"), icon: "✅", color: "stat-green" },
    { label: "Pending", value: count("pending"), icon: "⏳", color: "stat-yellow" },
    { label: "Approved", value: count("approved"), icon: "👍", color: "stat-indigo" },
    { label: "Paid", value: count("paid"), icon: "💰", color: "stat-emerald" },
    { label: "Cancelled", value: count("cancelled"), icon: "🚫", color: "stat-red" },
  ];

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="prof-container">
      {/* PROFILE CARD */}
      <div className="prof-card">
        <div className="prof-avatar">{initials}</div>
        <div className="prof-info">
          <h1 className="prof-username">{username}</h1>
          <span className={`prof-role-badge ${role === "admin" ? "prof-role-admin" : "prof-role-user"}`}>
            {role === "admin" ? "👑 Admin" : "🙋 User"}
          </span>
          <p className="prof-email-hint">Logged in as <strong>{username}</strong></p>
        </div>
      </div>

      {/* STATS */}
      <div className="prof-section-title">📊 Booking Statistics</div>

      {loading ? (
        <div className="prof-loading">Loading statistics...</div>
      ) : (
        <div className="prof-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className={`prof-stat-card ${s.color}`}>
              <div className="prof-stat-icon">{s.icon}</div>
              <div className="prof-stat-value">{s.value}</div>
              <div className="prof-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK LINKS */}
      <div className="prof-section-title">🔗 Quick Actions</div>
      <div className="prof-actions">
        <button className="prof-action-btn" onClick={() => navigate("/my-bookings")}>
          📋 My Bookings
        </button>
        <button className="prof-action-btn" onClick={() => navigate("/rental-history")}>
          🏁 Rental History
        </button>
        <button className="prof-action-btn" onClick={() => navigate("/buyacar")}>
          🚗 Browse Cars
        </button>
        {role === "admin" && (
          <button className="prof-action-btn prof-action-admin" onClick={() => navigate("/admin")}>
            👑 Admin Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
