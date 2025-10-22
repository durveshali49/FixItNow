import React, { useState } from "react";
import "../App.css";

const ComplaintForm = ({ onComplaintSubmitted }) => {
  const [formData, setFormData] = useState({
    submissionType: "public",
    category: "",
    title: "",
    description: "",
    urgency: "low",
    contactInfo: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Academic Issues",
    "Infrastructure",
    "Administrative",
    "Hostel/Accommodation",
    "Library Services",
    "IT Services",
    "Canteen/Food Services",
    "Transportation",
    "Health Services",
    "Others",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file sizes (max 5MB each)
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Add user ID if logged in and submission is public
      if (formData.submissionType === "public") {
        const userString = localStorage.getItem("user");
        if (userString) {
          try {
            const user = JSON.parse(userString);
            if (user && user.id) {
              submitData.append("userId", user.id);
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
          }
        }
      }

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Append files
      selectedFiles.forEach((file) => {
        submitData.append("files", file);
      });

      const res = await fetch("http://localhost:5000/submit-complaint", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          `Complaint submitted successfully! Your complaint ID is: ${
            data.complaintId || "COMP" + Date.now()
          }`
        );
        setShowPopup(true);

        // Reset form
        setFormData({
          submissionType: "public",
          category: "",
          title: "",
          description: "",
          urgency: "low",
          contactInfo: "",
        });
        setSelectedFiles([]);

        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";

        // Call the callback function if it exists and is a function
        if (
          onComplaintSubmitted &&
          typeof onComplaintSubmitted === "function"
        ) {
          onComplaintSubmitted();
        }
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to submit complaint");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      setMessage("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setMessage(null);
    setStatus("");
  };

  return (
    <div className="complaint-form-container">
      <div className="form-header">
        <h2>Submit New Complaint</h2>
        <p>Help us resolve your concerns by providing detailed information</p>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        {/* Submission Type */}
        <div className="form-group">
          <label className="form-label">Submission Type</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="submissionType"
                value="public"
                checked={formData.submissionType === "public"}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="radio-text">Public (Trackable)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="submissionType"
                value="anonymous"
                checked={formData.submissionType === "anonymous"}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="radio-text">Anonymous (Private)</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
            required
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Complaint Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            className="form-input"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Detailed Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about your complaint..."
            className="form-textarea"
            rows="5"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Urgency */}
        <div className="form-group">
          <label htmlFor="urgency" className="form-label">
            Priority Level
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="low">Low - Can wait for resolution</option>
            <option value="medium">Medium - Needs attention soon</option>
            <option value="high">High - Urgent resolution needed</option>
            <option value="critical">
              Critical - Immediate attention required
            </option>
          </select>
        </div>

        {/* Contact Info for Anonymous */}
        {formData.submissionType === "anonymous" && (
          <div className="form-group">
            <label htmlFor="contactInfo" className="form-label">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="Email or phone number for updates (optional)"
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* File Upload */}
        <div className="form-group">
          <label htmlFor="file-upload" className="form-label">
            Supporting Evidence (Optional)
          </label>
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="form-file-input"
            disabled={isSubmitting}
          />
          <div className="file-upload-info">
            <small>
              Accepted formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB each)
            </small>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files:</h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {message && status === "error" && (
          <div className={`message ${status}`}>{message}</div>
        )}

        {/* Submit Button */}
        <div className="form-group">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </form>

      {/* Success Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box success-popup">
            <div className="popup-icon">✓</div>
            <p>{message}</p>
            <button onClick={handleClosePopup} className="popup-btn">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
