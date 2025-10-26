// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { format } from 'date-fns';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// IMPORTANT: Load environment variables at the very top
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// JWT secret is now securely loaded from the .env file
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please check your .env file.");
    process.exit(1);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authenticateAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
};


// ---------------- AUTH ROUTES ----------------
app.post("/api/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Database error during registration." });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );
        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error during login." });
    }
});


// ---------------- USER PROFILE ROUTES ----------------
app.get("/api/users/me", authenticateToken, (req, res) => res.json({ user: req.user }));

app.put("/api/users/me", authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }
    try {
        await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ message: "Server error while updating profile" });
    }
});

app.put("/api/services/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const provider_id = req.user.id;
    const { service_name, description, category, price, availability, location, image_url } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE services SET service_name=?, description=?, category=?, price=?, availability=?, location=?, image_url=? WHERE id=? AND provider_id=?`,
            [service_name, description, category, price, availability, location, image_url, id, provider_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found or you don't have permission to edit it." });
        }
        res.json({ message: "Service updated successfully" });
    } catch (err) {
        console.error("Service update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/services/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const provider_id = req.user.id;
    try {
        const [result] = await pool.query("DELETE FROM services WHERE id=? AND provider_id=?", [id, provider_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found or you don't have permission to delete it." });
        }
        res.json({ message: "Service deleted successfully" });
    } catch (err) {
        console.error("Service delete error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- SERVICES ROUTES ----------------
app.post("/api/services", authenticateToken, async (req, res) => {
    if (req.user.role !== 'Service Provider') {
        return res.status(403).json({ message: "Only Service Providers can create services." });
    }
    const provider_id = req.user.id;
    const { service_name, description, category, price, location, image_url } = req.body;
    if (!service_name) {
        return res.status(400).json({ message: "Service name is required." });
    }
    try {
        await pool.query(
            `INSERT INTO services (provider_id, service_name, description, category, price, availability, location, image_url, status) VALUES (?, ?, ?, ?, ?, 'Available', ?, ?, 'Pending')`,
            [provider_id, service_name, description, category, price, location, image_url]
        );
        res.status(201).json({ message: "Service submitted for approval." });
    } catch (err) {
        console.error("Service Creation Error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

app.get("/api/services", async (req, res) => {
    const { category, keyword, location, provider_id, sortBy } = req.query;
    let query = `
        SELECT 
            s.*, 
            u.name as provider_name,
            AVG(r.rating) as average_rating,
            COUNT(DISTINCT r.id) as review_count
        FROM services s
        JOIN users u ON s.provider_id = u.id
        LEFT JOIN reviews r ON s.id = r.service_id
    `;
    const params = [];
    
    let whereConditions = ["s.status = 'Approved'"];

    if (category) { whereConditions.push("s.category LIKE ?"); params.push(`%${category}%`); }
    if (keyword) { whereConditions.push("(s.service_name LIKE ? OR s.description LIKE ?)"); params.push(`%${keyword}%`, `%${keyword}%`); }
    if (location) { whereConditions.push("s.location LIKE ?"); params.push(`%${location}%`); }
    
    if (provider_id) {
        whereConditions = ["s.provider_id = ?"];
        params.length = 0;
        params.push(provider_id);
    }
    
    query += ` WHERE ${whereConditions.join(" AND ")}`;
    query += " GROUP BY s.id";

    if (sortBy === 'price_asc') {
        query += " ORDER BY s.price ASC";
    } else if (sortBy === 'price_desc') {
        query += " ORDER BY s.price DESC";
    } else if (sortBy === 'rating_desc') {
        query += " ORDER BY average_rating DESC, review_count DESC";
    }

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Get Services Error:", err);
        res.status(500).json({ message: "Server error." });
    }
});


// ---------------- SCHEDULE & BOOKING & REVIEW ROUTES ----------------
// GET SCHEDULES
app.get("/api/schedules", authenticateToken, async (req, res) => {
    const provider_id = req.user.id;
    try {
        const [schedule] = await pool.query("SELECT * FROM provider_schedules WHERE provider_id = ?", [provider_id]);
        res.json(schedule);
    } catch (err) {
        console.error("Fetch Schedule Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST SCHEDULES
app.post("/api/schedules", authenticateToken, async (req, res) => {
    const provider_id = req.user.id;
    const { schedules } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM provider_schedules WHERE provider_id = ?", [provider_id]);
        for (const s of schedules) {
            if (s.is_available) {
                await connection.query(
                    "INSERT INTO provider_schedules (provider_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)",
                    [provider_id, s.day_of_week, s.start_time, s.end_time, s.is_available]
                );
            }
        }
        await connection.commit();
        res.status(201).json({ message: "Schedule updated successfully." });
    } catch (err) {
        await connection.rollback();
        console.error("Update Schedule Error:", err);
        res.status(500).json({ message: "Server error while updating schedule." });
    } finally {
        connection.release();
    }
});

// GET AVAILABILITY
app.get("/api/availability/:provider_id/:date", async (req, res) => {
    const { provider_id, date } = req.params;
    const dayOfWeek = new Date(date).getDay();
    try {
        const [schedules] = await pool.query(
            "SELECT start_time, end_time FROM provider_schedules WHERE provider_id = ? AND day_of_week = ? AND is_available = TRUE",
            [provider_id, dayOfWeek]
        );
        if (schedules.length === 0) {
            return res.json({ availableSlots: [] });
        }
        const schedule = schedules[0];
        const [bookings] = await pool.query(
            "SELECT booking_start_time FROM bookings WHERE provider_id = ? AND DATE(booking_start_time) = ?",
            [provider_id, date]
        );
        const bookedTimes = new Set(bookings.map(b => format(new Date(b.booking_start_time), 'HH:mm:ss')));
        const availableSlots = [];
        const serviceDurationHours = 1;
        let currentTime = new Date(`${date}T${schedule.start_time}`);
        const endTime = new Date(`${date}T${schedule.end_time}`);

        while (currentTime < endTime) {
            const slotTimeStr = format(currentTime, 'HH:mm:ss');
            if (!bookedTimes.has(slotTimeStr)) {
                availableSlots.push(format(currentTime, 'HH:mm'));
            }
            currentTime.setHours(currentTime.getHours() + serviceDurationHours);
        }
        res.json({ availableSlots });
    } catch (err) {
        console.error("Fetch Availability Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST BOOKING
app.post("/api/bookings", authenticateToken, async (req, res) => {
    const customer_id = req.user.id;
    const { service_id, provider_id, booking_start_time } = req.body;

    if (!service_id || !provider_id || !booking_start_time) {
        return res.status(400).json({ message: "Missing required booking information." });
    }
    const startTime = new Date(booking_start_time);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [existingBookings] = await connection.query(
            `SELECT * FROM bookings WHERE provider_id = ? AND booking_start_time = ? AND status IN ('Pending', 'Confirmed') FOR UPDATE`,
            [provider_id, format(startTime, 'yyyy-MM-dd HH:mm:ss')]
        );
        if (existingBookings.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "This time slot is no longer available. Please select another." });
        }
        await connection.query(
            `INSERT INTO bookings (service_id, customer_id, provider_id, booking_start_time, booking_end_time, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [service_id, customer_id, provider_id, startTime, endTime]
        );
        await connection.commit();
        res.status(201).json({ message: "Booking request sent successfully." });
    } catch (err) {
        await connection.rollback();
        console.error("Create Booking Error:", err);
        res.status(500).json({ message: "Server error while creating booking." });
    } finally {
        connection.release();
    }
});

