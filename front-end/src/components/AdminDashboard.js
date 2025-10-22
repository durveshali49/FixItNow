import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    assignedTo: "",
    notes: "",
    publicReply: "",
  });
  const [filters, setFilters] = useState({
    status: "all",
    urgency: "all",
    category: "all",
  });

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
      return;
    }

    fetchComplaints();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/complaints");
      const data = await response.json();
      if (response.ok) {
        setComplaints(data.complaints || []);
      } else {
        console.error("Failed to fetch complaints:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === filters.status
      );
    }
    if (filters.urgency !== "all") {
      filtered = filtered.filter((c) => c.urgency === filters.urgency);
    }
    if (filters.category !== "all") {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    setFilteredComplaints(filtered);
  };

  const calculateStats = () => {
    const total = complaints.length;
    const newCount = complaints.filter((c) => c.status === "New").length;
    const pendingCount = complaints.filter((c) =>
      ["Under Review", "In Progress"].includes(c.status)
    ).length;
    const resolvedCount = complaints.filter(
      (c) => c.status === "Resolved"
    ).length;
    const escalatedCount = complaints.filter(
      (c) => c.status === "Escalated"
    ).length;

    setStats({
      total,
      new: newCount,
      pending: pendingCount,
      resolved: resolvedCount,
      escalated: escalatedCount,
    });
  };

  const handleUpdateComplaint = async (complaintId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/update-complaint/${complaintId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        await fetchComplaints();
        setShowModal(false);
        setUpdateData({
          status: "",
          assignedTo: "",
          notes: "",
          publicReply: "",
        });
        alert("Complaint updated successfully!");
      } else {
        alert(data.message || "Failed to update complaint");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update complaint");
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      assignedTo: complaint.assigned_to || "",
      notes: "",
      publicReply: "",
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "#3182ce",
      "Under Review": "#d69e2e",
      "In Progress": "#38a169",
      Resolved: "#00897b",
      Closed: "#718096",
      Escalated: "#e53e3e",
    };
    return colors[status] || "#718096";
  };

  const getPriorityColor = (urgency) => {
    const colors = {
      critical: "#e53e3e",
      high: "#dd6b20",
      medium: "#d69e2e",
      low: "#38a169",
    };
    return colors[urgency] || "#718096";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and resolve complaints efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card new">
          <div className="stat-number">{stats.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card escalated">
          <div className="stat-number">{stats.escalated}</div>
          <div className="stat-label">Escalated</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Manage Complaints
        </button>
        <button
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {complaints.slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-title">
                          {complaint.title}
                        </span>
                        <span className="activity-date">
                          {formatDate(complaint.created_at)}
                        </span>
                      </div>
                      <span
                        className="activity-status"
                        style={{
                          backgroundColor: getStatusColor(complaint.status),
                        }}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h3>Priority Distribution</h3>
                <div className="priority-stats">
                  {["critical", "high", "medium", "low"].map((priority) => {
                    const count = complaints.filter(
                      (c) => c.urgency === priority
                    ).length;
                    const percentage =
                      complaints.length > 0
                        ? ((count / complaints.length) * 100).toFixed(1)
                        : 0;
                    return (
                      <div key={priority} className="priority-item">
                        <div className="priority-info">
                          <span className="priority-name">
                            {priority.toUpperCase()}
                          </span>
                          <span className="priority-count">{count}</span>
                        </div>
                        <div className="priority-bar">
                          <div
                            className="priority-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getPriorityColor(priority),
                            }}
                          ></div>
                        </div>
                        <span className="priority-percentage">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="manage-content">
            {/* Filters */}
            <div className="admin-filters">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="under review">Under Review</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={filters.urgency}
                onChange={(e) =>
                  setFilters({ ...filters, urgency: e.target.value })
                }
                className="filter-select"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() =>
                  setFilters({ status: "all", urgency: "all", category: "all" })
                }
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>

            {/* Complaints Table */}
            <div className="complaints-table-container">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>{complaint.id}</td>
                      <td className="title-cell">
                        <div className="title-content">
                          <span className="complaint-title">
                            {complaint.title}
                          </span>
                          {complaint.submission_type === "anonymous" && (
                            <span className="anonymous-badge">Anonymous</span>
                          )}
                        </div>
                      </td>
                      <td>{complaint.category}</td>
                      <td>
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(
                              complaint.urgency
                            ),
                          }}
                        >
                          {complaint.urgency}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(complaint.status),
                          }}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td>{formatDate(complaint.created_at)}</td>
                      <td>
                        <button
                          onClick={() => openUpdateModal(complaint)}
                          className="action-btn update-btn"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Status Distribution</h3>
                <div className="chart-placeholder">
                  <div className="status-chart">
                    {[
                      "New",
                      "Under Review",
                      "In Progress",
                      "Resolved",
                      "Escalated",
                    ].map((status) => {
                      const count = complaints.filter(
                        (c) => c.status === status
                      ).length;
                      const percentage =
                        complaints.length > 0
                          ? ((count / complaints.length) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={status} className="chart-bar">
                          <div className="chart-label">{status}</div>
                          <div className="chart-bar-container">
                            <div
                              className="chart-bar-fill"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: getStatusColor(status),
                              }}
                            ></div>
                          </div>
                          <div className="chart-value">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Category Breakdown</h3>
                <div className="category-stats">
                  {Array.from(new Set(complaints.map((c) => c.category))).map(
                    (category) => {
                      const count = complaints.filter(
                        (c) => c.category === category
                      ).length;
                      const percentage =
                        complaints.length > 0
                          ? ((count / complaints.length) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={category} className="category-item">
                          <span className="category-name">{category}</span>
                          <div className="category-stats-right">
                            <span className="category-count">{count}</span>
                            <span className="category-percentage">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Complaint #{selectedComplaint.id}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="complaint-summary">
                <h4>{selectedComplaint.title}</h4>
                <p>{selectedComplaint.description}</p>
                <div className="summary-badges">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedComplaint.status),
                    }}
                  >
                    {selectedComplaint.status}
                  </span>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: getPriorityColor(
                        selectedComplaint.urgency
                      ),
                    }}
                  >
                    {selectedComplaint.urgency}
                  </span>
                </div>
              </div>

              <div className="update-form">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, status: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign To</label>
                  <input
                    type="text"
                    value={updateData.assignedTo}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        assignedTo: e.target.value,
                      })
                    }
                    placeholder="Enter staff member name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Internal Notes</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, notes: e.target.value })
                    }
                    placeholder="Add internal notes (not visible to user)"
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Public Reply</label>
                  <textarea
                    value={updateData.publicReply}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        publicReply: e.target.value,
                      })
                    }
                    placeholder="Reply to user (visible to complainant)"
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => setShowModal(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComplaint(selectedComplaint.id)}
                    className="update-complaint-btn"
                  >
                    Update Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
