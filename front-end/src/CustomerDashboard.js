import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from 'react-select'; // Using react-select for custom dropdowns
import "./CustomerDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingModal from './BookingModal';
import ServiceDetailModal from "./ServiceDetailModal";
import { 
    Layers, Search, MapPin, Tag, LogOut, User, Calendar, Star, ChevronDown, SlidersHorizontal 
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

// --- MODIFIED: Categories now match the ProviderDashboard ---
const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Home Painting", label: "Home Painting" },
    { value: "AC Repair & Service", label: "AC Repair & Service" },
    { value: "RO Water Purifier", label: "RO Water Purifier" },
    { value: "Catering Services", label: "Catering Services" },
    { value: "Pest Control", label: "Pest Control" },
    { value: "Movers & Packers", label: "Movers & Packers" },
    { value: "Other", label: "Other" },
];

const sortOptions = [
    { value: "rating_desc", label: "Sort by: Rating" },
    { value: "price_asc", label: "Sort by: Price Low to High" },
    { value: "price_desc", label: "Sort by: Price High to Low" },
];

const customSelectStyles = {
    control: (provided) => ({ ...provided, backgroundColor: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer', minHeight: '47px' }),
    placeholder: (provided) => ({ ...provided, color: 'var(--text-secondary)' }),
    singleValue: (provided) => ({ ...provided, color: 'var(--text-primary)' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ ...provided, color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)' } }),
    menu: (provided) => ({ ...provided, backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)', overflow: 'hidden', marginTop: '10px', zIndex: 20 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? 'rgba(0, 246, 255, 0.2)' : state.isFocused ? 'rgba(0, 246, 255, 0.1)' : 'transparent', color: state.isSelected ? 'var(--text-primary)' : state.isFocused ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: state.isSelected ? '600' : '500', cursor: 'pointer' }),
};

const StarRating = ({ rating, count }) => {
    const fullStars = Math.round(rating);
    if (count === 0 || !rating) {
        return <div className="star-rating"><span className="rating-text">No reviews yet</span></div>;
    }
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < fullStars ? "star-filled" : "star-empty"} />
            ))}
            <span className="rating-text">{parseFloat(rating).toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})</span>
        </div>
    );
};