// GET BOOKINGS
app.get("/api/bookings", authenticateToken, async (req, res) => {
    const { id: userId, role } = req.user;
    const baseQuery = `
        SELECT 
            b.id, b.status, b.booking_start_time,
            s.id as service_id, s.service_name, s.price,
            cust.name as customer_name,
            prov.id as provider_id, prov.name as provider_name,
            r.id as review_id, r.rating, r.comment
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users cust ON b.customer_id = cust.id
        JOIN users prov ON b.provider_id = prov.id
        LEFT JOIN reviews r ON b.id = r.booking_id
    `;
    let query;
    if (role === 'Customer') {
        query = `${baseQuery} WHERE b.customer_id = ? ORDER BY b.created_at DESC`;
    } else if (role === 'Service Provider') {
        query = `${baseQuery} WHERE b.provider_id = ? ORDER BY b.created_at DESC`;
    } else {
        return res.status(403).json({ message: "Unauthorized role." });
    }
    try {
        const [bookings] = await pool.query(query, [userId]);
        res.json(bookings);
    } catch (err) {
        console.error("Fetch Bookings Error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// UPDATE BOOKING STATUS
app.put("/api/bookings/:bookingId/status", authenticateToken, async (req, res) => {
    if (req.user.role !== 'Service Provider') {
        return res.status(403).json({ message: "Only providers can update booking status." });
    }
    const { bookingId } = req.params;
    const { status } = req.body;
    const provider_id = req.user.id;
    if (!status) {
        return res.status(400).json({ message: "Status is required." });
    }
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = ? WHERE id = ? AND provider_id = ?",
            [status, bookingId, provider_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found or you do not have permission." });
        }
        res.json({ message: `Booking status updated to ${status}` });
    } catch (err) {
        console.error("Update Booking Status Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST REVIEW
app.post("/api/reviews", authenticateToken, async (req, res) => {
    if (req.user.role !== 'Customer') {
        return res.status(403).json({ message: "Only customers can leave reviews." });
    }
    const customer_id = req.user.id;
    const { booking_id, service_id, provider_id, rating, comment } = req.body;
    if (!booking_id || !service_id || !provider_id || !rating) {
        return res.status(400).json({ message: "Missing required fields for review." });
    }
    try {
        const [bookingRows] = await pool.query(
            "SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND status = 'Completed'",
            [booking_id, customer_id]
        );
        if (bookingRows.length === 0) {
            return res.status(403).json({ message: "You can only review your own completed services." });
        }
        await pool.query(
            "INSERT INTO reviews (booking_id, service_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
            [booking_id, service_id, customer_id, provider_id, rating, comment]
        );
        res.status(201).json({ message: "Thank you for your feedback!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "You have already reviewed this booking." });
        }
        console.error("Create Review Error:", error);
        res.status(500).json({ message: "Server error while submitting review." });
    }
});


// ---------------- ADMIN ROUTES ----------------
app.get("/api/admin/stats", authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [[{ total_users }]] = await pool.query("SELECT COUNT(*) as total_users FROM users");
        const [[{ total_providers }]] = await pool.query("SELECT COUNT(*) as total_providers FROM users WHERE role = 'Service Provider'");
        const [[{ total_services }]] = await pool.query("SELECT COUNT(*) as total_services FROM services");
        const [[{ completed_bookings }]] = await pool.query("SELECT COUNT(*) as completed_bookings FROM bookings WHERE status = 'Completed'");
        
        const liveStats = { total_users, total_providers, total_services, completed_bookings };

        const [topCategories] = await pool.query(`
            SELECT s.category, COUNT(b.id) as booking_count
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE b.status = 'Completed'
            GROUP BY s.category
            ORDER BY booking_count DESC
            LIMIT 5;
        `);

        const [topServices] = await pool.query(`
            SELECT s.service_name, COUNT(b.id) as booking_count
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE b.status = 'Completed'
            GROUP BY s.id
            ORDER BY booking_count DESC
            LIMIT 5;
        `);

        res.json({ stats: liveStats, topCategories, topServices });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/admin/services", authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [services] = await pool.query(`
            SELECT s.*, u.name as provider_name 
            FROM services s
            JOIN users u ON s.provider_id = u.id
            ORDER BY s.created_at DESC
        `);
        res.json(services);
    } catch (error) {
        console.error("Error fetching services for admin:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/admin/services/:id/status", authenticateToken, authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
    }
    try {
        const [result] = await pool.query("UPDATE services SET status = ? WHERE id = ?", [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found." });
        }
        res.json({ message: `Service has been ${status.toLowerCase()}.` });
    } catch (error) {
        console.error("Error updating service status:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// --- IMAGE UPLOAD ROUTE ---
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl: imageUrl });
});

// --- SERVER LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
