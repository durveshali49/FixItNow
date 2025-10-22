import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ReportsExport = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [exportFilters, setExportFilters] = useState({
    status: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
    format: "csv",
  });
  const [exporting, setExporting] = useState(false);

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

    fetchReportsData();
  }, [navigate]);

  const fetchReportsData = async () => {
    try {
      const [complaintsResponse, statsResponse] = await Promise.all([
        fetch("http://localhost:5000/admin/complaints"),
        fetch("http://localhost:5000/stats"),
      ]);

      const complaintsData = await complaintsResponse.json();
      const statsData = await statsResponse.json();

      if (complaintsResponse.ok) {
        setComplaints(complaintsData.complaints || []);
      }
      if (statsResponse.ok) {
        setStats(statsData.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(exportFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `http://localhost:5000/export/complaints?${queryParams.toString()}`
      );

      if (response.ok) {
        if (exportFilters.format === "csv") {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `complaints-export-${Date.now()}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          console.log("Export data:", data);
          alert("Export completed! Check console for data.");
        }
      } else {
        alert("Export failed. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const getCategoryStats = () => {
    const categoryCount = {};
    complaints.forEach((complaint) => {
      categoryCount[complaint.category] =
        (categoryCount[complaint.category] || 0) + 1;
    });
    return Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  };

  const getPriorityStats = () => {
    const priorityCount = {};
    complaints.forEach((complaint) => {
      priorityCount[complaint.urgency] =
        (priorityCount[complaint.urgency] || 0) + 1;
    });
    return Object.entries(priorityCount);
  };

  const getMonthlyTrends = () => {
    const monthlyData = {};
    complaints.forEach((complaint) => {
      const month = new Date(complaint.created_at).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData).slice(-6);
  };

  const getResolutionTime = () => {
    const resolvedComplaints = complaints.filter((c) => c.resolved_at);
    if (resolvedComplaints.length === 0) return 0;

    const totalHours = resolvedComplaints.reduce((acc, complaint) => {
      const created = new Date(complaint.created_at);
      const resolved = new Date(complaint.resolved_at);
      const hours = (resolved - created) / (1000 * 60 * 60);
      return acc + hours;
    }, 0);

    return Math.round(totalHours / resolvedComplaints.length);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <Navbar />
        <div className="reports-loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <Navbar />

      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive insights into complaint trends and performance</p>
      </div>

      {/* Key Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card total">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-number">
              {stats.total_complaints || complaints.length}
            </div>
            <div className="metric-label">Total Complaints</div>
          </div>
        </div>

        <div className="metric-card resolution">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-number">{getResolutionTime()}h</div>
            <div className="metric-label">Avg Resolution Time</div>
          </div>
        </div>

        <div className="metric-card satisfaction">
          <div className="metric-icon">😊</div>
          <div className="metric-content">
            <div className="metric-number">
              {complaints.length > 0
                ? Math.round(
                    (complaints.filter((c) => c.status === "Resolved").length /
                      complaints.length) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="metric-label">Resolution Rate</div>
          </div>
        </div>

        <div className="metric-card critical">
          <div className="metric-icon">🚨</div>
          <div className="metric-content">
            <div className="metric-number">
              {complaints.filter((c) => c.urgency === "critical").length}
            </div>
            <div className="metric-label">Critical Issues</div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="analytics-grid">
        {/* Status Distribution */}
        <div className="analytics-card">
          <h3>Status Distribution</h3>
          <div className="chart-container">
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
              const colors = {
                New: "#3182ce",
                "Under Review": "#d69e2e",
                "In Progress": "#38a169",
                Resolved: "#00897b",
                Escalated: "#e53e3e",
              };

              return (
                <div key={status} className="chart-item">
                  <div className="chart-info">
                    <span className="chart-label">{status}</span>
                    <span className="chart-value">{count}</span>
                  </div>
                  <div className="chart-bar">
                    <div
                      className="chart-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[status],
                      }}
                    ></div>
                  </div>
                  <span className="chart-percentage">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="analytics-card">
          <h3>Top Categories</h3>
          <div className="category-list">
            {getCategoryStats()
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="category-item">
                  <div className="category-name">{category}</div>
                  <div className="category-stats">
                    <span className="category-count">{count}</span>
                    <span className="category-percentage">
                      ({((count / complaints.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="analytics-card">
          <h3>Priority Levels</h3>
          <div className="priority-grid">
            {getPriorityStats().map(([priority, count]) => {
              const colors = {
                critical: "#e53e3e",
                high: "#dd6b20",
                medium: "#d69e2e",
                low: "#38a169",
              };

              return (
                <div key={priority} className="priority-card">
                  <div
                    className="priority-icon"
                    style={{ backgroundColor: colors[priority] }}
                  >
                    {priority.charAt(0).toUpperCase()}
                  </div>
                  <div className="priority-info">
                    <div className="priority-count">{count}</div>
                    <div className="priority-name">
                      {priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="analytics-card">
          <h3>Monthly Trends</h3>
          <div className="trend-chart">
            {getMonthlyTrends().map(([month, count]) => (
              <div key={month} className="trend-item">
                <div className="trend-bar">
                  <div
                    className="trend-fill"
                    style={{
                      height: `${
                        (count /
                          Math.max(...getMonthlyTrends().map(([, c]) => c))) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="trend-label">{month.split(" ")[0]}</div>
                <div className="trend-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <div className="export-header">
          <h2>Export Data</h2>
          <p>Download complaint data for external analysis</p>
        </div>

        <div className="export-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status Filter:</label>
              <select
                value={exportFilters.status}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, status: e.target.value })
                }
                className="export-select"
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category Filter:</label>
              <select
                value={exportFilters.category}
                onChange={(e) =>
                  setExportFilters({
                    ...exportFilters,
                    category: e.target.value,
                  })
                }
                className="export-select"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(complaints.map((c) => c.category))).map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>Date From:</label>
              <input
                type="date"
                value={exportFilters.dateFrom}
                onChange={(e) =>
                  setExportFilters({
                    ...exportFilters,
                    dateFrom: e.target.value,
                  })
                }
                className="export-input"
              />
            </div>

            <div className="filter-group">
              <label>Date To:</label>
              <input
                type="date"
                value={exportFilters.dateTo}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, dateTo: e.target.value })
                }
                className="export-input"
              />
            </div>
          </div>

          <div className="export-actions">
            <div className="format-selector">
              <label>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFilters.format === "csv"}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      format: e.target.value,
                    })
                  }
                />
                CSV Format
              </label>
              <label>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFilters.format === "json"}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      format: e.target.value,
                    })
                  }
                />
                JSON Format
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="export-btn"
            >
              {exporting ? "Exporting..." : "Export Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsExport;
