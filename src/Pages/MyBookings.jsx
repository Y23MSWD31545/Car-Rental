import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import useToast from "../components/useToast";
import "../components/toast.css";
import "./MyBookings.css";

/* ─────────────────────────────────────────────
   Invoice Download — jsPDF
───────────────────────────────────────────── */
const downloadInvoice = (booking) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const car = booking.car;
  const carName = car ? `${car.brand} ${car.name}` : (booking.carName || "N/A");
  const username = booking.username || localStorage.getItem("username") || "Customer";

  // ── Gradient header block ──
  doc.setFillColor(15, 23, 42);          // #0f172a
  doc.rect(0, 0, pageW, 90, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("Premium CR", pageW / 2, 38, { align: "center" });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);       // #94a3b8
  doc.text("Booking Invoice", pageW / 2, 60, { align: "center" });

  // Divider line
  doc.setDrawColor(34, 197, 94);         // green
  doc.setLineWidth(2);
  doc.line(40, 90, pageW - 40, 90);

  // Invoice number + date
  let y = 118;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);       // #64748b
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #${booking.id}`, 40, y);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`Date: ${today}`, pageW - 40, y, { align: "right" });

  y += 24;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageW - 40, y);

  // ── Helper: draw a label + value row ──
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
  row("Booking ID",      `#${booking.id}`);
  row("Customer Name",   username);
  row("Car Name",        carName);
  row("Start Date",      booking.startDate || "—");
  row("End Date",        booking.endDate   || "—");
  row("Duration",        booking.duration ? `${booking.duration} Day${booking.duration !== 1 ? "s" : ""}` : "—");
  row("Total Amount",    booking.total ? `Rs. ${booking.total.toLocaleString()}` : "—", true);

  // Divider
  y += 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageW - 40, y);

  row("Transaction ID",  booking.transactionId || "—");
  row("Payment Method",  booking.paymentMethod || "—");
  row("Payment Date",    booking.paymentDate   || "—");
  row("Status",          booking.status?.toUpperCase() || "—");

  // ── Footer ──
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
   ReviewSection — shows form OR submitted review
