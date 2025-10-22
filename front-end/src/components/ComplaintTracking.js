import React, { useState } from "react";

const ComplaintTracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackComplaint = async (e) => {
    e.preventDefault();

    const trimmedId = trackingId.trim();
    if (!trimmedId) {
      setError("Please enter a complaint ID");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setTimeline([]);

    try {
      const response = await fetch(
        `http://localhost:5000/track-complaint/${trimmedId}`
      );
      const data = await response.json();

      if (response.ok) {
        setComplaint(data.complaint);
        setTimeline(data.timeline || []);
      } else {
        setError(data.message || "Complaint not found");
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Failed to fetch complaint details. Please try again.");
    } finally {
      setLoading(false);
    }
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
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Track Your Complaint</h2>
        <p>Enter your complaint ID to view current status and timeline</p>
      </div>

      <form onSubmit={handleTrackComplaint} className="tracking-form">
        <div className="form-group">
          <label htmlFor="trackingId" className="form-label">
            Complaint ID
          </label>
          <div className="tracking-input-group">
            <input
              type="text"
              id="trackingId"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter your complaint ID"
              className="form-input"
              required
              disabled={loading}
            />
            <button type="submit" className="track-btn" disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="message error">{error}</div>}

      {complaint && (
        <div className="complaint-details">
          <div className="complaint-card">
            <div className="complaint-header">
              <h3>{complaint.title}</h3>
              <div className="complaint-meta">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
                <span
                  className="priority-badge"
                  style={{
                    backgroundColor: getPriorityColor(complaint.urgency),
                  }}
                >
                  {complaint.urgency.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="complaint-info">
              <div className="info-row">
                <span className="info-label">Category:</span>
                <span className="info-value">{complaint.category}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Submitted:</span>
                <span className="info-value">
                  {formatDate(complaint.created_at)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{complaint.submission_type}</span>
              </div>
              {complaint.assigned_to && (
                <div className="info-row">
                  <span className="info-label">Assigned to:</span>
                  <span className="info-value">{complaint.assigned_to}</span>
                </div>
              )}
            </div>

            <div className="complaint-description">
              <h4>Description:</h4>
              <p>{complaint.description}</p>
            </div>

            {complaint.resolution_notes && (
              <div className="resolution-notes">
                <h4>Resolution Notes:</h4>
                <p>{complaint.resolution_notes}</p>
              </div>
            )}
          </div>

          {timeline.length > 0 && (
            <div className="timeline-container">
              <h3>Status Timeline</h3>
              <div className="timeline">
                {timeline.map((update, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status">
                          {update.old_status && `${update.old_status} → `}
                          {update.new_status}
                        </span>
                        <span className="timeline-date">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      {update.update_message && (
                        <p className="timeline-message">
                          {update.update_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .tracking-container {
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .tracking-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .tracking-form {
          margin-bottom: 30px;
        }

        .tracking-input-group {
          display: flex;
          gap: 10px;
          align-items: end;
        }

        .tracking-input-group .form-input {
          flex: 1;
          margin: 0;
        }

        .track-btn {
          background: #00897b;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .track-btn:hover:not(:disabled) {
          background: #00796b;
        }

        .track-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .complaint-details {
          margin-top: 30px;
        }

        .complaint-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
        }

        .complaint-header h3 {
          margin: 0;
          color: #2d3748;
          flex: 1;
        }

        .complaint-meta {
          display: flex;
          gap: 10px;
          margin-left: 20px;
        }

        .status-badge,
        .priority-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .complaint-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 14px;
        }

        .info-value {
          color: #2d3748;
          font-weight: 500;
        }

        .complaint-description,
        .resolution-notes {
          margin-bottom: 20px;
        }

        .complaint-description h4,
        .resolution-notes h4 {
          color: #2d3748;
          margin-bottom: 10px;
        }

        .complaint-description p,
        .resolution-notes p {
          color: #4a5568;
          line-height: 1.6;
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          margin: 0;
        }

        .timeline-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .timeline-container h3 {
          color: #2d3748;
          margin-bottom: 20px;
          text-align: center;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e2e8f0;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 25px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -37px;
          top: 5px;
          width: 12px;
          height: 12px;
          background: #00897b;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #00897b;
        }

        .timeline-content {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #00897b;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .timeline-status {
          font-weight: 600;
          color: #2d3748;
        }

        .timeline-date {
          font-size: 12px;
          color: #718096;
        }

        .timeline-message {
          margin: 0;
          color: #4a5568;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .tracking-container {
            padding: 20px;
          }

          .tracking-input-group {
            flex-direction: column;
            align-items: stretch;
          }

          .complaint-header {
            flex-direction: column;
            gap: 15px;
          }

          .complaint-meta {
            margin-left: 0;
          }

          .complaint-info {
            grid-template-columns: 1fr;
          }

          .timeline-header {
            flex-direction: column;
            align-items: start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintTracking;
