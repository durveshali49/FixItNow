import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from 'react-select'; // For custom themed dropdowns
import "./ProviderDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import ImageUploader from './ImageUploader';
import { 
    Layers, LayoutDashboard, ClipboardList, PlusCircle, CalendarClock, BookUser, 
    User, LogOut, FilePenLine, Trash2, CircleDollarSign, Bell, Star
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

// --- FIXED: Updated category list to be consistent with the rest of the app ---
const FALLBACK_CATEGORIES = ["Home Painting", "AC Repair & Service", "RO Water Purifier", "Catering Services", "Pest Control", "Movers & Packers", "Other"];
const FALLBACK_AVAILABILITIES = ["Available", "Unavailable", "Busy"];

const categoryOptions = FALLBACK_CATEGORIES.map(cat => ({ value: cat, label: cat }));
const availabilityOptions = FALLBACK_AVAILABILITIES.map(opt => ({ value: opt, label: opt }));

const customSelectStyles = {
    control: (provided) => ({ ...provided, backgroundColor: 'var(--dark-bg)', borderColor: 'var(--border-color)', borderRadius: '10px', padding: '6px', boxShadow: 'none', '&:hover': { borderColor: 'var(--accent-color)' } }),
    placeholder: (provided) => ({ ...provided, color: 'var(--text-secondary)' }),
    singleValue: (provided) => ({ ...provided, color: 'var(--text-primary)' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ ...provided, color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)' } }),
    menu: (provided) => ({ ...provided, backgroundColor: 'var(--sidebar-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)', overflow: 'hidden', zIndex: 1001 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? 'rgba(0, 246, 255, 0.2)' : state.isFocused ? 'rgba(0, 246, 255, 0.1)' : 'transparent', color: state.isSelected ? 'var(--text-primary)' : state.isFocused ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: state.isSelected ? '600' : '500', cursor: 'pointer' }),
    input: (provided) => ({ ...provided, color: 'var(--text-primary)' }),
};

const StatCard = ({ icon, title, value, color, animationDelay }) => (
    <div className="stat-card" style={{ '--stat-color': color, animationDelay }}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <span className="stat-title">{title}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const StarRatingDisplay = ({ rating }) => (
    <div className="star-rating-display">
        {[...Array(5)].map((_, index) => (
            <Star key={index} size={16} className={index < rating ? 'star-filled' : 'star-empty'}/>
        ))}
    </div>
);

const ProviderDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const navigate = useNavigate();
    const [form, setForm] = useState({ service_name: "", description: "", category: "", price: "", location: "", image_url: "", availability: "Available" });
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileDetails, setProfileDetails] = useState({ name: '', email: '' });
    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const initializeSchedule = () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days.map((day, index) => ({ day_of_week: index, day_name: day, start_time: "09:00", end_time: "17:00", is_available: false }));
    };

    const fetchProviderData = async (providerId, initialLoad = false) => {
        if (initialLoad) setLoading(true);
        try {
            const [servicesRes, bookingsRes, scheduleRes] = await Promise.all([
                axiosWithAuth.get("/services", { params: { provider_id: providerId } }),
                axiosWithAuth.get("/bookings"),
                axiosWithAuth.get("/schedules")
            ]);
            setServices(servicesRes.data || []);
            const sortedBookings = (bookingsRes.data || []).sort((a, b) => new Date(b.booking_start_time) - new Date(a.booking_start_time));
            setBookings(sortedBookings);
            const fetchedSchedule = scheduleRes.data;
            const fullSchedule = initializeSchedule();
            fetchedSchedule.forEach(s => {
                const dayIndex = fullSchedule.findIndex(d => d.day_of_week === s.day_of_week);
                if (dayIndex !== -1) {
                    fullSchedule[dayIndex] = { ...fullSchedule[dayIndex], start_time: s.start_time.substring(0, 5), end_time: s.end_time.substring(0, 5), is_available: s.is_available };
                }
            });
            setSchedule(fullSchedule);
        } catch (err) {
            if(initialLoad) toast.error("Failed to fetch provider data.");
        } finally {
            if (initialLoad) setLoading(false);
        }
    };
    
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
            setUser(currentUser);
            fetchProviderData(currentUser.id, true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate]);

    useEffect(() => {
        setIsEditServiceModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsProfileEditModalOpen(false);
    }, [activeTab]);

    const handleSubmit = async (e) => { e.preventDefault(); try { await axiosWithAuth.post("/services", { ...form }); toast.success("Service submitted for admin approval!"); setForm({ service_name: "", description: "", category: "", price: "", location: "", image_url: "", availability: "Available" }); await fetchProviderData(user.id); setActiveTab('services'); } catch (err) { toast.error(err.response?.data?.message || "Failed to add service."); } };
    const handleUpdateService = async (e) => { e.preventDefault(); if (!editingService) return; try { await axiosWithAuth.put(`/services/${editingService.id}`, editingService); setIsEditServiceModalOpen(false); await fetchProviderData(user.id); toast.success("Service updated successfully!"); } catch (err) { toast.error(err.response?.data?.message || "Failed to update service."); } };
    const handleDelete = async () => { if(!serviceToDelete) return; try { await axiosWithAuth.delete(`/services/${serviceToDelete.id}`); await fetchProviderData(user.id); setIsDeleteModalOpen(false); toast.success("Service deleted successfully!"); } catch (err) { toast.error(err.response?.data?.message || "Failed to delete service."); } };
    const handleScheduleChange = (dayIndex, field, value) => { setSchedule(currentSchedule => currentSchedule.map((day, index) => (index === dayIndex ? { ...day, [field]: value } : day))); };
    const handleSaveSchedule = async () => { try { const payload = schedule.map(s => ({ ...s, start_time: `${s.start_time}:00`, end_time: `${s.end_time}:00` })); await axiosWithAuth.post('/schedules', { schedules: payload }); toast.success("Schedule saved successfully!"); } catch (error) { toast.error("Failed to save schedule."); } };
    const handleBookingStatusChange = async (bookingId, newStatus) => { try { await axiosWithAuth.put(`/bookings/${bookingId}/status`, { status: newStatus }); toast.success("Booking status updated!"); await fetchProviderData(user.id); } catch(error) { toast.error("Failed to update booking status."); } };
    const handleUpdateProfile = async (e) => { e.preventDefault(); try { await axiosWithAuth.put('/users/me', profileDetails); const updatedUser = { ...user, ...profileDetails }; localStorage.setItem('user', JSON.stringify(updatedUser)); setUser(updatedUser); setIsProfileEditModalOpen(false); toast.success("Profile updated successfully!"); } catch(err) { toast.error(err.response?.data?.message || "Failed to update profile."); } };
    const handleSignOut = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate('/login'); };
    
    const handleEditSelectChange = (name, selectedOption) => {
        setEditingService(prev => ({ ...prev, [name]: selectedOption.value }));
    };

    const statsData = useMemo(() => ({
        totalServices: services.length,
        pendingBookings: bookings.filter(b => b.status === "Pending").length,
        totalEarnings: bookings.filter(b => b.status === "Completed").reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }),
    }), [services, bookings]);

    const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
    
    const headerTitle = useMemo(() => {
        switch(activeTab) {
            case 'dashboard': return 'Dashboard';
            case 'services': return 'My Services';
            case 'addService': return 'Add a New Service';
            case 'schedule': return 'My Weekly Schedule';
            case 'bookings': return 'Customer Bookings';
            default: return 'Provider Dashboard';
        }
    }, [activeTab]);

    const renderContent = () => {
        if (loading) {
            return <div className="loader-container"><div className="loader"></div></div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div key="dashboard" className="page-content">
                        <div className="stats-grid">
                            <StatCard icon={<ClipboardList size={28}/>} title="Total Services" value={statsData.totalServices} color="var(--primary-color)" animationDelay="100ms" />
                            <StatCard icon={<Bell size={28}/>} title="Pending Bookings" value={statsData.pendingBookings} color="var(--warning-color)" animationDelay="200ms" />
                            <StatCard icon={<CircleDollarSign size={28}/>} title="Completed Earnings" value={statsData.totalEarnings} color="var(--success-color)" animationDelay="300ms" />
                        </div>
                    </div>
                );
            case 'services':
                 return (
                    <div key="services" className="page-content">
                        <section className="content-panel">
                            <div className="table-wrapper">
                                {services.length === 0 ? <p className="empty-state">No services yet. Add one in the 'Add Service' tab.</p> : (
                                    <table className="provider-table">
                                        <thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Approval Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                        {services.map(s => (
                                            <tr key={s.id}>
                                                <td><div className="service-name-cell"><img src={s.image_url || `https://placehold.co/100x100/030613/00f6ff?text=${s.service_name.charAt(0)}`} alt={s.service_name}/><span>{s.service_name}</span></div></td>
                                                <td>{s.category}</td>
                                                <td>₹{s.price || 'N/A'}</td>
                                                <td><span className={`status-badge ${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                                <td className="actions-cell">
                                                    <button className="btn-icon" title="Edit Service" onClick={() => { setEditingService(s); setIsEditServiceModalOpen(true); }}><FilePenLine size={16}/></button>
                                                    <button className="btn-icon danger" title="Delete Service" onClick={() => { setServiceToDelete(s); setIsDeleteModalOpen(true); }}><Trash2 size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </div>
                );
            case 'addService':
                return (
                     <div key="addService" className="page-content">
                        <section className="content-panel">
                             <p className="panel-subtitle">Newly added services will be sent to an admin for approval before they are visible to customers.</p>
                            <form className="add-service-form" onSubmit={handleSubmit}>
                                <div className="form-group full-width"><label htmlFor="service_name">Service Name</label><input id="service_name" className="form-input" required placeholder="e.g., Expert Plumbing Repair" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} /></div>
                                <div className="form-group full-width"><label htmlFor="description">Description</label><textarea id="description" className="form-textarea" required placeholder="Describe the service you offer in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="form-group"><label htmlFor="category">Category</label><select id="category" required className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select Category *</option>{FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                                <div className="form-group"><label htmlFor="price">Price (₹)</label><input id="price" className="form-input" required placeholder="e.g., 500" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                                <div className="form-group">
                                    <label htmlFor="location">Your Location</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input id="location" className="form-input" required placeholder="e.g., Durgapur" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ flex: 1 }} />
                                        <button type="button" className="btn-secondary" onClick={async () => {
                                            if (navigator.geolocation) {
                                                toast.info("Getting your location...", { position: "top-center" });
                                                navigator.geolocation.getCurrentPosition(
                                                    async (position) => {
                                                        const { latitude, longitude } = position.coords;
                                                        try {
                                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                                            const data = await response.json();
                                                            const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown Location";
                                                            setForm({ ...form, location: city });
                                                            toast.success(`Location set to: ${city}`, { position: "top-center" });
                                                        } catch (error) {
                                                            setForm({ ...form, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                                                            toast.success("Location coordinates set!", { position: "top-center" });
                                                        }
                                                    },
                                                    (error) => {
                                                        toast.error("Unable to get location. Please enter manually.", { position: "top-center" });
                                                    }
                                                );
                                            } else {
                                                toast.error("Geolocation is not supported by your browser.", { position: "top-center" });
                                            }
                                        }} style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}>📍 Use GPS</button>
                                    </div>
                                </div>
                                <div className="form-group"><label>Initial Availability</label><select className="form-select" required value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>{FALLBACK_AVAILABILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                <div className="form-group full-width"><label>Service Image</label><ImageUploader onUploadComplete={(url) => setForm({...form, image_url: url})} /></div>
                                <div className="form-group full-width panel-footer"><button type="submit" className="btn-primary"><PlusCircle size={18} /> Add Service</button></div>
                            </form>
                        </section>
                    </div>
                );
            case 'schedule':
                return (
                    <div key="schedule" className="page-content">
                        <section className="content-panel">
                             <p className="panel-subtitle">Set your available hours for each day. Customers will only be able to book slots within these times.</p>
                            <div className="schedule-editor">
                                {schedule.map((day, index) => (
                                    <div key={day.day_of_week} className="schedule-day-row">
                                        <label className="schedule-day-label">{day.day_name}</label>
                                        <input type="checkbox" className="schedule-checkbox" checked={day.is_available} onChange={(e) => handleScheduleChange(index, 'is_available', e.target.checked)} />
                                        <div className="schedule-time-inputs" style={{ opacity: day.is_available ? 1 : 0.5 }}>
                                            <input type="time" disabled={!day.is_available} value={day.start_time} onChange={e => handleScheduleChange(index, 'start_time', e.target.value)} />
                                            <span>to</span>
                                            <input type="time" disabled={!day.is_available} value={day.end_time} onChange={e => handleScheduleChange(index, 'end_time', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="panel-footer"><button className="btn-primary" onClick={handleSaveSchedule}>Save Schedule</button></div>
                        </section>
                    </div>
                );
            case 'bookings':
                return (
                    <div key="bookings" className="page-content">
                         {bookings.length === 0 && !loading ? <p className="empty-state">You have no bookings yet.</p> : (
                            <div className="provider-bookings-list">
                                {bookings.map(b => (
                                    <div key={b.id} className="provider-booking-card">
                                        <div className="provider-card-main">
                                            <div className="provider-card-details">
                                                <h4>{b.service_name}</h4>
                                                <p><strong>Customer:</strong> {b.customer_name}</p>
                                                <p><strong>Date:</strong> {format(new Date(b.booking_start_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                                                {b.review_id && (
                                                    <div className="review-display-provider">
                                                        <StarRatingDisplay rating={b.rating} />
                                                        {b.comment && <p className="review-comment-provider">"{b.comment}"</p>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="provider-card-status">
                                                <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                                            </div>
                                        </div>
                                        {(b.status === 'Pending' || b.status === 'Confirmed') && (
                                            <div className="provider-card-actions">
                                                {b.status === 'Pending' && ( <>
                                                    <button className="btn-small success" onClick={() => handleBookingStatusChange(b.id, 'Confirmed')}>Confirm</button>
                                                    <button className="btn-small danger" onClick={() => handleBookingStatusChange(b.id, 'Cancelled')}>Cancel</button>
                                                </>)}
                                                {b.status === 'Confirmed' && (<button className="btn-small" onClick={() => handleBookingStatusChange(b.id, 'Completed')}>Mark as Completed</button>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="provider-dashboard">
            <ToastContainer theme="dark" position="bottom-right"/>
            <header className="provider-header">
                <div className="header-left">
                    <div className="logo">
                        <Layers />
                        <span>FixItNow</span>
                    </div>
                    <h1 className="header-title">Provider Dashboard</h1>
                </div>
                <div className="header-right">
                    <div className="profile-menu">
                        <button onClick={() => setIsProfileDropdownOpen(prev => !prev)} className="profile-btn">
                            <User size={20}/>
                            <div className="profile-btn-text">
                                <span className="profile-name">{user?.name || 'Provider'}</span>
                            </div>
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{user?.name}</p>
                                    <p className="dropdown-email">{user?.email}</p>
                                </div>
                                <button onClick={() => { setProfileDetails({ name: user.name, email: user.email }); setIsProfileDropdownOpen(false); setIsProfileEditModalOpen(true); }} className="dropdown-item"><FilePenLine size={16} /> Edit Profile</button>
                                <button onClick={() => navigate('/my-bookings')} className="dropdown-item"><BookUser size={16}/> My Bookings</button>
                                <button onClick={handleSignOut} className="dropdown-item"><LogOut size={16} /> Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="dashboard-body">
                <aside className="provider-sidebar">
                    <nav className="sidebar-nav">
                        <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /><span>Dashboard</span></button>
                        <button className={`nav-link ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}><ClipboardList size={20} /><span>My Services</span></button>
                        <button className={`nav-link ${activeTab === 'addService' ? 'active' : ''}`} onClick={() => setActiveTab('addService')}><PlusCircle size={20} /><span>Add Service</span></button>
                        <button className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}><CalendarClock size={20} /><span>My Schedule</span></button>
                        <button className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                            <BookUser size={20} />
                            <span>Bookings</span>
                            {pendingBookingsCount > 0 && <span className="notification-badge">{pendingBookingsCount}</span>}
                        </button>
                    </nav>
                </aside>
                <main className="provider-main-content">
                    <header className="main-content-header"><h1>{headerTitle}</h1></header>
                    {renderContent()}
                </main>
            </div>
            
            {isEditServiceModalOpen && editingService && (
                <div className="modal-overlay" onClick={() => setIsEditServiceModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Service</h3></div>
                        <form onSubmit={handleUpdateService}>
                             <div className="modal-form-grid">
                                <div className="form-group full-width"><label>Service Name</label><input className="form-input" required value={editingService.service_name} onChange={e => setEditingService({ ...editingService, service_name: e.target.value })} /></div>
                                
                                <div className="form-group">
                                    <label>Category</label>
                                    <Select
                                        options={categoryOptions}
                                        value={categoryOptions.find(opt => opt.value === editingService.category)}
                                        onChange={(option) => handleEditSelectChange('category', option)}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                </div>

                                <div className="form-group"><label>Price (₹)</label><input type="number" className="form-input" placeholder="e.g. 500" value={editingService.price || ''} onChange={e => setEditingService({ ...editingService, price: e.target.value })} /></div>
                                
                                <div className="form-group">
                                    <label>Availability</label>
                                    <Select
                                        options={availabilityOptions}
                                        value={availabilityOptions.find(opt => opt.value === editingService.availability)}
                                        onChange={(option) => handleEditSelectChange('availability', option)}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                </div>

                                <div className="form-group"><label>Location</label><input type="text" className="form-input" placeholder="e.g. Durgapur" value={editingService.location || ''} onChange={e => setEditingService({ ...editingService, location: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Description</label><textarea className="form-textarea" required value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Service Image</label><ImageUploader initialImageUrl={editingService.image_url} onUploadComplete={(url) => setEditingService({...editingService, image_url: url})} /></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsEditServiceModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && serviceToDelete && (
                 <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                      <div className="modal-content confirm-delete-modal" onClick={e => e.stopPropagation()}>
                           <div className="modal-header"><h3>Confirm Deletion</h3></div>
                           <p>Are you sure you want to delete the service "{serviceToDelete?.service_name}"? This action cannot be undone.</p>
                           <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
                           </div>
                      </div>
                 </div>
            )}
            
            {isProfileEditModalOpen && (
                 <div className="modal-overlay" onClick={() => setIsProfileEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Your Profile</h3></div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group"><label>Full Name</label><input type="text" className="form-input" required value={profileDetails.name} onChange={(e) => setProfileDetails({...profileDetails, name: e.target.value})} /></div>
                            <div className="form-group"><label>Email Address</label><input type="email" className="form-input" required value={profileDetails.email} onChange={(e) => setProfileDetails({...profileDetails, email: e.target.value})} /></div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsProfileEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ProviderDashboard;