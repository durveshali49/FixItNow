import React, { useState, useEffect } from "react";

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    urgency: "all",
    dateRange: "all"
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load user complaints on component mount
  useEffect(() => {
    fetchUserComplaints();
  }, []);

  // Apply filters when complaints or filters change
  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchUserComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:5000/user-complaints/${user?.id || 0}`);
      const data = await response.json();

      if (response.ok) {
        setComplaints(data.complaints || []);
      } else {
        setError(data.message || "Failed to fetch complaints");
      }
    } catch (err) {
      setError("Failed to load complaint history");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(complaint => 
        complaint.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter(complaint => 
        complaint.category === filters.category
      );
    }

    // Filter by urgency
    if (filters.urgency !== "all") {
      filtered = filtered.filter(complaint => 
        complaint.urgency === filters.urgency
      );
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== "all") {
        filtered = filtered.filter(complaint => 
          new Date(complaint.created_at) >= filterDate
        );
      }
    }

    setFilteredComplaints(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      "New": "#3182ce",
      "Under Review": "#d69e2e",
      "In Progress": "#38a169",
      "Resolved": "#00897b",
      "Closed": "#718096",
      "Escalated": "#e53e3e"
    };
    return colors[status] || "#718096";
  };

  const getPriorityColor = (urgency) => {
    const colors = {
      "critical": "#e53e3e",
      "high": "#dd6b20",
      "medium": "#d69e2e",
      "low": "#38a169"
    };
    return colors[urgency] || "#718096";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your complaints...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>My Complaint History</h2>
        <p>View and manage all your submitted complaints</p>
      </div>

      {error && <div className="message error">{error}</div>}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under review">Under Review</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange("urgency", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range:</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({status: "all", category: "all", urgency: "all", dateRange: "all"})}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="complaints-summary">
        <p>{filteredComplaints.length} complaint(s) found</p>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="no-complaints">
          <h3>No complaints found</h3>
          <p>No complaints match your current filters.</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="card-header">
                <h3>{complaint.title}</h3>
                <div className="card-badges">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {complaint.status}
                  </span>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(complaint.urgency) }}
                  >
                    {complaint.urgency}
                  </span>
                </div>
              </div>

              <div className="card-info">
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span>{complaint.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Submitted:</span>
                  <span>{formatDate(complaint.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span>{complaint.id}</span>
                </div>
              </div>

              <div className="card-description">
                <p>{complaint.description.substring(0, 120)}...</p>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => openComplaintModal(complaint)}
                  className="view-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for complaint details */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedComplaint.title}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              <div className="modal-badges">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedComplaint.status) }}
                >
                  {selectedComplaint.status}
                </span>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(selectedComplaint.urgency) }}
                >
                  {selectedComplaint.urgency}
                </span>
              </div>

              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <strong>Category:</strong> {selectedComplaint.category}
                </div>
                <div className="modal-info-item">
                  <strong>Submitted:</strong> {formatDate(selectedComplaint.created_at)}
                </div>
                <div className="modal-info-item">
                  <strong>Complaint ID:</strong> {selectedComplaint.id}
                </div>
                <div className="modal-info-item">
                  <strong>Type:</strong> {selectedComplaint.submission_type}
                </div>
              </div>

              <div className="modal-description">
                <h4>Description:</h4>
                <p>{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.resolution_notes && (
                <div className="modal-resolution">
                  <h4>Resolution Notes:</h4>
                  <p>{selectedComplaint.resolution_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .history-container {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .history-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #00897b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .filters-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 600;
          color: #4a5568;
          font-size: 14px;
        }

        .filter-select {
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #00897b;
        }

        .clear-filters-btn {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          height: fit-content;
        }

        .clear-filters-btn:hover {
          background: #cbd5e0;
        }

        .complaints-summary {
          margin-bottom: 20px;
          color: #4a5568;
          font-weight: 500;
        }

        .no-complaints {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          color: #718096;
        }

        .complaints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .complaint-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .complaint-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .card-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 18px;
          flex: 1;
          margin-right: 15px;
        }

        .card-badges {
          display: flex;
          gap: 8px;
          flex-direction: column;
        }

        .status-badge,
        .priority-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-label {
          color: #718096;
          font-weight: 500;
        }

        .card-description {
          margin-bottom: 20px;
        }

        .card-description p {
          color: #4a5568;
          margin: 0;
          line-height: 1.5;
          font-size: 14px;
        }

        .card-actions {
          display: flex;
          justify-content: flex-end;
        }

        .view-btn {
          background: #00897b;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        }

        .view-btn:hover {
          background: #00796b;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding: 25px 25px 0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin: 0 20px 20px 0;
          color: #2d3748;
          flex: 1;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #4a5568;
        }

        .modal-body {
          padding: 0 25px 25px;
        }

        .modal-badges {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .modal-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .modal-info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 14px;
        }

        .modal-info-item strong {
          color: #4a5568;
          font-weight: 600;
        }

        .modal-description,
        .modal-resolution {
          margin-bottom: 20px;
        }

        .modal-description h4,
        .modal-resolution h4 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .modal-description p,
        .modal-resolution p {
          color: #4a5568;
          line-height: 1.6;
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .history-container {
            padding: 20px;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .complaints-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 15px;
          }

          .card-badges {
            flex-direction: row;
            justify-content: flex-start;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal-info-grid {
            grid-template-columns: 1fr;
          }

          .modal-header {
            padding: 20px 20px 0;
          }

          .modal-body {
            padding: 0 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintHistory;