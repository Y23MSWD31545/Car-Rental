import React from "react";
import "../index.css";

const Aboutus = () => {
  return (
    <div className="aboutusmaindiv">

      {/* About Us */}
      <div className="aboutuschilddiv">
        <div
          style={{
            fontSize: "1.15rem",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1>About Us</h1>

          <p>
            Premium Car Rental is a modern vehicle rental platform designed to
            provide safe, affordable, and convenient transportation solutions
            for customers.
          </p>

          <p>
            We offer a diverse fleet of well-maintained vehicles ranging from
            compact city cars to premium SUVs, ensuring the perfect choice for
            every journey.
          </p>

          <p>
            Our platform integrates advanced technology features such as online
            booking, AI-powered vehicle recommendations, GPS tracking, rental
            history management, and secure payment processing to deliver a
            seamless customer experience.
          </p>

          <h3 style={{ marginTop: "25px" }}>Key Features</h3>

          <ul
            style={{
              textAlign: "left",
              width: "70%",
              margin: "15px auto",
              lineHeight: "2rem",
            }}
          >
            <li>Wide range of vehicles for every travel need</li>
            <li>Easy online booking and reservation management</li>
            <li>AI-powered vehicle recommendation system</li>
            <li>Real-time GPS tracking and monitoring</li>
            <li>Transparent pricing with no hidden charges</li>
            <li>Secure and reliable payment system</li>
            <li>Dedicated customer support</li>
          </ul>
        </div>
      </div>

      {/* Vision */}
      <div className="aboutuschilddiv2">
        <div
          style={{
            fontSize: "1.15rem",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1>Our Vision</h1>

          <p>
            Our vision is to become a leading and trusted digital car rental
            platform by delivering exceptional customer experiences through
            innovation, technology, and service excellence.
          </p>

          <p>
            We strive to simplify mobility by providing smart, accessible, and
            reliable transportation solutions that meet the evolving needs of
            modern travelers.
          </p>

          <h3 style={{ marginTop: "25px" }}>Our Goals</h3>

          <ul
            style={{
              textAlign: "left",
              width: "70%",
              margin: "15px auto",
              lineHeight: "2rem",
            }}
          >
            <li>Enhance customer convenience through digital innovation</li>
            <li>Provide safe, reliable, and affordable rental services</li>
            <li>Promote sustainable and efficient transportation solutions</li>
            <li>Build long-term customer trust and satisfaction</li>
            <li>Continuously improve through technology and customer feedback</li>
            <li>Expand services across multiple cities and locations</li>
          </ul>
        </div>
      </div>

      {/* Contact Us */}
      <div
        className="aboutuschilddiv2"
        style={{
          marginTop: "2rem",
          textAlign: "center",
        }}
      >
        <h1>Contact Us</h1>

        <div
          style={{
            fontSize: "1.15rem",
            lineHeight: "2.5rem",
            marginTop: "1rem",
          }}
        >
          <p>📞 +91 9876543210</p>
          <p>📧 premiumcarrental@gmail.com</p>
          <p>📍 Hyderabad, Telangana, India</p>
          <p>🕒 Mon - Sat : 9:00 AM - 8:00 PM</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "4rem" }} className="footer">
        <div style={{ display: "flex", justifyContent: "space-around" }}>

          <div>
            <div className="footerheadings">About Us</div>

            <div className="footerele">
              Premium Car Rental provides safe, affordable and reliable
              transportation solutions with advanced booking and tracking
              features.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "7rem",
                paddingTop: "2rem",
                color: "#fff",
                fontSize: "2rem",
                gap: "10px",
              }}
            >
              <ion-icon name="logo-facebook"></ion-icon>
              <ion-icon name="logo-twitter"></ion-icon>
              <ion-icon name="logo-instagram"></ion-icon>
            </div>
          </div>

          <div>
            <div className="footerheadings">Quick Links</div>
            <div className="footerele">Book A Ride</div>
            <div className="footerele">GPS Tracking</div>
            <div className="footerele">AI Recommendations</div>
            <div className="footerele">About Us</div>
            <div className="footerele">Contact Us</div>
          </div>

          <div>
            <div className="footerheadings">Services</div>
            <div className="footerele">My Account</div>
            <div className="footerele">Rental History</div>
            <div className="footerele">Vehicle Booking</div>
            <div className="footerele">Become A Partner</div>
            <div className="footerele">FAQ</div>
          </div>

          <div>
            <img
              style={{
                width: "10rem",
                paddingTop: "2rem",
                borderRadius: "13px",
              }}
              src="https://media.istockphoto.com/id/1147099395/vector/car-icon-vector.jpg?s=612x612&w=0&k=20&c=qWxJ9r5yL8xOdlU9s2LyX-pWZ0tP_khynf0VhQwG4eg="
              alt="logo"
            />
          </div>

        </div>
      </div>

    </div>
  );
};

export default Aboutus;