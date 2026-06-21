import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./RentalHistory.css";

/* ─────────────────────────────────────────────
   Invoice Download — jsPDF (shared utility)
───────────────────────────────────────────── */
const downloadInvoice = (booking) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const car = booking.car;
  const carName = car ? `${car.brand} ${car.name}` : (booking.carName || "N/A");
  const username = booking.username || localStorage.getItem("username") || "Customer";

  // ── Dark header block ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 90, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("Premium CR", pageW / 2, 38, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text("Booking Invoice", pageW / 2, 60, { align: "center" });

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2);
  doc.line(40, 90, pageW - 40, 90);

  let y = 118;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #${booking.id}`, 40, y);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`Date: ${today}`, pageW - 40, y, { align: "right" });

  y += 24;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageW - 40, y);

  const row = (label, value, highlight = false) => {
    y += 28;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label, 48, y);

    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.setFontSize(highlight ? 11 : 10);
    doc.setTextColor(highlight ? 22 : 51, highlight ? 163 : 65, highlight ? 74 : 85);
    doc.text(String(value ?? "—"), 260, y);
  };

  y += 10;
  row("Booking ID",     `#${booking.id}`);
  row("Customer Name",  username);
  row("Car Name",       carName);
  row("Start Date",     booking.startDate || "—");
  row("End Date",       booking.endDate   || "—");
  row("Duration",       booking.duration ? `${booking.duration} Day${booking.duration !== 1 ? "s" : ""}` : "—");
  row("Total Amount",   booking.total ? `Rs. ${booking.total.toLocaleString()}` : "—", true);

  y += 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageW - 40, y);

  row("Transaction ID", booking.transactionId || "—");
  row("Payment Method", booking.paymentMethod || "—");
  row("Payment Date",   booking.paymentDate   || "—");
  row("Status",         booking.status?.toUpperCase() || "—");

  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.5);
  doc.line(40, footerY, pageW - 40, footerY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for choosing Premium CR", pageW / 2, footerY + 22, { align: "center" });
  doc.setFontSize(9);
  doc.text("www.premiumcr.com  |  support@premiumcr.com", pageW / 2, footerY + 38, { align: "center" });

  doc.save(`PremiumCR_Invoice_#${booking.id}.pdf`);
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const RentalHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/bookings/user/${username}`
        );
        const all = Array.isArray(res.data) ? res.data : [];
        setHistory(all.filter((b) => b.status?.toLowerCase() === "completed"));
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="rh-container">
      {/* HEADER */}
      <div className="rh-header">
        <div>
          <h1>🏁 Rental History</h1>
          <p>All your completed trips in one place</p>
        </div>
        <div className="rh-stat-pill">
          {history.length} Trip{history.length !== 1 ? "s" : ""} Completed
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rh-empty">
          <div className="rh-empty-icon">⏳</div>
          <h2>Loading your trip history...</h2>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && history.length === 0 && (
        <div className="rh-empty">
          <div className="rh-empty-icon">🚗</div>
          <h2>No completed trips yet</h2>
          <p>Complete a rental to see it here</p>
          <button className="rh-browse-btn" onClick={() => navigate("/buyacar")}>
            Browse Cars
          </button>
        </div>
      )}

      {/* CARDS */}
      {!loading && history.length > 0 && (
        <div className="rh-grid">
          {history.map((booking) => {
            const car = booking.car;
            return (
              <div key={booking.id} className="rh-card">

                {/* Image */}
                {car?.imageUrl && (
                  <div className="rh-img-wrap">
                    <img src={car.imageUrl} alt={car.name} className="rh-car-img" />
                    <span className="rh-badge-completed">✅ COMPLETED</span>
                  </div>
                )}
                {!car?.imageUrl && (
                  <div className="rh-img-placeholder">
                    <span>🚗</span>
                    <span className="rh-badge-completed">✅ COMPLETED</span>
                  </div>
                )}

                {/* Car info */}
                <div className="rh-card-body">
                  <h3 className="rh-car-name">
                    {car ? `${car.brand} ${car.name}` : booking.carName}
                  </h3>
                  {car?.brand && <p className="rh-brand">🏷️ {car.brand}</p>}

                  <div className="rh-details-grid">
                    <div className="rh-detail">
                      <span>Start Date</span>
                      <strong>{booking.startDate}</strong>
                    </div>
                    <div className="rh-detail">
                      <span>End Date</span>
                      <strong>{booking.endDate}</strong>
                    </div>
                    <div className="rh-detail">
                      <span>Duration</span>
                      <strong>{booking.duration} Day{booking.duration !== 1 ? "s" : ""}</strong>
                    </div>
                    <div className="rh-detail rh-total">
                      <span>Total Paid</span>
                      <strong className="rh-amount">₹{booking.total?.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Review display if exists */}
                  {booking.rating && booking.review && (
                    <div className="rh-review-display">
                      <div className="rh-review-stars">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} style={{ color: s <= booking.rating ? "#f59e0b" : "#d1d5db" }}>★</span>
                        ))}
                      </div>
                      <p className="rh-review-text">"{booking.review}"</p>
                    </div>
                  )}

                  {/* Invoice button */}
                  <button
                    className="rh-invoice-btn"
                    onClick={() => downloadInvoice(booking)}
                    type="button"
                  >
                    🧾 Download Invoice
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentalHistory;
