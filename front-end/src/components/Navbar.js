import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from localStorage to determine role
  const getUserRole = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  const userRole = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h3>ResolveIT Portal</h3>
        </div>
        <div className="navbar-menu">
          {/* Show Dashboard link for regular users */}
          {userRole !== "admin" && (
            <button
              className={`navbar-item ${isActive("/dashboard")}`}
              onClick={() => handleNavigation("/dashboard")}
            >
              Dashboard
            </button>
          )}

          {/* Show Admin Panel and Reports only for admins */}
          {userRole === "admin" && (
            <>
              <button
                className={`navbar-item ${isActive("/admin")}`}
                onClick={() => handleNavigation("/admin")}
              >
                Admin Panel
              </button>
              <button
                className={`navbar-item ${isActive("/reports")}`}
                onClick={() => handleNavigation("/reports")}
              >
                Reports
              </button>
            </>
          )}

          <button className="navbar-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
