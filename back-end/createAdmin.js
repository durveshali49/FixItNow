// createAdmin.js - node script to create default admin via backend API
const axios = require("axios");
const crypto = require("crypto");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Build admin payload from env or generate a secure password if none provided
const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const adminName = process.env.ADMIN_NAME || "Administrator";
const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(10).toString("hex");

const adminData = {
  name: adminName,
  email: adminEmail,
  password: adminPassword,
  role: "admin",
};

async function createAdmin() {
  try {
    const res = await axios.post(`${BACKEND_URL}/signup`, adminData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✓ Admin user created:", res.data);
    if (!process.env.ADMIN_PASSWORD) {
      console.log("ℹ️ ADMIN_PASSWORD was not provided. A generated password was used:", adminPassword);
      console.log("📌 Please store this password securely and change it after first login.");
    }
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error("✗ Error creating admin:", err.response.data || err.response.status);
    } else {
      console.error("✗ Error creating admin:", err.message);
    }
    process.exit(1);
  }
}

createAdmin();
