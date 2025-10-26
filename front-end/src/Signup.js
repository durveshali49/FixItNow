import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft, User, Mail, Lock, Briefcase, Users } from 'lucide-react';
import "./Signup.css"; // Styles are now imported from the CSS file

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(""); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) {
            toast.error("Please select a role.", { position: "top-center" });
            return;
        }
        try {
            const res = await axios.post("http://localhost:5000/api/signup", {
                name,
                email,
                password,
                role,
            });
            toast.success(res.data.message, { position: "top-center" });
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Signup failed", {
                position: "top-center",
            });
        }
    };

    return (
        <div className="signup-bg">
            <div className="signup-card">
                <Link to="/" className="back-to-home">
                    <ArrowLeft size={20} />
                    <span>Home</span>
                </Link>

                <h2 className="gradient-text">Join FixItNow</h2>
                <p className="signup-subtitle">Create an account to get started.</p>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            value={name}
                            placeholder="Full Name"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            value={email}
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="role-label">I am a...</div>
                        <div className="role-buttons">
                            <button
                                type="button"
                                className={`role-btn ${role === "Service Provider" ? "active-role" : ""}`}
                                onClick={() => setRole("Service Provider")}
                            >
                                <Briefcase size={18} />
                                Provider
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === "Customer" ? "active-role" : ""}`}
                                onClick={() => setRole("Customer")}
                            >
                                <Users size={18} />
                                Customer
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">Create Account</button>
                </form>

                <p className="switch-text">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
            <ToastContainer theme="dark" />
        </div>
    );
};

export default Signup;