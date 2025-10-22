import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection pool (use environment variables when available)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "complaint_system",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // replace spaces to avoid issues on some file systems
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|pdf|doc|docx/;
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (JPG, PNG) and documents (PDF, DOC, DOCX) are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Admin Role Middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Admin access required" });
  }
};

// ================= AUTH ROUTES =================

app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  try {
    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      connection.release();
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    connection.release();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ success: false, message: "Signup failed: " + err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    connection.release();

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Login failed: " + err.message });
  }
});

// ================= COMPLAINT ROUTES =================

app.post("/submit-complaint", upload.array("files", 5), async (req, res) => {
  const {
    submissionType,
    category,
    title,
    description,
    urgency,
    contactInfo,
    userId,
  } = req.body;

  // Validate required fields
  if (!category || !title || !description) {
    return res.status(400).json({
      success: false,
      message: "Category, title, and description are required",
    });
  }

  try {
    const connection = await pool.getConnection();

    let finalUserId = null;
    if (submissionType === "public" && userId) {
      finalUserId = userId;
    }

    let filePaths = null;
    if (req.files && req.files.length > 0) {
      filePaths = req.files.map((file) => file.path).join(",");
    }

    const [result] = await connection.query(
      `INSERT INTO complaints 
       (user_id, category, title, description, urgency, submission_type, contact_info, file_path, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', NOW())`,
      [
        finalUserId,
        category,
        title,
        description,
        urgency || "low",
        submissionType || "public",
        contactInfo,
        filePaths,
      ]
    );

    await connection.query(
      `INSERT INTO complaint_updates (complaint_id, old_status, new_status, update_message, is_public, created_at)
       VALUES (?, NULL, 'New', 'Complaint submitted successfully', TRUE, NOW())`,
      [result.insertId]
    );

    connection.release();

    res.json({
      success: true,
      message: "Complaint submitted successfully!",
      complaintId: result.insertId,
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to submit complaint: " + err.message,
    });
  }
});

app.get("/user-complaints/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await pool.getConnection();

    let query;
    let params = [];

    if (userId === "0" || !userId || userId === "null") {
      query = `SELECT * FROM complaints WHERE user_id IS NULL AND submission_type = 'anonymous' ORDER BY created_at DESC`;
    } else {
      query = `SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC`;
      params.push(userId);
    }

    const [complaints] = await connection.query(query, params);
    connection.release();

    res.json({ success: true, complaints });
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints: " + err.message,
    });
  }
});

app.get("/track-complaint/:id", async (req, res) => {
  let { id } = req.params;

  if (typeof id === "string" && id.startsWith("COMP")) {
    id = id.substring(4);
  }

  try {
    const connection = await pool.getConnection();

    const [complaint] = await connection.query(
      `SELECT c.*, u.name as user_name, u.email as user_email 
       FROM complaints c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [id]
    );

    if (complaint.length === 0) {
      connection.release();
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    const [timeline] = await connection.query(
      `SELECT * FROM complaint_updates 
       WHERE complaint_id = ? AND is_public = TRUE 
       ORDER BY created_at DESC`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      complaint: complaint[0],
      timeline,
    });
  } catch (err) {
    console.error("Error tracking complaint:", err);
    res.status(500).json({
      success: false,
      message: "Failed to track complaint: " + err.message,
    });
  }
});

// ================= ADMIN ROUTES =================

app.get("/admin/complaints", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [complaints] = await connection.query(
      `SELECT c.*, u.name as user_name, u.email as user_email 
       FROM complaints c 
       LEFT JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
    );
    connection.release();

    res.json({ success: true, complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints: " + err.message,
    });
  }
});

app.put("/admin/update-complaint/:id", async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, notes, publicReply } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  try {
    const connection = await pool.getConnection();

    const [currentComplaint] = await connection.query(
      "SELECT status FROM complaints WHERE id = ?",
      [id]
    );

    if (currentComplaint.length === 0) {
      connection.release();
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    const oldStatus = currentComplaint[0].status;

    // Build dynamic update query
    let updateQuery = `UPDATE complaints SET status = ?, updated_at = NOW()`;
    let updateParams = [status];

    if (assignedTo) {
      updateQuery += `, assigned_to = ?`;
      updateParams.push(assignedTo);
    }

    if (notes) {
      updateQuery += `, resolution_notes = ?`;
      updateParams.push(notes);
    }

    if (status === "Resolved") {
      updateQuery += `, resolved_at = NOW()`;
    }

    if (status === "Escalated") {
      updateQuery += `, escalated_at = NOW()`;
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(id);

    await connection.query(updateQuery, updateParams);

    let updateMessage = `Status updated from ${oldStatus} to ${status}`;
    if (assignedTo) updateMessage += `. Assigned to: ${assignedTo}`;
    if (publicReply) updateMessage += `. ${publicReply}`;

    await connection.query(
      `INSERT INTO complaint_updates (complaint_id, old_status, new_status, update_message, is_public, created_at)
       VALUES (?, ?, ?, ?, TRUE, NOW())`,
      [id, oldStatus, status, updateMessage]
    );

    if (notes) {
      await connection.query(
        `INSERT INTO complaint_updates (complaint_id, old_status, new_status, update_message, is_public, created_at)
         VALUES (?, ?, ?, ?, FALSE, NOW())`,
        [id, oldStatus, status, `Internal notes: ${notes}`]
      );
    }

    connection.release();
    res.json({ success: true, message: "Complaint updated successfully" });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update complaint: " + err.message,
    });
  }
});

