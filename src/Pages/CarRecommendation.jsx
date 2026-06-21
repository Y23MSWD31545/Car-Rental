import React, { useState, useContext } from "react";
import "./CarRecommendation.css";
import { CarContext } from "../context/CarContext";
import BookingModal from "../componens/BookingModal";

const CarRecommendation = () => {
  const {
    cars = [],
    bookingRequests = [],
    requestBooking = () => ({ success: true, message: "Booking requested." }),
  } = useContext(CarContext) || {};

  const [budget, setBudget] = useState("");
  const [fuel, setFuel] = useState("");
  const [purpose, setPurpose] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);

  const handleBookingSubmit = (bookingData) => {
    if (!bookingData) {
      setSelectedCar(null);
      return;
    }

    const result = requestBooking(
      bookingData.carId,
      bookingData.startDate,
      bookingData.endDate,
      bookingData.totalDays,
      bookingData.totalAmount,
      bookingData.carName
    );

    if (!result?.success) {
      alert(result?.message || "Unable to send booking request.");
    } else {
      alert("Booking Request Sent to Admin!");
    }
    setSelectedCar(null); // Close modal
  };

  // --- AI Weighted Scoring Engine ---
  const scoreCar = (car, budgetVal, fuelVal, purposeVal) => {
    let score = 0;
    const reasons = [];

    // Budget Match (40 pts)
    if (budgetVal) {
      const numericBudget = parseInt(budgetVal, 10);
      if (!isNaN(numericBudget) && numericBudget > 0 && typeof car.pricePerDay === "number") {
        if (car.pricePerDay <= numericBudget) {
          score += 40;
          reasons.push("Fits your budget");
        } else if (car.pricePerDay <= numericBudget * 1.2) {
          score += 25;
          reasons.push("Slightly above budget");
        }
      }
    }

    // Fuel Match (20 pts)
    if (fuelVal && car.fuel === fuelVal) {
      score += 20;
      reasons.push("Matches fuel preference");
    }

    // Purpose Match (30 pts)
    if (purposeVal && car.purpose === purposeVal) {
      score += 30;
      reasons.push("Perfect for your purpose");
    }

    // Mileage Bonus (10 pts)
    if (typeof car.mileage === "number") {
      if (car.mileage >= 20) {
        score += 10;
        reasons.push("Excellent mileage");
      } else if (car.mileage >= 15) {
        score += 5;
        reasons.push("Good mileage");
      }
    }

    return { ...car, aiScore: score, reasons };
  };

  const handleRecommend = (e) => {
    e.preventDefault();
    if (!budget || !fuel || !purpose) {
      setMessage("Please fill out all fields.");
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setMessage("");
    setRecommendations([]);

    setTimeout(() => {
      const safeCars = Array.isArray(cars) ? cars : [];

      if (safeCars.length === 0) {
        setMessage("No vehicles available right now. Please check back later.");
        setRecommendations([]);
        setLoading(false);
        return;
      }

      const scoredCars = safeCars.map((car) => scoreCar(car, budget, fuel, purpose));

      const sortedByScore = [...scoredCars].sort((a, b) => b.aiScore - a.aiScore);

      // Prefer cars with a real positive match, but never return blank
      // results when cars exist — fall back to best-available top 4.
      let topCars = sortedByScore.filter((car) => car.aiScore > 0).slice(0, 4);

      if (topCars.length === 0) {
        topCars = sortedByScore.slice(0, 4);
      }

      setRecommendations(topCars);

      if (topCars.length === 0) {
        setMessage("No recommendation found. Try increasing budget.");
      } else if (topCars.every((car) => car.aiScore === 0)) {
        setMessage("No exact matches found — showing closest available vehicles.");
      } else {
        setMessage("🤖 AI found the best vehicles for you");
      }

      setLoading(false);
    }, 1500); // Simulate AI loading
  };

  // --- Booking status helper ---
  const getBookingStatus = (carId) => {
    const safeRequests = Array.isArray(bookingRequests) ? bookingRequests : [];
    const carBookings = safeRequests.filter((b) => b?.carId === carId);

    const activeBooking = carBookings.find(
      (b) => b.status === "approved" || b.status === "active"
    );
    const latestBooking = carBookings.length ? carBookings[carBookings.length - 1] : null;

    return { activeBooking, latestBooking };
  };

  return (
    <div className="cr-container">
      <div className="cr-header">
        <h1>AI Car Recommendation</h1>
        <p>Best cars to rent based on your needs</p>
      </div>

      <div className="cr-content">
        <div className="cr-form-section">
          <form onSubmit={handleRecommend} className="cr-form">
            <div className="form-group">
              <label>Budget (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Fuel Type</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="">Select Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option value="">Select Purpose</option>
                <option value="City">City Drive</option>
                <option value="Family">Family</option>
                <option value="Long Drive">Long Drive</option>
                <option value="Off-road">Off-road</option>
              </select>
            </div>

            <button type="submit" className="cr-btn" disabled={loading}>
              {loading ? <span className="loader">Analyzing...</span> : "Recommend Cars"}
            </button>
          </form>
        </div>

        <div className="cr-results-section">
          {message && (
            <h3 className={`cr-message ${message.includes("No exact") ? "cr-warning" : "cr-success"}`}>
              {message}
            </h3>
          )}

          <div className="cr-cards-grid">
            {recommendations.map((car, index) => {
              const { activeBooking, latestBooking } = getBookingStatus(car.id);
              const rank = index + 1;

              return (
                <div key={car.id ?? `${car.name}-${index}`} className="cr-card" style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: "15px", left: "15px" }}>
                    <span
                      style={{
                        background: "#eef2ff",
                        color: "#4338ca",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      Rank #{rank}
                    </span>
                  </div>

                  <div style={{ position: "absolute", top: "15px", right: "15px" }}>
                    {activeBooking ? (
                      <span style={{ background: "#fef2f2", color: "#ef4444", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        Booked
                      </span>
                    ) : (
                      <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        Available
                      </span>
                    )}
                  </div>

                  <div className="cr-card-icon" style={{ marginTop: "10px" }}>
                    {car.image}
                  </div>

                  <h2 className="cr-card-title" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {car.name}
                    {activeBooking && (
                      <p
                        className="booking-info"
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          display: "inline-block",
                          marginTop: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Booked from {activeBooking.startDate} to {activeBooking.endDate}
                      </p>
                    )}
                  </h2>

                  <div
                    style={{
                      background: "#eef6ff",
                      color: "#2563eb",
                      padding: "8px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    🤖 AI Match : {car.aiScore}%
                  </div>

                  <div className="cr-card-details">
                    <p><span>Price/Day:</span> ₹{car.pricePerDay?.toLocaleString?.() ?? car.pricePerDay}</p>
                    <p><span>Fuel:</span> {car.fuel}</p>
                    <p><span>Type:</span> {car.purpose}</p>
                    <p>
                      <span>{car.fuel === "Electric" ? "Range:" : "Mileage:"}</span>{" "}
                      {car.mileage} {car.fuel === "Electric" ? "km/charge" : "kmpl"}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      background: "#f8fafc",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <strong>Why Recommended?</strong>

                    <ul style={{ marginTop: "5px", paddingLeft: "20px" }}>
                      {car.reasons && car.reasons.length > 0 ? (
                        car.reasons.map((reason, idx) => <li key={idx}>✓ {reason}</li>)
                      ) : (
                        <li>Closest available match to your search</li>
                      )}
                    </ul>
                  </div>

                  {activeBooking ? (
                    <button
                      className="cr-card-btn"
                      style={{ background: "#9ca3af", color: "white", borderColor: "#9ca3af", cursor: "not-allowed" }}
                      disabled
                    >
                      Not Available
                    </button>
                  ) : car.availability === false ? (
                    <button
                      className="cr-card-btn"
                      style={{ background: "#94a3b8", color: "white", borderColor: "#94a3b8", cursor: "not-allowed" }}
                      disabled
                    >
                      Booked
                    </button>
                  ) : latestBooking?.status === "pending" ? (
                    <button
                      className="cr-card-btn"
                      style={{ background: "#fef9c3", color: "#ca8a04", borderColor: "#fde047" }}
                      disabled
                    >
                      Request Sent
                    </button>
                  ) : latestBooking?.status === "rejected" ? (
                    <button className="cr-card-btn" onClick={() => setSelectedCar(car)}>
                      Request Again
                    </button>
                  ) : (
                    <button className="cr-card-btn" onClick={() => setSelectedCar(car)}>
                      Request Booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Booking Modal Injection --- */}
      {selectedCar && (
        <BookingModal car={selectedCar} onClose={() => setSelectedCar(null)} onSubmit={handleBookingSubmit} />
      )}
    </div>
  );
};

export default CarRecommendation;