const CustomerDashboard = () => {
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({ keyword: "", category: "", location: "", sortBy: "rating_desc" });
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const [profileDetails, setProfileDetails] = useState({ name: '', email: '' });
    
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const debounce = useCallback((func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }, []);

    const fetchServices = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/services`, { params: currentFilters });
            setAllServices(res.data || []);
        } catch (err) {
            toast.error("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetchServices = useMemo(() => debounce(fetchServices, 500), [debounce, fetchServices]);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) { setUser(currentUser); }
        debouncedFetchServices(filters);
    }, [token, navigate, filters, debouncedFetchServices]);

    useEffect(() => {
        let filtered = allServices;
        const keyword = filters.keyword.trim().toLowerCase();
        if (keyword) {
            filtered = filtered.filter(s =>
                (s.service_name && s.service_name.toLowerCase().includes(keyword)) ||
                (s.category && s.category.toLowerCase().includes(keyword)) ||
                (s.description && s.description.toLowerCase().includes(keyword))
            );
        }
        if (filters.category) {
            filtered = filtered.filter(s => s.category === filters.category);
        }
        if (filters.location) {
            filtered = filtered.filter(s => s.location && s.location.toLowerCase().includes(filters.location.trim().toLowerCase()));
        }
        if (filters.sortBy === "rating_desc") {
            filtered = filtered.slice().sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        } else if (filters.sortBy === "price_asc") {
            filtered = filtered.slice().sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        } else if (filters.sortBy === "price_desc") {
            filtered = filtered.slice().sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        }
        setServices(filtered);
    }, [allServices, filters]);
    
    const handleOpenBookingModal = (service) => { setSelectedService(service); setIsBookingModalOpen(true); };
    const handleOpenDetailModal = (service) => { setSelectedService(service); setIsDetailModalOpen(true); };
    const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
    const handleSelectChange = (name, selectedOption) => { setFilters(prev => ({ ...prev, [name]: selectedOption.value })); };
    const handleSignOut = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate('/login'); };
    const handleUpdateProfile = async (e) => { e.preventDefault(); try { await axiosWithAuth.put('/users/me', profileDetails); const updatedUser = { ...user, ...profileDetails }; localStorage.setItem('user', JSON.stringify(updatedUser)); setUser(updatedUser); toast.success("Profile updated successfully!"); setIsProfileEditModalOpen(false); } catch (error) { toast.error("Failed to update profile."); } };
    const getAvailabilityClass = (availability) => availability?.toLowerCase().replace(/\s+/g, '-') || 'unavailable';

    return (
        <div className="customer-dashboard">
            <ToastContainer theme="dark" position="bottom-right" />
            <header className="customer-header">
                <div className="logo" onClick={() => navigate('/')}><Layers /><span>FixItNow</span></div>
                <div className="header-right">
                    <div className="profile-menu">
                        <button onClick={() => setIsProfileDropdownOpen(prev => !prev)} className="profile-btn">
                            <span>Welcome, <strong>{user?.name?.split(' ')[0] || 'Customer'}</strong></span>
                            <ChevronDown size={20} />
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header"><p className="dropdown-name">{user?.name}</p><p className="dropdown-email">{user?.email}</p></div>
                                <button onClick={() => navigate('/my-bookings')} className="dropdown-item"><Calendar size={16} /> My Bookings</button>
                                <button onClick={() => { setProfileDetails({ name: user.name, email: user.email }); setIsProfileDropdownOpen(false); setIsProfileEditModalOpen(true); }} className="dropdown-item"><User size={16} /> Edit Profile</button>
                                <button onClick={handleSignOut} className="dropdown-item"><LogOut size={16} /> Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="customer-content-area">
                <div className="content-header">
                    <h1>Explore Services in <span className="gradient-text">Durgapur</span></h1>
                    <p>Find the best professionals for your needs, right in your neighborhood.</p>
                </div>

                <div className="filters-panel">
                    <div className="filter-segment">
                        <Search className="filter-icon" size={20}/>
                        <input type="text" name="keyword" className="filter-input" placeholder="Service, category..." value={filters.keyword} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-segment">
                        <MapPin className="filter-icon" size={20}/>
                        <div style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" name="location" className="filter-input" placeholder="Location" value={filters.location} onChange={handleFilterChange} style={{ flex: 1 }} />
                            <button 
                                type="button" 
                                onClick={async () => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            async (position) => {
                                                const { latitude, longitude } = position.coords;
                                                try {
                                                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                                    const data = await response.json();
                                                    const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown";
                                                    setFilters({ ...filters, location: city });
                                                } catch (error) {
                                                    setFilters({ ...filters, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                                                }
                                            },
                                            (error) => {
                                                alert("Unable to get location. Please enter manually.");
                                            }
                                        );
                                    } else {
                                        alert("Geolocation is not supported by your browser.");
                                    }
                                }}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'var(--accent-color)', 
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0.3rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title="Use my current location"
                            >
                                📍
                            </button>
                        </div>
                    </div>
                    <div className="filter-segment">
                         <Tag className="filter-icon" size={20}/>
                         <Select
                            className="filter-select-container"
                            classNamePrefix="fixitnow-select"
                            options={categoryOptions}
                            value={categoryOptions.find(opt => opt.value === filters.category)}
                            onChange={(option) => handleSelectChange('category', option)}
                            isSearchable={false}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                         />
                    </div>
                    <div className="filter-segment">
                        <SlidersHorizontal className="filter-icon" size={20}/>
                        <Select
                            className="filter-select-container"
                            classNamePrefix="fixitnow-select"
                            options={sortOptions}
                            value={sortOptions.find(opt => opt.value === filters.sortBy)}
                            onChange={(option) => handleSelectChange('sortBy', option)}
                            isSearchable={false}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : services.length > 0 ? (
                    <div className="services-grid">
                    {services.map((s, index) => (
                        <div key={s.id} className="service-card" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="card-clickable-area" onClick={() => handleOpenDetailModal(s)}>
                                <div className="card-img-container">
                                    <img src={s.image_url || `https://placehold.co/400x250/030613/00f6ff?text=${encodeURIComponent(s.service_name)}`} alt={s.service_name} className="card-img" />
                                    <span className="card-category-badge">{s.category}</span>
                                </div>
                                <div className="card-content">
                                    <div className="card-header"><h3>{s.service_name}</h3><p className="service-price">₹{s.price ? Number(s.price).toLocaleString('en-IN') : 'N/A'}</p></div>
                                    <StarRating rating={s.average_rating} count={s.review_count} />
                                    <p className="card-desc">{s.description}</p>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="provider-info"><User size={16} /><p>{s.provider_name || 'Anonymous'}</p></div>
                                {s.availability === "Available" ? <button className="book-btn" onClick={() => handleOpenBookingModal(s)}>Book Now</button> : <button className="book-btn disabled" disabled>Unavailable</button>}
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="no-results"><h3>No services found</h3><p>Try adjusting your search filters to find what you're looking for.</p></div>
                )}
            </main>
            
            {isBookingModalOpen && <BookingModal service={selectedService} onClose={() => setIsBookingModalOpen(false)} axiosWithAuth={axiosWithAuth} />}
            {isDetailModalOpen && <ServiceDetailModal service={selectedService} onClose={() => setIsDetailModalOpen(false)} />}
            {isProfileEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsProfileEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Your Profile</h3></div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group"><label>Full Name</label><input type="text" className="form-input" required value={profileDetails.name} onChange={(e) => setProfileDetails({...profileDetails, name: e.target.value})} /></div>
                            <div className="form-group"><label>Email Address</label><input type="email" className="form-input" required value={profileDetails.email} onChange={(e) => setProfileDetails({...profileDetails, email: e.target.value})} /></div>
                            <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setIsProfileEditModalOpen(false)}>Cancel</button><button type="submit" className="btn-primary">Save Changes</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;