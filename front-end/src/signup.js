import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setStatus("");

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "user",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("User registered successfully!");
        setShowPopup(true);
      } else {
        setStatus("error");
        setMessage(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setStatus("error");
      setMessage(
        "Server error. Please check if the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOkClick = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    <div className="body">
      <div className="outer-container">
        <h2>Sign Up</h2>

        <div className="inner-container">
          {message && status === "error" && (
            <div className={`message ${status}`}>{message}</div>
          )}
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Submit"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "14px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#00897b", fontWeight: "bold" }}>
              Login here
            </Link>
          </p>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>{message}</p>
            <button onClick={handleOkClick}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
