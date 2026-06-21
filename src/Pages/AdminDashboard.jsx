import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import useToast from "../components/useToast";
import "../components/toast.css";
import "./AdminDashboard.css";

/* ── PIE CHART COLORS matching dashboard badge palette ── */
const STATUS_COLORS = {
  pending:   "#f59e0b",
  approved:  "#3b82f6",
  paid:      "#22c55e",
  completed: "#10b981",
  cancelled: "#94a3b8",
  rejected:  "#ef4444",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const AdminDashboard = () => {

  const { showToast, ToastContainer } = useToast();

  const [formData, setFormData] = useState({
    id: null, name: "", brand: "", pricePerDay: "", fuelType: "Petrol",
    available: true, speed: "", seats: "", luggage: "", imageUrl: ""
  });

  const [isEditing, setIsEditing]   = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [cars, setCars]             = useState([]);
  const [bookings, setBookings]     = useState([]);

  // Booking modal state
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Search + filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── FETCH ──
  const fetchCars = async () => {
    const res = await axios.get("http://localhost:8080/api/cars");
    setCars(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get("http://localhost:8080/api/bookings");
    setBookings(res.data);
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  // ── MODAL HANDLERS ──
  const openBookingModal  = useCallback((booking) => setSelectedBooking(booking), []);
  const closeBookingModal = useCallback(() => setSelectedBooking(null), []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") closeBookingModal(); };
    if (selectedBooking) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedBooking, closeBookingModal]);

  // ── BOOKING ACTIONS ──
  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/bookings/approve/${id}`);
      fetchBookings();
      showToast(
        ["✅ Booking approved successfully.", "📧 Notification email sent to customer."],
        "success"
      );
    } catch (err) {
      console.error("Approve failed:", err);
      showToast("❌ Failed to approve booking. Please try again.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/bookings/reject/${id}`);
      fetchBookings();
      showToast(
        ["❌ Booking rejected successfully.", "📧 Notification email sent to customer."],
        "error"
      );
    } catch (err) {
      console.error("Reject failed:", err);
      showToast("⚠️ Failed to reject booking. Please try again.", "error");
    }
  };

  // ── CAR ACTIONS ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    await axios.delete(`http://localhost:8080/api/cars/${id}`);
    fetchCars();
  };

  const handleEdit = (car) => {
    setFormData(car);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      pricePerDay: Number(formData.pricePerDay),
      speed:       Number(formData.speed),
      seats:       Number(formData.seats),
      luggage:     Number(formData.luggage)
    };

    if (isEditing) {
      await axios.put(`http://localhost:8080/api/cars/${formData.id}`, formattedData);
      alert("Car updated successfully");
    } else {
      await axios.post("http://localhost:8080/api/cars", formattedData);
      alert("Car added successfully");
    }
    setShowForm(false);
    setIsEditing(false);
    fetchCars();
  };

  // ── HELPERS ──
  const getCarName = (req) => {
    if (req.carName) return req.carName;
    const carMatch = cars.find((c) => c.id === req.carId);
    return carMatch ? `${carMatch.brand} ${carMatch.name}` : `Car ID: ${req.carId}`;
  };

  // ── ANALYTICS ──
  const analytics = useMemo(() => {
    const byStatus = (s) => bookings.filter((b) => b.status?.toLowerCase() === s);
    const completed = byStatus("completed");
    const paid      = byStatus("paid");

    // Revenue = paid + completed bookings total
    const totalRevenue = [...completed, ...paid].reduce((sum, b) => sum + (b.total || 0), 0);

    // Most booked car
    const carFreq = {};
    bookings.forEach((b) => {
      const name = getCarName(b);
      carFreq[name] = (carFreq[name] || 0) + 1;
    });
    const mostBooked = Object.entries(carFreq).sort((a, b) => b[1] - a[1])[0];

    // ── Average Rating ──
    const ratedBookings = bookings.filter((b) => b.rating != null && b.rating > 0);
    const avgRating = ratedBookings.length
      ? (ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length)
      : 0;

    return {
      totalRevenue,
      completed:   completed.length,
      paid:        paid.length,
      cancelled:   byStatus("cancelled").length,
      pending:     byStatus("pending").length,
      mostBooked:  mostBooked ? mostBooked[0] : "N/A",
      avgRating:   Math.round(avgRating * 10) / 10,
      reviewCount: ratedBookings.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, cars]);

  // ── FILTERED BOOKINGS ──
  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status?.toLowerCase() === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.username?.toLowerCase().includes(q) ||
          getCarName(b).toLowerCase().includes(q)
      );
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, statusFilter, searchQuery, cars]);

  // ── RECENT ACTIVITY (latest 5) ──
  const recentActivity = useMemo(() => {
    return [...bookings]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [bookings]);

  // ── RECENT REVIEWS (latest 5 with review text) ──
  const recentReviews = useMemo(() => {
    return [...bookings]
      .filter((b) => b.rating != null && b.review)
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [bookings]);

  // ── MONTHLY REVENUE DATA (for bar chart) ──
  const monthlyRevenueData = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if ((b.status?.toLowerCase() === "completed" || b.status?.toLowerCase() === "paid")
          && b.paymentDate && b.total) {
        // paymentDate is YYYY-MM-DD
        const parts = b.paymentDate.split("-");
        if (parts.length >= 2) {
          const monthIdx = parseInt(parts[1], 10) - 1; // 0-indexed
          const year     = parts[0];
          const key      = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
          map[key] = (map[key] || 0) + (b.total || 0);
        }
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => {
        const [year, mon] = key.split("-");
        return { month: `${MONTH_NAMES[parseInt(mon, 10) - 1]} ${year}`, revenue };
      });
  }, [bookings]);

  // ── STATUS PIE DATA ──
  const statusPieData = useMemo(() => {
    const statuses = ["pending", "approved", "paid", "completed", "cancelled", "rejected"];
    return statuses
      .map((s) => ({
        name:  s.charAt(0).toUpperCase() + s.slice(1),
        value: bookings.filter((b) => b.status?.toLowerCase() === s).length,
        color: STATUS_COLORS[s],
      }))
      .filter((d) => d.value > 0);
  }, [bookings]);

  const statusBadgeClass = (status) => {
    const map = {
      pending:   "adm-badge-pending",
      approved:  "adm-badge-approved",
      paid:      "adm-badge-paid",
      completed: "adm-badge-completed",
      rejected:  "adm-badge-rejected",
      cancelled: "adm-badge-cancelled",
    };
    return `adm-badge ${map[status?.toLowerCase()] || ""}`;
  };

  // ── Star row helper ──
  const StarRow = ({ rating, size = "1rem" }) => (
    <span className="adm-star-row" style={{ fontSize: size }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );

  return (
    <>
      <div className="admin-container">

      {/* ── TOP HEADER ── */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage cars, bookings and monitor analytics</p>
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData({ id: null, name: "", brand: "", pricePerDay: "", fuelType: "Petrol", available: true, speed: "", seats: "", luggage: "", imageUrl: "" });
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add New Car"}
        </button>
      </div>

      {/* ── ANALYTICS CARDS ── */}
      <div className="adm-analytics-grid">
        <div className="adm-analytics-card adm-card-revenue">
          <div className="adm-analytics-icon">💰</div>
          <div className="adm-analytics-value">₹{analytics.totalRevenue.toLocaleString()}</div>
          <div className="adm-analytics-label">Total Revenue</div>
        </div>
        <div className="adm-analytics-card adm-card-completed">
          <div className="adm-analytics-icon">✅</div>
          <div className="adm-analytics-value">{analytics.completed}</div>
          <div className="adm-analytics-label">Completed Trips</div>
        </div>
        <div className="adm-analytics-card adm-card-paid">
          <div className="adm-analytics-icon">💳</div>
          <div className="adm-analytics-value">{analytics.paid}</div>
          <div className="adm-analytics-label">Paid Trips</div>
        </div>
        <div className="adm-analytics-card adm-card-cancelled">
          <div className="adm-analytics-icon">🚫</div>
          <div className="adm-analytics-value">{analytics.cancelled}</div>
          <div className="adm-analytics-label">Cancelled Trips</div>
        </div>
        <div className="adm-analytics-card adm-card-pending">
          <div className="adm-analytics-icon">⏳</div>
          <div className="adm-analytics-value">{analytics.pending}</div>
          <div className="adm-analytics-label">Pending Requests</div>
        </div>
        <div className="adm-analytics-card adm-card-car">
          <div className="adm-analytics-icon">🏆</div>
          <div className="adm-analytics-value adm-car-name-val">{analytics.mostBooked}</div>
          <div className="adm-analytics-label">Most Booked Car</div>
        </div>

        {/* ── NEW: Average Rating Card ── */}
        <div className="adm-analytics-card adm-card-rating">
          <div className="adm-analytics-icon">⭐</div>
          <div className="adm-rating-stars-row">
            {[1,2,3,4,5].map((s) => (
              <span key={s} className={`adm-rating-star ${s <= Math.round(analytics.avgRating) ? "lit" : "dim"}`}>★</span>
            ))}
          </div>
          <div className="adm-analytics-value adm-rating-num">
            {analytics.reviewCount > 0 ? analytics.avgRating.toFixed(1) : "—"}
          </div>
          <div className="adm-analytics-label">Average Rating</div>
          {analytics.reviewCount > 0 && (
            <div className="adm-rating-count">{analytics.reviewCount} review{analytics.reviewCount !== 1 ? "s" : ""}</div>
          )}
        </div>
      </div>

      {/* ── CHARTS ── */}
      <div className="adm-charts-row">

        {/* Monthly Revenue Bar Chart */}
        <div className="adm-chart-card">
          <h2 className="adm-section-heading">📈 Monthly Revenue</h2>
          {monthlyRevenueData.length === 0 ? (
            <div className="adm-chart-empty">No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenueData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={52}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Booking Status Pie Chart */}
        <div className="adm-chart-card">
          <h2 className="adm-section-heading">🥧 Booking Status</h2>
          {statusPieData.length === 0 ? (
            <div className="adm-chart-empty">No booking data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  formatter={(value) => <span style={{ fontSize: 12, color: "#334155" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="adm-section">
        <h2 className="adm-section-heading">⚡ Recent Activity</h2>
        <div className="adm-activity-list">
          {recentActivity.length === 0 && (
            <div className="adm-empty">
              <span>📭</span> No bookings yet.
            </div>
          )}
          {recentActivity.map((b, i) => (
            <div key={b.id} className="adm-activity-item">
              <div className="adm-activity-index">{i + 1}</div>
              <div className="adm-activity-info">
                <strong>👤 {b.username}</strong>
                <span>🚗 {getCarName(b)}</span>
              </div>
              <div className="adm-activity-right">
                <span className={statusBadgeClass(b.status)}>{b.status?.toUpperCase()}</span>
                <span className="adm-activity-date">{b.startDate || "—"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CUSTOMER REVIEWS ── */}
      <div className="adm-section">
        <h2 className="adm-section-heading">⭐ Customer Reviews</h2>
        {recentReviews.length === 0 ? (
          <div className="adm-reviews-empty">
            <span>💬</span>
            <p>No customer reviews yet.</p>
          </div>
        ) : (
          <div className="adm-reviews-grid">
            {recentReviews.map((b) => (
              <div key={b.id} className="adm-review-card">
                {/* Avatar + Name */}
                <div className="adm-review-header">
                  <div className="adm-review-avatar">
                    {b.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="adm-review-meta">
                    <span className="adm-review-username">{b.username}</span>
                    <span className="adm-review-car">{getCarName(b)}</span>
                  </div>
                  <div className="adm-review-stars">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`adm-rev-star ${s <= b.rating ? "lit" : "dim"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="adm-review-text">"{b.review}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{isEditing ? "✏️ Edit Car" : "🚗 Add New Car"}</h2>
          <form className="admin-form" onSubmit={handleAddCar}>
            <input type="text" placeholder="Car Name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="text" placeholder="Brand" value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
            <input type="number" placeholder="Price / Day" value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })} required />
            <select value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
            <input type="number" placeholder="Speed (km/h)" value={formData.speed}
              onChange={(e) => setFormData({ ...formData, speed: e.target.value })} />
            <input type="number" placeholder="Seats" value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })} />
            <input type="number" placeholder="Luggage (bags)" value={formData.luggage}
              onChange={(e) => setFormData({ ...formData, luggage: e.target.value })} />
            <input type="text" placeholder="Image URL" value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            <button type="submit">{isEditing ? "Update Car" : "Save Car"}</button>
          </form>
        </div>
      )}

      {/* ── BOOKINGS TABLE ── */}
      <div className="adm-section">
        <div className="adm-table-header">
          <h2 className="adm-section-heading">📋 Booking Requests</h2>
          <div className="adm-controls">
            <input
              type="text"
              className="adm-search"
              placeholder="🔍 Search by username or car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="adm-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {filteredBookings.length === 0 ? (
            <div className="adm-empty adm-empty-padded">
              <span>🔍</span>
              <span>No bookings match your filter.</span>
            </div>
          ) : (
            <div className="adm-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Car</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>TXN ID</th>
                    <th>Method</th>
                    <th>Paid On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((req) => (
                    <tr key={req.id} className="adm-booking-row" onClick={() => openBookingModal(req)} title="Click to view booking details">
                      <td>#{req.id}</td>
                      <td><strong>{req.username}</strong></td>
                      <td>{getCarName(req)}</td>
                      <td>{req.startDate}</td>
                      <td>{req.endDate}</td>
                      <td>{req.duration} Days</td>
                      <td>₹{req.total?.toLocaleString()}</td>
                      <td>
                        <span className={statusBadgeClass(req.status)}>
                          {req.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {req.transactionId
                          ? <span className="adm-txn-id">{req.transactionId}</span>
                          : <span className="adm-done-text">—</span>}
                      </td>
                      <td>
                        {req.paymentMethod || <span className="adm-done-text">—</span>}
                      </td>
                      <td>
                        {req.paymentDate || <span className="adm-done-text">—</span>}
                      </td>
                      <td>
                        {req.status?.toLowerCase() === "pending" ? (
                          <div className="action-cells" onClick={(e) => e.stopPropagation()}>
                            <button className="edit-btn" onClick={() => handleApprove(req.id)}>✅ Approve</button>
                            <button className="del-btn"  onClick={() => handleReject(req.id)}>❌ Reject</button>
                          </div>
                        ) : (
                          <span className="adm-done-text">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CARS TABLE ── */}
      <div className="adm-section">
        <h2 className="adm-section-heading">🚗 Current Inventory</h2>
        <div className="table-container">
          {cars.length === 0 ? (
            <div className="adm-empty adm-empty-padded">
              <span>🏎️</span>
              <span>No cars in inventory.</span>
            </div>
          ) : (
            <div className="adm-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Car Name</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Fuel</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>#{car.id}</td>
                      <td><strong>{car.name}</strong></td>
                      <td>{car.brand}</td>
                      <td>₹{car.pricePerDay?.toLocaleString()}</td>
                      <td>{car.fuelType}</td>
                      <td>
                        <span className={car.available ? "adm-avail-badge" : "adm-unavail-badge"}>
                          {car.available ? "Available" : "Booked"}
                        </span>
                      </td>
                      <td className="action-cells">
                        <button className="edit-btn" onClick={() => handleEdit(car)}>✏️ Edit</button>
                        <button className="del-btn"  onClick={() => handleDelete(car.id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>

      {/* ── BOOKING DETAILS MODAL ── */}
      {selectedBooking && (
        <div className="booking-modal-overlay" onClick={closeBookingModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">

            {/* Header */}
            <div className="booking-modal-header">
              <div className="booking-modal-title-wrap">
                <span className="booking-modal-icon">📄</span>
                <h2 id="booking-modal-title">Booking Details <span className="booking-modal-id">#{selectedBooking.id}</span></h2>
              </div>
              <button className="booking-modal-close" onClick={closeBookingModal} aria-label="Close modal">✕</button>
            </div>

            <div className="booking-modal-body">

              {/* ── SECTION 1: Booking Information ── */}
              <div className="booking-section">
                <h3 className="booking-section-title">🗂️ Booking Information</h3>
                <div className="booking-detail-grid">
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Booking ID</span>
                    <span className="booking-detail-value booking-detail-id">#{selectedBooking.id}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Customer</span>
                    <span className="booking-detail-value">{selectedBooking.username || "—"}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Car</span>
                    <span className="booking-detail-value">{getCarName(selectedBooking)}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Start Date</span>
                    <span className="booking-detail-value">{selectedBooking.startDate || "—"}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">End Date</span>
                    <span className="booking-detail-value">{selectedBooking.endDate || "—"}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Duration</span>
                    <span className="booking-detail-value">
                      {selectedBooking.duration != null
                        ? `${selectedBooking.duration} ${selectedBooking.duration === 1 ? "Day" : "Days"}`
                        : "—"}
                    </span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Total Amount</span>
                    <span className="booking-detail-value booking-detail-amount">
                      ₹{selectedBooking.total?.toLocaleString() ?? "—"}
                    </span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Status</span>
                    <span className={`booking-status-badge ${statusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Payment Information ── */}
              <div className="booking-section">
                <h3 className="booking-section-title">💳 Payment Information</h3>
                <div className="booking-detail-grid">
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Transaction ID</span>
                    <span className="booking-detail-value">
                      {selectedBooking.transactionId
                        ? <span className="adm-txn-id">{selectedBooking.transactionId}</span>
                        : <span className="booking-na">Not Available</span>}
                    </span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Payment Method</span>
                    <span className="booking-detail-value">
                      {selectedBooking.paymentMethod || <span className="booking-na">Not Available</span>}
                    </span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Payment Date</span>
                    <span className="booking-detail-value">
                      {selectedBooking.paymentDate || <span className="booking-na">Not Available</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: Customer Feedback ── */}
              <div className="booking-section">
                <h3 className="booking-section-title">⭐ Customer Feedback</h3>
                <div className="booking-detail-grid">
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">Rating</span>
                    <span className="booking-detail-value">
                      {selectedBooking.rating != null && selectedBooking.rating > 0 ? (
                        <span className="booking-stars">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={s <= Math.round(selectedBooking.rating) ? "bstar bstar-lit" : "bstar bstar-dim"}>★</span>
                          ))}
                          <span className="booking-stars-num">({selectedBooking.rating})</span>
                        </span>
                      ) : (
                        <span className="booking-na">No rating submitted</span>
                      )}
                    </span>
                  </div>
                  <div className="booking-detail-row booking-review-row">
                    <span className="booking-detail-label">Review</span>
                    <span className="booking-detail-value">
                      {selectedBooking.review
                        ? <span className="booking-review-text">"{selectedBooking.review}"</span>
                        : <span className="booking-na">No review submitted</span>}
                    </span>
                  </div>
                </div>
              </div>

            </div>{/* end body */}
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastContainer />

    </>
  );
};

export default AdminDashboard;