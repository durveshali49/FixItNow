import React from 'react';
import './ServiceDetailModal.css';
import { Star, X, Tag, MapPin, User } from 'lucide-react'; // MODIFIED: Using Lucide icons

const StarRating = ({ rating, count }) => {
    if (count === 0 || !rating) {
        return <div className="detail-rating-text">No reviews yet</div>;
    }
    const fullStars = Math.round(rating);
    return (
        <div className="detail-star-rating">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < fullStars ? "star-filled" : "star-empty"} />
            ))}
            <span className="detail-rating-text">{parseFloat(rating).toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})</span>
        </div>
    );
};

const ServiceDetailModal = ({ service, onClose }) => {
    if (!service) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="close-btn"><X /></button>
                <img 
                    src={service.image_url || `https://placehold.co/600x400/030613/00f6ff?text=${encodeURIComponent(service.service_name)}`} 
                    alt={service.service_name} 
                    className="detail-modal-img" 
                />
                <div className="detail-modal-content">
                    <div className="detail-modal-header">
                        <h2>{service.service_name}</h2>
                        <p className="detail-modal-price">₹{service.price ? Number(service.price).toLocaleString('en-IN') : 'N/A'}</p>
                    </div>
                    
                    <StarRating rating={service.average_rating} count={service.review_count} />
                    
                    <p className="detail-modal-description">
                        {service.description || "No description provided."}
                    </p>
                    
                    <div className="detail-modal-meta">
                        <div className="meta-item">
                            <Tag size={16} />
                            <span><strong>Category:</strong> {service.category}</span>
                        </div>
                        <div className="meta-item">
                            <MapPin size={16} />
                            <span><strong>Location:</strong> {service.location}</span>
                        </div>
                         <div className="meta-item">
                            <User size={16} />
                            <span><strong>Provider:</strong> {service.provider_name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;