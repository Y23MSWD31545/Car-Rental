import React, { useState, useEffect } from "react";
import "./BookingModal.css";

const BookingModal = ({ car, onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Require strict numerical prop
  const numericPrice = car.pricePerDay;

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setTotalDays(diffDays);
        setTotalAmount(diffDays * numericPrice);
      } else {
        setTotalDays(0);
        setTotalAmount(0);
      }
    }
  }, [startDate, endDate, numericPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both dates.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      // Only logically triggers if user manipulates DOM directly due to HTML5 constraints, but safe
      alert("End date must be exclusively after Start date.");
      return;
    }

    // Pass detailed payload back up
    onSubmit({
      startDate,
      endDate,
      totalDays,
      totalAmount
    });
  };


  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  return (
    <div className="bm-overlay">
      <div className="bm-modal">
        <button className="bm-close" onClick={onClose}>&times;</button>
        <h2>Book {car.name || `${car.company} ${car.model}`}</h2>

        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="bm-form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || getTomorrow()}
              required
            />
          </div>

          <div className="bm-summary">
            <p><strong>Total Days:</strong> {totalDays} days</p>
            <p><strong>Price/Day:</strong> ₹{numericPrice.toLocaleString()}</p>
            <h3>Total Amount: ₹{totalAmount.toLocaleString()}</h3>
          </div>

          <button type="submit" className="bm-submit-btn" disabled={totalDays <= 0}>
            Send Booking Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
