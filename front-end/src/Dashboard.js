import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintTracking from "./components/ComplaintTracking";
import ComplaintHistory from "./components/ComplaintHistory";
import "./App.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("submit");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserStats(parsedUser.id);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/user-complaints/${userId}`
      );
      const data = await response.json();

      if (response.ok && data.complaints) {
        const complaints = data.complaints;
        const total = complaints.length;
        const pending = complaints.filter((c) =>
          ["New", "Under Review"].includes(c.status)
        ).length;
        const inProgress = complaints.filter(
          (c) => c.status === "In Progress"
        ).length;
        const resolved = complaints.filter((c) =>
          ["Resolved", "Closed"].includes(c.status)
        ).length;

        setStats({ total, pending, resolved, inProgress });
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmitted = () => {
    if (user) {
      fetchUserStats(user.id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "submit":
        return (
          <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />
        );
      case "track":
        return <ComplaintTracking />;
      case "history":
        return <ComplaintHistory />;
      default:
        return (
          <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />
        );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome to ResolveIT Portal</h1>
          <p>Your complaints and feedback management system</p>
          {user && (
            <p style={{ fontSize: "14px", color: "#718096", marginTop: "5px" }}>
              Logged in as: {user.name} ({user.email})
            </p>
          )}
        </div>

        {/* Dashboard Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >
            Submit Complaint
          </button>
          <button
            className={`tab-btn ${activeTab === "track" ? "active" : ""}`}
            onClick={() => setActiveTab("track")}
          >
            Track Status
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            My Complaints
          </button>
        </div>

        {/* Tab Content */}
        <div className="dashboard-main">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