// ================= STATS & EXPORT =================

app.get("/stats", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Calculate stats directly from complaints table
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_complaints,
        SUM(CASE WHEN status IN ('Under Review', 'In Progress') THEN 1 ELSE 0 END) as pending_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
        SUM(CASE WHEN status = 'Escalated' THEN 1 ELSE 0 END) as escalated_complaints,
        SUM(CASE WHEN urgency = 'critical' THEN 1 ELSE 0 END) as critical_complaints,
        SUM(CASE WHEN urgency = 'high' THEN 1 ELSE 0 END) as high_priority_complaints
      FROM complaints
    `);

    connection.release();

    res.json({
      success: true,
      stats: stats[0] || {
        total_complaints: 0,
        new_complaints: 0,
        pending_complaints: 0,
        resolved_complaints: 0,
        escalated_complaints: 0,
        critical_complaints: 0,
        high_priority_complaints: 0,
      },
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics: " + err.message,
    });
  }
});

app.get("/export/complaints", async (req, res) => {
  const { format = "csv", status, category, dateFrom, dateTo } = req.query;

  try {
    const connection = await pool.getConnection();

    let query = `SELECT 
      c.id, c.title, c.category, c.description, c.urgency, c.status,
      c.submission_type, c.created_at, c.resolved_at,
      u.name as user_name, u.email as user_email
      FROM complaints c 
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1`;

    const params = [];

    if (status && status !== "all") {
      query += " AND c.status = ?";
      params.push(status);
    }
    if (category && category !== "all") {
      query += " AND c.category = ?";
      params.push(category);
    }
    if (dateFrom) {
      query += " AND c.created_at >= ?";
      params.push(dateFrom);
    }
    if (dateTo) {
      query += " AND c.created_at <= ?";
      params.push(dateTo + " 23:59:59");
    }

    query += " ORDER BY c.created_at DESC";

    const [complaints] = await connection.query(query, params);
    connection.release();

    if (format === "csv") {
      const csvHeader =
        "ID,Title,Category,Description,Priority,Status,Type,Created,Resolved,User Name,User Email\n";
      const csvData = complaints
        .map(
          (c) =>
            `${c.id},"${c.title}","${c.category}","${c.description.replace(
              /"/g,
              '""'
            )}",${c.urgency},${c.status},${c.submission_type},${c.created_at},${
              c.resolved_at || ""
            },"${c.user_name || ""}","${c.user_email || ""}"`
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=complaints-${Date.now()}.csv`
      );
      res.send(csvHeader + csvData);
    } else {
      res.json({ success: true, complaints });
    }
  } catch (err) {
    console.error("Error exporting complaints:", err);
    res.status(500).json({
      success: false,
      message: "Failed to export complaints: " + err.message,
    });
  }
});

// ================= AUTO-ESCALATION =================

const checkForEscalation = async () => {
  try {
    const connection = await pool.getConnection();

    // Check if escalation_rules table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'escalation_rules'"
    );

    if (tables.length === 0) {
      console.log(
        "Escalation rules table does not exist. Skipping auto-escalation."
      );
      connection.release();
      return;
    }

    const [rules] = await connection.query(
      "SELECT * FROM escalation_rules WHERE is_active = TRUE"
    );

    for (const rule of rules) {
      const hoursAgo = new Date(
        Date.now() - rule.hours_before_escalation * 60 * 60 * 1000
      );

      const [complaintsToEscalate] = await connection.query(
        `SELECT * FROM complaints 
         WHERE urgency = ? 
         AND status NOT IN ('Resolved', 'Closed', 'Escalated')
         AND created_at <= ?`,
        [rule.urgency_level, hoursAgo]
      );

      for (const complaint of complaintsToEscalate) {
        await connection.query(
          "UPDATE complaints SET status = 'Escalated', escalated_at = NOW() WHERE id = ?",
          [complaint.id]
        );

        await connection.query(
          `INSERT INTO complaint_updates (complaint_id, old_status, new_status, update_message, is_public, created_at)
           VALUES (?, ?, 'Escalated', 'Auto-escalated due to urgency level and time elapsed', TRUE, NOW())`,
          [complaint.id, complaint.status]
        );

        console.log(
          `Auto-escalated complaint ${complaint.id} (${rule.urgency_level} priority)`
        );
      }
    }

    connection.release();
  } catch (err) {
    console.error("Error in auto-escalation:", err);
  }
};

// Run auto-escalation every hour
cron.schedule("0 * * * *", () => {
  console.log("Running auto-escalation check...");
  checkForEscalation();
});

app.post("/admin/run-escalation", async (req, res) => {
  try {
    await checkForEscalation();
    res.json({ success: true, message: "Escalation check completed" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to run escalation check: " + err.message,
    });
  }
});

// ================= ERROR HANDLING =================

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB per file.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 5 files allowed.",
      });
    }
  }

  if (error.message.includes("Only images")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "An error occurred while processing your request.",
  });
});

// ================= START SERVER =================

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    const connection = await pool.getConnection();
    console.log("DB connected successfully");
    connection.release();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    console.error("Please check your .env file and ensure the database exists");
  }
});

export default app;
