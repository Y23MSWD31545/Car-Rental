import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payment.css";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state?.booking || {
    id: 1,
    carName: "BMW X5",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    duration: 2,
    total: 30000,
  };

  // Payment method
  const [selectedMethod, setSelectedMethod] = useState("upi");

  // UPI
  const [upiId, setUpiId] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Net Banking
  const [bank, setBank] = useState("SBI");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paidBooking, setPaidBooking] = useState(null); // returned from backend

  // Validation errors
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const newErrors = {};
    if (selectedMethod === "upi") {
      if (!upiId.trim()) newErrors.upiId = "UPI ID is required";
      else if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId))
        newErrors.upiId = "Enter a valid UPI ID (e.g. name@upi)";
    } else if (selectedMethod === "card") {
      if (!cardNumber.replace(/\s/g, "") || cardNumber.replace(/\s/g, "").length < 16)
        newErrors.cardNumber = "Enter a valid 16-digit card number";
      if (!cardHolder.trim()) newErrors.cardHolder = "Card holder name is required";
      if (!expiry || expiry.length < 5) newErrors.expiry = "Enter valid expiry (MM/YY)";
      if (!cvv || cvv.length < 3) newErrors.cvv = "Enter valid 3-digit CVV";
    } else if (selectedMethod === "netbanking") {
      if (!bank) newErrors.bank = "Please select a bank";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setLoading(true);

    const txnId = "TXN" + Date.now();

    // Map selectedMethod to a clean label for the backend
    const methodLabel =
      selectedMethod === "upi"
        ? "UPI"
        : selectedMethod === "card"
        ? "CARD"
        : `NETBANKING_${bank}`;

    try {
      const res = await axios.put(
        `http://localhost:8080/api/bookings/pay/${booking.id}`,
        {
          transactionId: txnId,
          paymentMethod: methodLabel,
        }
      );

      setTransactionId(txnId);
      // Store the full updated booking returned by the backend
      setPaidBooking(res.data || { ...booking, transactionId: txnId, paymentMethod: methodLabel });
      setLoading(false);
      setSuccess(true);

    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    // Use values from the returned booking object, fall back to local state
    const b = paidBooking || {};
    const displayTxn      = b.transactionId  || transactionId;
    const displayMethod   = b.paymentMethod  || "—";
    const displayDate     = b.paymentDate    || new Date().toLocaleDateString("en-IN");
    const displayCar      = b.carName        || booking.carName;
    const displayAmount   = b.total          ?? booking.total;
    const displayId       = b.id             || booking.id;

    return (
      <div className="pay-page">
        <div className="pay-success-card">
          <div className="pay-success-icon">
            <div className="pay-checkmark-circle">
              <svg viewBox="0 0 52 52" className="pay-checkmark-svg">
                <circle cx="26" cy="26" r="25" fill="none" className="pay-checkmark-circle-path" />
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="pay-checkmark-tick" />
              </svg>
            </div>
          </div>
          <h2 className="pay-success-title">Payment Successful!</h2>
          <p className="pay-success-subtitle">Your booking has been confirmed</p>

          <div className="pay-success-details">
            <div className="pay-success-row">
              <span className="pay-success-label">🔖 Booking ID</span>
              <span className="pay-success-value"># {displayId}</span>
            </div>
            <div className="pay-success-row">
              <span className="pay-success-label">🚗 Car</span>
              <span className="pay-success-value">{displayCar}</span>
            </div>
            <div className="pay-success-row">
              <span className="pay-success-label">💰 Amount Paid</span>
              <span className="pay-success-value pay-amount-green">₹{displayAmount?.toLocaleString()}</span>
            </div>
            <div className="pay-success-row">
              <span className="pay-success-label">🔑 Transaction ID</span>
              <span className="pay-success-value pay-txn-id">{displayTxn}</span>
            </div>
            <div className="pay-success-row">
              <span className="pay-success-label">💳 Payment Method</span>
              <span className="pay-success-value">{displayMethod}</span>
            </div>
            <div className="pay-success-row">
              <span className="pay-success-label">📅 Payment Date</span>
              <span className="pay-success-value">{displayDate}</span>
            </div>
          </div>

          <div className="pay-success-actions">
            <button className="pay-btn-secondary" onClick={() => navigate("/my-bookings")}>
              ← Back to My Bookings
            </button>
            <button className="pay-btn-home" onClick={() => navigate("/")}>
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-page">
      <div className="pay-card">

        {/* ── HEADER ── */}
        <div className="pay-header">
          <div className="pay-header-icon">💳</div>
          <h1 className="pay-title">Complete Payment</h1>
          <p className="pay-subtitle">Secure & encrypted payment gateway</p>
        </div>

        {/* ── BOOKING SUMMARY ── */}
        <div className="pay-summary">
          <h3 className="pay-section-title">📋 Booking Summary</h3>
          <div className="pay-summary-grid">
            <div className="pay-summary-item">
              <span className="pay-label">Booking ID</span>
              <span className="pay-value"># {booking.id}</span>
            </div>
            <div className="pay-summary-item">
              <span className="pay-label">Car Name</span>
              <span className="pay-value">{booking.carName}</span>
            </div>
            <div className="pay-summary-item">
              <span className="pay-label">Start Date</span>
              <span className="pay-value">{booking.startDate}</span>
            </div>
            <div className="pay-summary-item">
              <span className="pay-label">End Date</span>
              <span className="pay-value">{booking.endDate}</span>
            </div>
            <div className="pay-summary-item">
              <span className="pay-label">Duration</span>
              <span className="pay-value">{booking.duration} Day{booking.duration > 1 ? "s" : ""}</span>
            </div>
            <div className="pay-summary-item pay-total-row">
              <span className="pay-label">Total Amount</span>
              <span className="pay-value pay-total-amount">₹{booking.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── PAYMENT METHODS ── */}
        <div className="pay-methods-section">
          <h3 className="pay-section-title">💳 Select Payment Method</h3>
          <div className="pay-methods-grid">
            {[
              { id: "upi", label: "UPI", icon: "📱", desc: "Pay via UPI ID" },
              { id: "card", label: "Debit / Credit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
              { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All major banks" },
            ].map((method) => (
              <div
                key={method.id}
                className={`pay-method-card ${selectedMethod === method.id ? "pay-method-active" : ""}`}
                onClick={() => {
                  setSelectedMethod(method.id);
                  setErrors({});
                }}
              >
                <div className="pay-method-icon">{method.icon}</div>
                <div className="pay-method-info">
                  <span className="pay-method-name">{method.label}</span>
                  <span className="pay-method-desc">{method.desc}</span>
                </div>
                <div className={`pay-method-radio ${selectedMethod === method.id ? "pay-radio-active" : ""}`} />
              </div>
            ))}
          </div>
        </div>

        {/* ── UPI FORM ── */}
        {selectedMethod === "upi" && (
          <div className="pay-form-section">
            <h3 className="pay-section-title">📱 UPI Payment</h3>
            <div className="pay-field">
              <label className="pay-field-label">UPI ID</label>
              <input
                type="text"
                className={`pay-input ${errors.upiId ? "pay-input-error" : upiId ? "pay-input-valid" : ""}`}
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              {errors.upiId && <span className="pay-error-msg">{errors.upiId}</span>}
            </div>
          </div>
        )}

        {/* ── CARD FORM ── */}
        {selectedMethod === "card" && (
          <div className="pay-form-section">
            <h3 className="pay-section-title">💳 Card Details</h3>
            <div className="pay-field">
              <label className="pay-field-label">Card Number</label>
              <input
                type="text"
                className={`pay-input ${errors.cardNumber ? "pay-input-error" : cardNumber.replace(/\s/g, "").length === 16 ? "pay-input-valid" : ""}`}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                maxLength={19}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              />
              {errors.cardNumber && <span className="pay-error-msg">{errors.cardNumber}</span>}
            </div>
            <div className="pay-field">
              <label className="pay-field-label">Card Holder Name</label>
              <input
                type="text"
                className={`pay-input ${errors.cardHolder ? "pay-input-error" : cardHolder ? "pay-input-valid" : ""}`}
                placeholder="John Doe"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
              {errors.cardHolder && <span className="pay-error-msg">{errors.cardHolder}</span>}
            </div>
            <div className="pay-fields-row">
              <div className="pay-field">
                <label className="pay-field-label">Expiry Date</label>
                <input
                  type="text"
                  className={`pay-input ${errors.expiry ? "pay-input-error" : expiry.length === 5 ? "pay-input-valid" : ""}`}
                  placeholder="MM/YY"
                  value={expiry}
                  maxLength={5}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
                {errors.expiry && <span className="pay-error-msg">{errors.expiry}</span>}
              </div>
              <div className="pay-field">
                <label className="pay-field-label">CVV</label>
                <input
                  type="password"
                  className={`pay-input ${errors.cvv ? "pay-input-error" : cvv.length === 3 ? "pay-input-valid" : ""}`}
                  placeholder="• • •"
                  value={cvv}
                  maxLength={3}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
                {errors.cvv && <span className="pay-error-msg">{errors.cvv}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── NET BANKING ── */}
        {selectedMethod === "netbanking" && (
          <div className="pay-form-section">
            <h3 className="pay-section-title">🏦 Net Banking</h3>
            <div className="pay-field">
              <label className="pay-field-label">Select Your Bank</label>
              <select
                className={`pay-input pay-select ${errors.bank ? "pay-input-error" : "pay-input-valid"}`}
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="Axis">Axis Bank</option>
              </select>
              {errors.bank && <span className="pay-error-msg">{errors.bank}</span>}
            </div>
          </div>
        )}

        {/* ── PAY BUTTON ── */}
        <button
          className={`pay-btn-pay ${loading ? "pay-btn-loading" : ""}`}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? (
            <span className="pay-loader-wrap">
              <span className="pay-spinner" />
              Processing Payment...
            </span>
          ) : (
            `Pay ₹${booking.total?.toLocaleString()}`
          )}
        </button>

        <p className="pay-secure-note">
          🔒 Your payment is 256-bit SSL encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default Payment;