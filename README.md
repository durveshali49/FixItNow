
# FixItNow

## 📋 Project Overview

Lightweight web application to submit, track and manage complaints with an admin dashboard, auto-escalation rules and simple reporting/export.

This repository contains a React frontend (in `front-end/`) and an Express + MySQL backend (in `back-end/`).

## What I changed in this fork
- Server now reads DB configuration from environment variables and uses a safer default for DB password.
- File upload handling: filename sanitization, stricter MIME checks, uploads folder created using absolute path.
- `createAdmin.js` rewritten to be a Node script using `axios` and configurable via env vars.
- Backend `package.json` includes `axios` dependency (used by `createAdmin.js`).
- Frontend login now stores JWT token in `localStorage` as `token` (used for authenticated requests).
- Updated and simplified README with clear setup and deployment steps.

If you'd like, I can continue improving accessibility, add automated tests, or wire a CI workflow.

## Repo layout

- back-end/: Express API
- front-end/: React app (Create React App)

## Prerequisites
- Node.js (v16+ recommended)
- npm (or yarn)
- MySQL server

## Quick setup (local development)

1) Database

Create the database and tables (example SQL):

```sql
CREATE DATABASE complaint_system;
USE complaint_system;

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency ENUM('low','medium','high','critical') DEFAULT 'low',
  submission_type ENUM('public','anonymous') DEFAULT 'public',
  contact_info VARCHAR(255) NULL,
  file_path TEXT NULL,
  status ENUM('New','Under Review','In Progress','Resolved','Closed','Escalated') DEFAULT 'New',
  assigned_to VARCHAR(255) NULL,
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  escalated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE complaint_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  old_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  update_message TEXT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE escalation_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  urgency_level ENUM('low','medium','high','critical') NOT NULL,
  hours_before_escalation INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO escalation_rules (urgency_level, hours_before_escalation) VALUES
('critical', 2), ('high', 24), ('medium', 72), ('low', 168);
```

2) Backend

```bash
cd back-end
npm install
```

Create a `.env` file in `back-end/` with at least the following values (example):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=complaint_system
JWT_SECRET=change_this_secret
```

Start backend in dev mode:

```bash
npm run dev
```

3) Frontend

```bash
cd front-end
npm install
npm start
```

Open http://localhost:3000

4) Create an admin user (optional)

From the `back-end` folder you can run the helper script. It uses `BACKEND_URL` and env vars if provided:

```bash
# from back-end/
# optionally override defaults with env vars
# ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=your_admin_password BACKEND_URL=http://localhost:5000 node createAdmin.js
node createAdmin.js
```

When run without env vars, `createAdmin.js` will create an admin user with the email in `ADMIN_EMAIL` (default `admin@example.com`) and will generate a secure password if `ADMIN_PASSWORD` is not set — the generated password is printed to the console. Always set your own `ADMIN_PASSWORD` in production and store it securely.

## Notes, known issues and recommended improvements

- The project stores a JWT token in localStorage. For higher security move to an httpOnly cookie strategy.
- Database credentials default to empty password if not set; always use secure credentials in production.
- File uploads are stored in `back-end/uploads` on the server file system. Consider using S3 or another object store in production.
- No automated tests included. I can add unit tests and e2e tests if you'd like.
- Consider adding CI (GitHub Actions), Dockerfiles, and deployment scripts.

## Deployment suggestions

- Backend: deploy to a Node host (Heroku, Render, Railway, DigitalOcean App Platform) or containerize with Docker and deploy to a cloud provider. Ensure environment variables are set and MySQL is available (managed RDS/Cloud SQL).
- Frontend: build (`npm run build`) and serve via static host (Netlify, Vercel, GitHub Pages) or serve the build from the backend (Express static) behind a CDN.

Example quick production build + serve locally (frontend):

```bash
cd front-end
npm run build
# serve the build with a static server or copy into backend 'public' folder
npx serve -s build
```

## How I validated changes

- Performed a code review across backend and frontend modules.
- Updated code to read environment variables and hardened file upload checks.
- Updated createAdmin script to be a node script using axios.
- Ensured frontend login stores token for authenticated requests.

If you want, I can now:

1. Run `npm install` and start both servers here and fix any runtime errors.
2. Add environment-specific instructions (Dockerfile, Compose, GitHub Actions).
3. Improve accessibility and responsive edge-cases in the UI.

Tell me which of the above you'd like me to do next and I will proceed.


ResolveIT is a comprehensive online complaint and grievance portal designed to bring transparency and efficiency to institutional complaint handling. The platform enables users to submit complaints (anonymously or publicly), track their status in real-time, and escalate unresolved issues, while administrators manage the entire resolution process through an intuitive dashboard.

## ✨ Key Features

### User Features
- **Dual Submission Modes**: Submit complaints publicly (trackable) or anonymously (private)
- **Real-time Status Tracking**: Track complaint progress through all resolution stages
- **Evidence Upload**: Attach supporting documents and images (JPG, PNG, PDF, DOC, DOCX)
- **Complaint History**: View all your past complaints with detailed information
- **Priority Levels**: Set urgency levels (Low, Medium, High, Critical)
- **Timeline View**: See chronological updates and admin comments

### Admin Features
- **Comprehensive Dashboard**: Overview of all complaints with filtering options
- **Status Management**: Update complaint status through the resolution workflow
- **Assignment System**: Assign complaints to specific staff members
- **Internal Notes**: Add private notes visible only to admin staff
- **Public Replies**: Communicate with users about their complaint progress
- **Analytics**: Visual insights into complaint trends and performance metrics
- **Auto-escalation**: Automatic escalation of unresolved critical issues

### Reporting & Analytics
- **Visual Dashboards**: Charts showing status distribution, category breakdown, and trends
- **Export Functionality**: Download complaint data in CSV or JSON format
- **Performance Metrics**: Track resolution time, resolution rate, and critical issues
- **Custom Filters**: Filter by status, category, priority, and date range

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **CSS3** - Styling with responsive design
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Multer** - File upload handling
- **JWT** - Authentication
- **bcrypt.js** - Password hashing
- **node-cron** - Scheduled tasks

## 📁 Project Structure

```
resolveit-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ComplaintForm.js
│   │   │   ├── ComplaintHistory.js
│   │   │   ├── ComplaintTracking.js
│   │   │   ├── Navbar.js
│   │   │   └── ReportsExport.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── Dashboard.js
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── Server.js
│   ├── createAdmin.js
│   ├── uploads/
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

