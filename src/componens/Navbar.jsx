import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = () => {
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <NavLink to="/" className="logo">
          Premium CR
        </NavLink>

        {/* Navigation Links */}
        <ul className="nav-links">

          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/buyacar"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              BookCar
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/recommend"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              AI Recommend
            </NavLink>
          </li>

          {/* GPS Tracker */}
          {(!user || user.role !== "admin") && (
            <li>
              <NavLink
                to="/gpstracker"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                GPS Tracker
              </NavLink>
            </li>
          )}

          {/* User Links */}
          {user && user.role !== "admin" && (
            <>
              <li>
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  My Bookings
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/rental-history"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Rental History
                </NavLink>
              </li>
            </>
          )}

          {/* About after Rental History */}
          {(!user || user.role !== "admin") && (
            <li>
              <NavLink
                to="/aboutus"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About Us
              </NavLink>
            </li>
          )}

          {/* Admin Dashboard */}
          {user && user.role === "admin" && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `admin-btn${isActive ? " active" : ""}`
                }
              >
                Admin Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        {/* Right Side */}
        <div className="right-section">
          {!user ? (
            <NavLink to="/login">
              <button className="login-btn">
                Login
              </button>
            </NavLink>
          ) : (
            <>
              <NavLink to="/profile">
                <button className="profile-btn">
                  {user.username}
                </button>
              </NavLink>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;