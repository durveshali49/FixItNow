# FixItNow

**FixItNow** is a modern platform for discovering, booking, and managing local services. Connect customers with trusted service providers in their area with ease.

![FixItNow Platform](https://img.shields.io/badge/Platform-Web-brightgreen) ![Status](https://img.shields.io/badge/Status-Active-success)

---

## Features

### 👥 For Customers
- **Browse Services**: Discover local service providers with advanced filtering
- **GPS Location**: Auto-detect your location to find nearby services
- **Real-time Booking**: Check availability and book appointments instantly
- **Secure Payments**: Safe and reliable payment processing
- **Reviews & Ratings**: Read authentic reviews from verified customers
- **Booking Management**: Track and manage all your bookings in one place

### 🛠️ For Service Providers
- **Service Listing**: Add and manage your services with images
- **Schedule Management**: Set your availability for each day of the week
- **Booking Dashboard**: View and manage all incoming bookings
- **GPS Location**: Share your location automatically with customers
- **Real-time Notifications**: Get notified of new bookings instantly
- **Performance Analytics**: Track your ratings and customer feedback

### 🔐 For Admins
- **User Management**: Approve and manage service providers
- **Service Moderation**: Review and approve new services
- **Dashboard Analytics**: Monitor platform statistics
- **Complete Control**: Manage all aspects of the platform

---

## 🎨 Design

FixItNow features a modern warm neutral color palette:
- **Primary**: #B6AE9F (Warm Taupe)
- **Accent**: #C5C7BC (Sage Gray)
- **Secondary**: #DEDED1 (Light Beige)
- **Tertiary**: #FBF3D1 (Cream)

Includes smooth animations, glassmorphism effects, and responsive design for all devices.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **React Select** - Enhanced dropdowns

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin support

### Additional Features
- **GPS Integration** - OpenStreetMap reverse geocoding
- **Real-time Location** - Browser geolocation API
- **Responsive Design** - Mobile-first approach

---

## 📁 Project Structure

```
FixItNow/
├── back-end/
│   ├── server.js           # Main server file
│   ├── init.sql            # Database schema
│   ├── init-db.js          # Database initialization script
│   ├── check-admin.js      # Admin password reset utility
│   ├── setup-schedules.js  # Provider schedule setup
│   ├── test-db.js          # Database connection tester
│   ├── uploads/            # Service images storage
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
│
├── front-end/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── App.js                    # Main app component
│   │   ├── Home.js                   # Landing page
│   │   ├── Login.js                  # Login page
│   │   ├── Signup.js                 # Registration page
│   │   ├── CustomerDashboard.js      # Customer interface
│   │   ├── ProviderDashboard.js      # Provider interface
│   │   ├── AdminDashboard.js         # Admin interface
│   │   ├── MyBookings.js             # Bookings page
│   │   ├── BookingModal.js           # Booking modal
│   │   ├── ServiceDetailModal.js     # Service details
│   │   ├── RatingModal.js            # Rating & review
│   │   ├── ImageUploader.js          # Image upload component
│   │   └── *.css                     # Component styles
│   └── package.json                  # Frontend dependencies
│
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/durveshali49/FixItNow.git
cd FixItNow
```

### 2. Backend Setup

```bash
cd back-end
npm install
```

Create a `.env` file in the `back-end` folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=Service
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Initialize the database:
```bash
node init-db.js
```

Set up provider schedules (optional):
```bash
node setup-schedules.js
```

Start the backend server:
```bash
npm start
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd front-end
npm install
npm start
```
Frontend will run on `http://localhost:3000`

---

## 👤 Default Users

After database initialization, you can login with:

### Admin Account
- **Email**: admin@fixitnow.com
- **Password**: admin123

### Sample Provider
- **Email**: john@example.com
- **Password**: admin123

### Sample Customer
- **Email**: jane@example.com
- **Password**: admin123

---

## 📱 Available Service Categories

- Home Painting
- AC Repair & Service
- Plumbing
- Electrical Work
- Carpentry
- Cleaning Services
- Pest Control
- Catering Services
- RO Water Purifier
- Movers & Packers

---

## 🔧 Key Features Explained

### GPS Location Detection
- Click the 📍 button to auto-detect your location
- Uses browser's geolocation API
- Converts coordinates to city name using OpenStreetMap
- Works on both desktop and mobile devices

### Image Upload
- Drag & drop or click to upload service images
- Automatic upload to server
- Image preview before submission
- Supports JPG, PNG, WEBP formats

### Real-time Availability
- Service providers set their weekly schedule
- Time slots shown based on provider availability
- Customers can only book available slots
- Prevents double bookings

### Secure Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Customer, Provider, Admin)
- Protected routes and API endpoints

---

## 🌐 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Services
- `GET /api/services` - Get all services (with filters)
- `POST /api/services` - Add new service (Provider only)
- `PUT /api/services/:id` - Update service (Provider only)
- `DELETE /api/services/:id` - Delete service (Provider only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status
- `GET /api/availability/:providerId` - Get provider time slots

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/services/:id/approve` - Approve service

### Images
- `POST /api/upload` - Upload service image

---

## 📸 Screenshots

### Landing Page
Modern hero section with service categories and testimonials

### Customer Dashboard
Browse and filter services with GPS location support

### Provider Dashboard
Manage services, bookings, and schedules in one place

### Admin Panel
Complete platform management and analytics

---

## 👨‍💻 Developer

**Durvesh Ali**
- GitHub: [@durveshali49](https://github.com/durveshali49)

---

##  Support

For support, open an issue in the GitHub repository.

---

<div align="center">
  <p>Developed by Durvesh Ali</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
