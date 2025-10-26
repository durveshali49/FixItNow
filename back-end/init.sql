-- Create database
CREATE DATABASE IF NOT EXISTS Service;
USE Service;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Service Provider', 'Admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    availability ENUM('Available', 'Unavailable') DEFAULT 'Available',
    location VARCHAR(255),
    image_url VARCHAR(500),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Provider schedules table
CREATE TABLE IF NOT EXISTS provider_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_day (provider_id, day_of_week)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    booking_start_time DATETIME NOT NULL,
    booking_end_time DATETIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_review (booking_id)
);

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@localseva.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin');

-- Insert sample service provider
INSERT IGNORE INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Service Provider');

-- Insert sample customer
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer');

-- Insert sample services
INSERT IGNORE INTO services (provider_id, service_name, description, category, price, location, status) VALUES
(2, 'Home Cleaning', 'Professional home cleaning service', 'Cleaning', 500.00, 'Mumbai', 'Approved'),
(2, 'Plumbing Repair', 'Fix leaks and plumbing issues', 'Plumbing', 300.00, 'Delhi', 'Approved');

-- Insert sample schedule for provider
INSERT IGNORE INTO provider_schedules (provider_id, day_of_week, start_time, end_time, is_available) VALUES
(2, 1, '09:00:00', '17:00:00', TRUE), -- Monday
(2, 2, '09:00:00', '17:00:00', TRUE), -- Tuesday
(2, 3, '09:00:00', '17:00:00', TRUE), -- Wednesday
(2, 4, '09:00:00', '17:00:00', TRUE), -- Thursday
(2, 5, '09:00:00', '17:00:00', TRUE); -- Friday