───────────────────────────────────────────── */
const ReviewSection = ({ booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If booking already has a review, show the display card
  if (booking.rating && booking.review) {
    return (
      <div className="mb-review-display">
        <div className="mb-review-display-header">
          <span className="mb-review-display-title">⭐ Your Review</span>
          <div className="mb-review-stars-display">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`mb-review-star-icon ${s <= booking.rating ? "lit" : "dim"}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <p className="mb-review-display-text">"{booking.review}"</p>
      </div>
    );
  }

  // Show success state after fresh submission
  if (success) {
    return (
      <div className="mb-review-success">
        <div className="mb-review-success-icon">🎉</div>
        <p className="mb-review-success-title">Review Submitted!</p>
        <p className="mb-review-success-sub">Thank you for your feedback.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");

    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    if (!reviewText.trim()) {
      setError("Please write a review before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `http://localhost:8080/api/bookings/review/${booking.id}`,
        { rating, review: reviewText.trim() }
      );
      setSuccess(true);
      onReviewSubmitted(booking.id, rating, reviewText.trim());
    } catch (err) {
      console.error("Review submission failed:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-review-form">
      <div className="mb-review-form-header">
        <span className="mb-review-form-title">⭐ Rate Your Trip</span>
      </div>

      {/* Star Picker */}
      <div className="mb-review-stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`mb-review-star-btn ${star <= (hover || rating) ? "active" : ""}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            type="button"
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="mb-review-rating-label">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        className="mb-review-textarea"
        placeholder="Write your review..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <span className="mb-review-char-count">{reviewText.length}/500</span>

      {/* Error */}
      {error && <p className="mb-review-error">⚠ {error}</p>}

      {/* Submit */}
      <button
        className="mb-review-submit-btn"
        onClick={handleSubmit}
        disabled={submitting}
        type="button"
      >
        {submitting ? (
          <span className="mb-btn-loading">
            <span className="mb-spinner" /> Submitting...
          </span>
        ) : (
          "Submit Review"
        )}
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PaymentInfo sub-component
───────────────────────────────────────────── */
const PaymentInfo = ({ booking }) => {
  if (!booking.transactionId && !booking.paymentMethod && !booking.paymentDate) return null;
  return (
    <div className="mb-pay-info">
      {booking.transactionId && (
        <div className="mb-pay-info-row">
          <span className="mb-pay-info-label">🔑 TXN ID</span>
          <span className="mb-pay-info-value mb-txn-mono">{booking.transactionId}</span>
        </div>
      )}
      {booking.paymentMethod && (
        <div className="mb-pay-info-row">
          <span className="mb-pay-info-label">💳 Method</span>
          <span className="mb-pay-info-value">{booking.paymentMethod}</span>
        </div>
      )}
      {booking.paymentDate && (
        <div className="mb-pay-info-row">
          <span className="mb-pay-info-label">📅 Paid On</span>
          <span className="mb-pay-info-value">{booking.paymentDate}</span>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const MyBookings = () => {
  const navigate = useNavigate();

  const { showToast, ToastContainer } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const fetchUserBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/bookings/user/${username}`
        );
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [navigate]);

  // ── REVIEW SUBMITTED — update local state ──
  const handleReviewSubmitted = (bookingId, rating, review) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, rating, review } : b
      )
    );
  };

  // ── CANCEL BOOKING ──
  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/bookings/cancel/${bookingId}`
      );
      alert(res.data);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  // ── NAVIGATE TO PAYMENT ──
  const handlePaymentNavigation = (booking) => {
    navigate("/payment", { state: { booking } });
  };

  // ── COMPLETE TRIP ──
  const completeTrip = async (bookingId) => {
    setCompletingId(bookingId);
    try {
      const res = await axios.put(
        `http://localhost:8080/api/bookings/complete/${bookingId}`
      );
      const updated = res.data || {};
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "completed", ...updated }
            : b
        )
      );
      showToast(
        ["🎉 Trip completed successfully.", "📧 Completion email sent to customer."],
        "success"
      );
    } catch (err) {
      console.error("Complete trip failed:", err);
      showToast("❌ Failed to complete trip. Please try again.", "error");
    } finally {
      setCompletingId(null);
    }
  };

  // ── STATUS ACTION RENDERER ──
  const renderActions = (booking) => {
    const status = booking.status?.toLowerCase();

    switch (status) {
      case "pending":
        return (
          <>
            <p className="mb-status-msg pending-msg">
              ⏳ Waiting for Admin Approval...
            </p>
            <button
              onClick={() => handleCancelBooking(booking.id)}
              className="mb-cancel-btn"
            >
              ❌ Cancel Booking
            </button>
          </>
        );

      case "approved":
        return (
          <button
            onClick={() => handlePaymentNavigation(booking)}
            className="mb-payment-btn"
          >
            💳 Make Payment
          </button>
        );

      case "paid":
        return (
          <>
            <div className="mb-paid-section">
              <p className="mb-status-msg trip-active-msg">🚗 Trip Active</p>
              <PaymentInfo booking={booking} />
            </div>
            <div className="mb-paid-actions">
              <button
                onClick={() => completeTrip(booking.id)}
                className="mb-complete-btn"
                disabled={completingId === booking.id}
              >
                {completingId === booking.id ? (
                  <span className="mb-btn-loading">
                    <span className="mb-spinner" /> Completing...
                  </span>
                ) : (
                  "✅ Complete Trip"
                )}
              </button>
              <button
                className="mb-invoice-btn"
                onClick={() => downloadInvoice(booking)}
                type="button"
              >
                🧾 Download Invoice
              </button>
            </div>
          </>
        );

      case "completed":
        return (
          <div className="mb-completed-section">
            <p className="mb-status-msg completed-msg">✅ Trip Completed</p>
            <PaymentInfo booking={booking} />
            <button
              className="mb-invoice-btn"
              onClick={() => downloadInvoice(booking)}
              type="button"
            >
              🧾 Download Invoice
            </button>
            <ReviewSection
              booking={booking}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
        );

      case "cancelled":
        return (
          <p className="mb-status-msg rejected-msg">🚫 Booking Cancelled</p>
        );

      case "rejected":
        return (
          <p className="mb-status-msg rejected-msg">❌ Booking Rejected</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-container">
      <div className="mb-header">
        <div>
          <h1>My Bookings</h1>
          <p>Manage your rental requests and payments</p>
        </div>
      </div>

      <div className="mb-list">
        {loading && (
          <div className="mb-empty">
            <div className="mb-empty-icon">⏳</div>
            <h2>Loading your bookings...</h2>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="mb-empty">
            <div className="mb-empty-icon">🚗</div>
            <h2>No Bookings Found</h2>
            <p>You haven't made any bookings yet</p>
            <button
              onClick={() => navigate("/buyacar")}
              className="mb-browse-btn"
            >
              Browse Cars
            </button>
          </div>
        )}

        {!loading &&
          bookings.map((booking) => {
            const car = booking.car;

            return (
              <div key={booking.id} className="mb-card">

                {/* 🚗 IMAGE */}
                {car?.imageUrl && (
                  <img
                    src={car.imageUrl}
                    alt="car"
                    className="mb-car-image"
                  />
                )}

                {/* HEADER */}
                <div className="mb-card-header">
                  <h3>
                    {car ? `${car.brand} ${car.name}` : booking.carName}
                  </h3>
                  <span className={`mb-badge mb-badge-${booking.status?.toLowerCase()}`}>
                    {booking.status?.toUpperCase()}
                  </span>
                </div>

                {/* CAR DETAILS */}
                {car && (
                  <div className="mb-extra">
                    <p>💰 ₹{car.pricePerDay}/day</p>
                    <p>👥 {car.seats} Seater</p>
                    <p>⚡ {car.speed} Km/h</p>
                  </div>
                )}

                {/* BOOKING DATES */}
                <div className="mb-card-body">
                  <div className="mb-detail">
                    <span>Start Date</span>
                    <strong>{booking.startDate}</strong>
                  </div>
                  <div className="mb-detail">
                    <span>End Date</span>
                    <strong>{booking.endDate}</strong>
                  </div>
                  {booking.duration && (
                    <div className="mb-detail">
                      <span>Duration</span>
                      <strong>{booking.duration} Day{booking.duration !== 1 ? "s" : ""}</strong>
                    </div>
                  )}
                  {booking.total && (
                    <div className="mb-detail">
                      <span>Total</span>
                      <strong className="mb-amount">₹{booking.total?.toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mb-card-actions">
                  {renderActions(booking)}
                </div>

              </div>
            );
          })}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastContainer />

    </div>
  );
};

export default MyBookings;