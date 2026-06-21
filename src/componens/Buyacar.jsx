import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../componens/Buyacar.css";
import Carcards from "../Pages/Carcards";
import car1 from "../imgs/car1.avif";
import { useNavigate } from "react-router-dom";
import { CarContext } from "../context/CarContext";
import BookingModal from "./BookingModal";

/* ─────────────────────────────────────────────
   CarReviewBadge — avg rating + 2 snippets
───────────────────────────────────────────── */
const CarReviewBadge = ({ carId, allBookings }) => {
  const carReviews = useMemo(() => {
    return allBookings.filter(
      (b) =>
        b.status?.toLowerCase() === "completed" &&
        b.rating != null &&
        b.review &&
        // match by car.id if nested car object present, else carId field
        (b.car?.id === carId || b.carId === carId)
    );
  }, [allBookings, carId]);

  if (carReviews.length === 0) return null;

  const avg = carReviews.reduce((s, b) => s + b.rating, 0) / carReviews.length;
  const avgRounded = Math.round(avg * 10) / 10;
  const recent = [...carReviews].sort((a, b) => b.id - a.id).slice(0, 2);

  return (
    <div className="cr-badge-wrap">
      {/* Rating summary */}
      <div className="cr-rating-summary">
        <span className="cr-stars-row">
          {[1,2,3,4,5].map((s) => (
            <span key={s} style={{ color: s <= Math.round(avg) ? "#f59e0b" : "#d1d5db" }}>★</span>
          ))}
        </span>
        <span className="cr-avg-num">{avgRounded.toFixed(1)}</span>
        <span className="cr-review-count">({carReviews.length} Review{carReviews.length !== 1 ? "s" : ""})</span>
      </div>

      {/* Recent review snippets */}
      <div className="cr-snippets">
        {recent.map((b) => (
          <div key={b.id} className="cr-snippet">
            <div className="cr-snippet-stars">
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ color: s <= b.rating ? "#f59e0b" : "#d1d5db", fontSize: "0.85rem" }}>★</span>
              ))}
            </div>
            <p className="cr-snippet-text">"{b.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Buyacar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarBooking, setSelectedCarBooking] = useState(null);
  const [cars, setCars] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/cars");
        setCars(response.data);
      } catch (error) {
        console.log("Error fetching cars:", error);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/bookings");
        setAllBookings(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Error fetching bookings for reviews:", error);
        setAllBookings([]);
      }
    };

    fetchCars();
    fetchBookings();
  }, []);


  const handleBookNow = (car) => {
    console.log("SELECTED CAR:", car); // 🔍 DEBUG
    setSelectedCarBooking(car); // ✅ store original car
  };

  const handleBookingSubmit = async (bookingData) => {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please login first to book a car.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/bookings", {
        carId: selectedCarBooking.id,
        username: username,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      });

      alert(response.data);

      // Refresh UI after booking
      window.location.reload();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed: " + (error.response?.data || "Server error"));
    }

    setSelectedCarBooking(null);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filteredCars = cars.filter(
      car => (car.brand && car.brand.toLowerCase().includes(query)) ||
        (car.name && car.name.toLowerCase().includes(query))
    );

    setSearchResults(filteredCars);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderCarCards = (cars) => {
    return cars.map((car, index) => {
      console.log("Car data:", car);
      return (
        <div key={car.id}>
          <Carcards
            one={car.customPickup !== false ? "Custom picking available" : "Standard pickup"}
            two={`${car.brand || ""} ${car.name || ""}`}
            three={car.imageUrl || car1}
            four1={<ion-icon name="speedometer-outline"></ion-icon>}
            four2={<ion-icon name="people-outline"></ion-icon>}
            four3={<ion-icon name="bag-remove-outline"></ion-icon>}
            five1={car.speed ? `${car.speed} Km/h` : "N/A"}
            five2={car.seats ? `${car.seats} Seater` : "N/A"}
            five3={car.luggage ? `${car.luggage} luggage` : "N/A"}
            six1={`₹${car.pricePerDay ? car.pricePerDay.toLocaleString() : 0}/day`}
            six2={
              car.available === false ? (
                <button disabled style={{ background: '#9ca3af', cursor: 'not-allowed' }}>Not Available</button>
              ) : (
                <button onClick={() => handleBookNow(car)}>Rent Now</button>
              )
            }
          />
          {/* Public review badge injected below each car card */}
          <CarReviewBadge carId={car.id} allBookings={allBookings} />
        </div>
      )
    });
  };

  // Function to split cars into chunks of given size
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  return (
    <section className="buyacar">
      <div className="head">
        <h2>Which Vehicle Do You Want For Your Journey?</h2>
      </div>
      <div className="div1">
        <span>
          <span>
            <ion-icon name="diamond-outline"></ion-icon>
          </span>{" "}
          PRE-
        </span>{" "}
        <h3>
          Start Your Week In Style: Book Now & Save up to 10% on midweek
          bookings <a href="#" onClick={handleOpenModal}>Terms and conditions apply</a>
        </h3>{" "}
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for car company or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <ion-icon name="search-outline"></ion-icon>
          </button>
        </div>
      </div>

      <div>
        {searchResults !== null ? (
          searchResults.length > 0 ? (
            <div className="carrow">
              {renderCarCards(searchResults)}
            </div>
          ) : (
            <div className="no-results">
              <h3>No cars available from "{searchQuery}"</h3>
              <p>Please try searching for a different car company or model.</p>
            </div>
          )
        ) : (
          <>
            {/* Display all cars in chunks of 3 */}
            {chunkArray(cars, 3).map((carChunk, index) => (
              <div className="carrow" key={index}>
                {renderCarCards(carChunk)}
              </div>
            ))}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h3>Terms and Conditions</h3>
            <ul>
              <li>1. Renters must be at least 21 years old with a valid driving license.</li>
              <li>2. A refundable security deposit is required before the rental period.</li>
              <li>3. Cars must be returned with the same fuel level as at pickup.</li>
              <li>4. Late returns will incur additional charges.</li>
              <li>5. Smoking inside the rental cars is strictly prohibited.</li>
              <li>6. Any damages to the vehicle must be reported immediately.</li>
              <li>7. Rental prices are subject to availability and seasonal changes.</li>
              <li>8. The company reserves the right to cancel bookings under unforeseen circumstances.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="footer">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>
            <div className="footerheadings">About Us</div>
            <div className="footerele">
              Lorem ipsum dolor sit amet consectetur <br /> adipis distinctio ac
              harum perspiciatis non eius. <br /> harum perspiciatis non eius.
              harum perspiciatis <br /> non eius. perspiciatis non eius. <br />
              harum perspiciatis non eius. harum
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "7.5rem",
                paddingTop: "2rem",
                color: "#fff",
                fontSize: "2rem",
              }}
            >
              <ion-icon name="logo-facebook"></ion-icon>{" "}
              <ion-icon name="logo-twitter"></ion-icon>
              <ion-icon name="logo-instagram"></ion-icon>
            </div>
          </div>
          <div>
            <div className="footerheadings">Quick Links</div>
            <div className="footerele">Book A Ride</div>
            <div className="footerele">Become A driver</div>
            <div className="footerele">Our Services</div>
            <div className="footerele">About Us</div>
            <div className="footerele">Contact Us</div>
          </div>
          <div>
            <div className="footerheadings">Product</div>
            <div className="footerele">My Account </div>
            <div className="footerele">Blog</div>
            <div className="footerele">Invest Your Car</div>
            <div className="footerele">Become A Partner</div>
            <div className="footerele">FAQ</div>
          </div>
          <div>
            <img
              style={{
                width: "10rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: "2rem",
                borderRadius: "13px",
              }}
              src="https://media.istockphoto.com/id/1147099395/vector/car-icon-vector.jpg?s=612x612&w=0&k=20&c=qWxJ9r5yL8xOdlU9s2LyX-pWZ0tP_khynf0VhQwG4eg="
              alt="logo"
            />
          </div>
        </div>
      </div>
      {selectedCarBooking && (
        <BookingModal
          car={selectedCarBooking}
          onClose={() => setSelectedCarBooking(null)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </section>
  );
};

export default Buyacar;