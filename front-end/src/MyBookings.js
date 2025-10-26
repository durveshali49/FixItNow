import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import RatingModal from './RatingModal';
import './MyBookings.css'; 
import { Star, ArrowLeft, Layers } from 'lucide-react'; // MODIFIED: Using Lucide icons

const API_BASE = "http://localhost:5000/api";

const StarRatingDisplay = ({ rating }) => {
    return (
        <div className="star-rating-display">
            {[...Array(5)].map((_, index) => (
                <Star key={index} size={20} className={index < rating ? 'star-filled' : 'star-empty'}/>
            ))}
        </div>
    );
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosWithAuth.get('/bookings');
            // Sort bookings by date, most recent first
            const sortedBookings = res.data.sort((a, b) => new Date(b.booking_start_time) - new Date(a.booking_start_time));
            setBookings(sortedBookings);
        } catch (error) {
            toast.error("Failed to fetch your bookings.");
        } finally {
            setLoading(false);
        }
    }, [axiosWithAuth]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);
        fetchBookings();
    }, [token, navigate, fetchBookings]);

    const handleOpenRatingModal = (booking) => {
        setSelectedBooking(booking);
        setIsRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setSelectedBooking(null);
    };

    const getStatusClass = (status) => {
        return status ? status.toLowerCase() : '';
    }

    const handleBackClick = () => {
        if (user?.role === 'Service Provider') {
            navigate('/provider');
        } else {
            navigate('/customer');
        }
    }
    
    return (
        <>
            <div className="my-bookings-page">
                <ToastContainer theme="dark" position="bottom-right" />
                <header className="bookings-header">
                    <Link to="/" className="logo">
                        <Layers />
                        <span>FixItNow</span>
                    </Link>
                    <button className="back-btn" onClick={handleBackClick}>
                        <ArrowLeft size={16}/>
                        <span>Back to Dashboard</span>
                    </button>
                </header>
                <main className="bookings-container">
                    <h1>My Bookings</h1>
                    <p>Here is a list of all your scheduled appointments and past services.</p>

                    <div className="bookings-list">
                        {loading ? (
                            <div className="loader-container"><div className="loader"></div></div>
                        ) : bookings.length > 0 ? (
                            bookings.map((booking, index) => (
                                <div key={booking.id} className="booking-card" style={{ animationDelay: `${index * 75}ms` }}>
                                    <div className="booking-card-header">
                                        <h3>{booking.service_name}</h3>
                                        <span className={`booking-status ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="booking-card-body">
                                        <p><strong>{user?.role === 'Customer' ? 'Provider' : 'Customer'}:</strong> {user?.role === 'Customer' ? booking.provider_name : booking.customer_name}</p>
                                        <p><strong>Date & Time:</strong> {format(new Date(booking.booking_start_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                                        <p><strong>Price:</strong> ₹{booking.price ? Number(booking.price).toLocaleString('en-IN') : 'N/A'}</p>
                                    </div>
                                    {booking.status === 'Completed' && (
                                        <div className="booking-card-footer">
                                            {booking.review_id ? (
                                                <div className="review-display">
                                                    <h4>{user?.role === 'Customer' ? 'Your Review' : 'Customer Review'}:</h4>
                                                    <StarRatingDisplay rating={booking.rating} />
                                                    {booking.comment && <p className="review-comment">"{booking.comment}"</p>}
                                                </div>
                                            ) : (
                                                user?.role === 'Customer' && (
                                                    <button className="btn-rate-review" onClick={() => handleOpenRatingModal(booking)}>
                                                        Rate & Review
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-bookings">
                               <p>You have no bookings yet.</p>
                               <button className="btn-primary" onClick={() => navigate('/customer')}>Explore Services</button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {isRatingModalOpen && (
                <RatingModal 
                    booking={selectedBooking}
                    onClose={handleCloseRatingModal}
                    axiosWithAuth={axiosWithAuth}
                    onReviewSubmit={fetchBookings}
                />
            )}
        </>
    );
};

export default MyBookings;