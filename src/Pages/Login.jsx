import React, { useState } from "react";
import axios from "axios";
import "../componens/Buyacar.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username,
          password,
        }
      );

      console.log("Login API Response:", response.data);

      if (response.data.success) {
        const user = response.data.user;

        // 🔥 CLEAR OLD DATA (important)
        localStorage.clear();

        // ✅ Store full user object
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
        window.location.reload()

        // 🔥 IMPORTANT FIX (used in booking)
        localStorage.setItem("username", user.username);

        // ✅ Redirect based on role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      if (!err.response) {
        setError("Server not responding");
      } else if (err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (typeof err.response.data === "string") {
        setError(err.response.data);
      } else {
        setError("Invalid credentials or User not found");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-login"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#ccc" : undefined,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p id="register-label">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "green" }}>
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;