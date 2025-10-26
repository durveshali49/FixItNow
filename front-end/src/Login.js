import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import './Login.css';

// --- SVG Icon Components for Social Media Logos ---
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.76,4.73 16.04,5.7 17.09,6.62L19.27,4.59C17.14,2.72 14.65,1.73 12.19,1.73C6.56,1.73 2,6.24 2,12C2,17.6 6.56,22.27 12.19,22.27C17.6,22.27 21.5,18.33 21.5,12.27C21.5,11.77 21.45,11.43 21.35,11.1Z" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.81C10.44 7.31 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z" />
    </svg>
);


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/login", {
                email,
                password,
            });

            toast.success(res.data.message, { position: "top-center" });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (res.data.user.role === "Service Provider") {
                navigate("/provider");
            } else if (res.data.user.role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/customer");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed", {
                position: "top-center",
            });
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card">
                <Link to="/" className="back-to-home">
                    <ArrowLeft size={20} />
                    <span>Home</span>
                </Link>

                <h2 className="gradient-text">Welcome Back</h2>
                <p className="login-subtitle">Sign in to your FixItNow account</p>
                
                <form className="login-form" onSubmit={handleSubmit}>
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

                    <button type="submit" className="submit-btn">Login</button>
                </form>

                {/* --- NEW: Social Login Section --- */}
                <div className="divider">
                    <span>OR CONTINUE WITH</span>
                </div>

                <div className="social-login-group">
                    <button className="social-btn google-btn">
                        <GoogleIcon />
                    </button>
                    <button className="social-btn facebook-btn">
                        <FacebookIcon />
                    </button>
                </div>
                {/* --- End of New Section --- */}

                <p className="switch-text">
                    Don’t have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
            <ToastContainer theme="dark" />
        </div>
    );
};

export default Login;