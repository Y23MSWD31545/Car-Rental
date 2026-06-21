import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../componens/Buyacar.css";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Password validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username,
        email,
        password,
      };

      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        payload
      );

      if (response.data.success) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      if (err.response) {
        alert(
          "Registration failed: " +
          (err.response.data.message ||
            err.response.data ||
            "Unknown error")
        );
      } else {
        alert("An error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="contactusmaindiv">
        <h1>Register Now</h1>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            required
          />
          <br />

          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            required
          />
          <br />

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
          />
          <br />

          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Phone"
            required
          />
          <br />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
          <br />

          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
          />
          <br />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "3rem",
              textAlign: "center",
              backgroundColor: loading ? "#ccc" : "",
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already Have An Account <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;