### Database Setup

1. **Create the MySQL database:**
```sql
CREATE DATABASE complaint_system;
USE complaint_system;
```

2. **Create the required tables:**

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  submission_type ENUM('public', 'anonymous') DEFAULT 'public',
  contact_info VARCHAR(255) NULL,
  file_path TEXT NULL,
  status ENUM('New', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Escalated') DEFAULT 'New',
  assigned_to VARCHAR(255) NULL,
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  escalated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaint updates table
CREATE TABLE complaint_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  old_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  update_message TEXT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Escalation rules table (optional)
CREATE TABLE escalation_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  hours_before_escalation INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default escalation rules
INSERT INTO escalation_rules (urgency_level, hours_before_escalation) VALUES
('critical', 2),
('high', 24),
('medium', 72),
('low', 168);
```

### Backend Setup

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file:**

You can copy the example file from `back-end/.env.example` and fill in your values:

```bash
cp back-end/.env.example back-end/.env
# then edit back-end/.env and set secure values
```

Example (placeholders):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=complaint_system
JWT_SECRET=your_secret_key_here
```

4. **Server configuration**

The server uses environment variables (see `.env.example`). You do not need to modify `Server.js` — it will read values from the environment on startup.

5. **Start the backend server:**
```bash
node Server.js
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Creating Admin Account

1. **Run the admin creation script:**
```bash
node createAdmin.js
```

**Important:** When creating admin accounts, always set a secure password and store it safely. If `ADMIN_PASSWORD` isn't provided to `createAdmin.js` a secure password will be generated and printed to the console.

## 📱 Usage Guide

### For Users

1. **Sign Up/Login**: Create an account or log in to submit complaints
2. **Submit Complaint**: Choose submission type (Public/Anonymous), fill in details
3. **Track Status**: Use the tracking feature to monitor complaint progress
4. **View History**: Access all your past complaints in "My Complaints" section

### For Admins

1. **Login**: Use admin credentials to access the admin dashboard
2. **View Dashboard**: See overview of all complaints with statistics
3. **Manage Complaints**: Update status, assign to staff, add notes
4. **Generate Reports**: View analytics and export data for analysis

## 🔐 Security Features

- Password encryption using bcrypt
- JWT-based authentication
- Role-based access control (User/Admin)
- Input validation and sanitization
- File type and size restrictions
- SQL injection prevention with parameterized queries

## 📊 Workflow

```
User Submission → Admin Review → Assignment → Resolution → Closure
                    ↓
              (If delayed) → Escalation → Higher Authority
```

### Status Flow
1. **New** - Complaint just submitted
2. **Under Review** - Admin reviewing the complaint
3. **In Progress** - Working on resolution
4. **Resolved** - Issue resolved
5. **Closed** - Complaint closed
6. **Escalated** - Escalated to higher authority

## 🎯 Project Milestones

- ✅ **Week 1-2**: Login and Complaint Input Module
- ✅ **Week 3-4**: Complaint Status System
- ✅ **Week 5**: Admin Dashboard
- ✅ **Week 6-7**: Escalation Logic
- ✅ **Week 8**: Reports and Export

## 🤝 Contributing

This is an academic project. For any issues or suggestions:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is created for educational purposes.

## 👥 Authors

Harshita Gupta


## 🙏 Acknowledgments

- Built as part of Infosys SpringBoard Virtual Internship 6.0
- Special thanks to faculty advisors and mentors

---

**Note**: Remember to update the database credentials and JWT secret in production environments!
>>>>>>> 6ec790d (chore: update README, remove hard-coded credentials, improve backend env config and upload handling, createAdmin safety fixes, add .gitignore)
