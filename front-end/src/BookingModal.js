import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, addDays, startOfWeek } from 'date-fns';
import { toast } from 'react-toastify';
import './BookingModal.css';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'; // MODIFIED: Using Lucide icons

const API_BASE = "http://localhost:5000/api";

const BookingModal = ({ service, onClose, axiosWithAuth }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailableSlots = useCallback(async (date) => {
        if (!service) return;
        setIsLoading(true);
        setSelectedSlot(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await axios.get(`${API_BASE}/availability/${service.provider_id}/${dateStr}`);
            setAvailableSlots(res.data.availableSlots);
        } catch (error) {
            toast.error("Failed to fetch available slots.");
            setAvailableSlots([]);
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    useEffect(() => {
        fetchAvailableSlots(selectedDate);
    }, [selectedDate, fetchAvailableSlots]);

    const handleBooking = async () => {
        if (!selectedSlot) {
            toast.warn("Please select a time slot.");
            return;
        }
        
        const [hours, minutes] = selectedSlot.split(':');
        const bookingStartTime = new Date(selectedDate);
        bookingStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        try {
            await axiosWithAuth.post('/bookings', {
                service_id: service.id,
                provider_id: service.provider_id,
                booking_start_time: bookingStartTime.toISOString(),
            });
            toast.success("Booking request sent! You can track its status in 'My Bookings'.");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create booking.");
        }
    };
    
    const renderWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(currentWeek, i);
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isPast = day < new Date().setHours(0,0,0,0);
            
            days.push(
                <button 
                    key={i} 
                    disabled={isPast}
                    className={`day-btn ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => setSelectedDate(day)}
                >
                    <span className="day-name">{format(day, 'EEE')}</span>
                    <span className="day-number">{format(day, 'd')}</span>
                </button>
            );
        }
        return days;
    };
    
    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
    const prevWeek = () => setCurrentWeek(addDays(currentWeek, -7));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Book Appointment for <span className='highlight'>{service.service_name}</span></h3>
                    <button onClick={onClose} className="close-btn"><X /></button>
                </div>
                
                <div className="booking-body">
                    <div className="calendar-section">
                        <h4><Calendar size={20} /> Select a Date</h4>
                         <div className="week-navigator">
                            <button onClick={prevWeek}><ChevronLeft /></button>
                            <span>{format(currentWeek, 'MMMM yyyy')}</span>
                            <button onClick={nextWeek}><ChevronRight /></button>
                        </div>
                        <div className="week-days">{renderWeekDays()}</div>
                    </div>

                    <div className="slots-section">
                        <h4><Clock size={20} /> Select a Time</h4>
                        <div className="time-slots">
                            {isLoading ? <div className="loader small"></div> : availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button 
                                        key={slot}
                                        className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <p className="no-slots">No available slots for {format(selectedDate, 'MMMM d')}.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleBooking} disabled={!selectedSlot}>
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;