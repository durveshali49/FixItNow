import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";
import CustomerDashboard from "./CustomerDashboard";
import ProviderDashboard from "./ProviderDashboard";
import MyBookings from "./MyBookings";
import AdminDashboard from "./AdminDashboard"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* <-- ADD THIS ROUTE */}
      </Routes>
    </Router>
  );
}

export default App;