import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Layers, ShieldCheck, Calendar, Star, Search, ArrowRight, Users } from "lucide-react";
import "./Home.css"; 

const Home = () => {
    const navigate = useNavigate();
    const features = [
        { icon: <Search size={28} />, title: "Find Local Services", description: "Discover trusted service providers in your area with advanced filtering options." },
        { icon: <Calendar size={28} />, title: "Easy Booking", description: "Schedule appointments instantly with our real-time availability checking system." },
        { icon: <Star size={28} />, title: "Verified Reviews", description: "Read authentic reviews from verified customers to make informed decisions." },
        { icon: <ShieldCheck size={28} />, title: "Secure & Reliable", description: "All providers are vetted for quality and payments are securely processed." }
    ];
    const serviceCategories = [
        { name: "Home Painting", icon: "🎨", count: "150+ professionals" },
        { name: "AC Repair & Service", icon: "❄️", count: "210+ technicians" },
        { name: "RO Water Purifier", icon: "💧", count: "180+ experts" },
        { name: "Catering Services", icon: "🍲", count: "90+ caterers" },
        { name: "Pest Control", icon: "🐞", count: "120+ agencies" },
        { name: "Movers & Packers", icon: "📦", count: "160+ teams" },
    ];
    const testimonials = [
        { name: "Anjali Sharma", role: "Resident, Durgapur", content: "FixItNow is a lifesaver! I booked a verified professional within minutes. Excellent service!", rating: 5 },
        { name: "Ravi Kumar", role: "Electrician from Benachity", content: "Joining FixItNow has transformed my business. I now get consistent work from my local area.", rating: 5 },
        { name: "Priya Das", role: "Working Professional, City Centre", content: "I used FixItNow for a small house party. The quality of food and service was exceptional. Highly recommended!", rating: 5 }
    ];
    const handleGetStarted = () => navigate('/signup');

    return (
        <div className="landing-container">
            <header className="main-header">
                <nav className="main-nav container">
                    <Link to="/" className="logo"><Layers /><span>FixItNow</span></Link>
                    <div className="nav-auth-links">
                        <Link to="/login" className="btn btn-secondary">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </div>
                </nav>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-content container">
                        <h1 className="hero-heading">Your Neighbourhood's <span className="gradient-text">Trusted Services</span>, On-Demand</h1>
                        <p className="hero-tagline">From electricians to pest control, find and book verified local professionals in Durgapur with complete peace of mind.</p>
                        <div className="hero-cta-group">
                            <button onClick={handleGetStarted} className="btn btn-hero-primary">Find a Service<ArrowRight size={20} /></button>
                            <button onClick={() => navigate('/signup?role=provider')} className="btn btn-hero-secondary">Join as a Professional</button>
                        </div>
                    </div>
                </section>

                <section className="stats-section container">
                    <div className="stat-item"><div className="stat-value">2,500+</div><div className="stat-label">Verified Professionals</div></div>
                    <div className="stat-item"><div className="stat-value">30,000+</div><div className="stat-label">Jobs Completed</div></div>
                    <div className="stat-item"><div className="stat-value">4.8★</div><div className="stat-label">Average User Rating</div></div>
                </section>

                <section className="features-section" id="features">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Why Choose <span className="gradient-text">FixItNow?</span></h2>
                            <p className="section-subtitle">We are dedicated to making your life easier by connecting you with the best local talent.</p>
                        </div>
                        <div className="features-grid">
                            {features.map((feature, index) => (
                                <div key={index} className="feature-card" style={{ "--delay": index }}><div className="feature-icon">{feature.icon}</div><h3 className="feature-title">{feature.title}</h3><p className="feature-description">{feature.description}</p></div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section className="how-it-works-section">
                    <div className="container">
                        <div className="section-header"><h2 className="section-title">Get Started in 3 Easy Steps</h2><p className="section-subtitle">Find the help you need without any hassle.</p></div>
                        <div className="how-it-works-grid">
                            <div className="step-card"><div className="step-number">1</div><h3 className="step-title">Describe Your Need</h3><p className="step-description">Tell us what service you're looking for and where you are located.</p></div>
                            <div className="step-card"><div className="step-number">2</div><h3 className="step-title">Choose Your Pro</h3><p className="step-description">Browse profiles, check reviews, and select the professional that fits your budget.</p></div>
                            <div className="step-card"><div className="step-number">3</div><h3 className="step-title">Book & Relax</h3><p className="step-description">Schedule a time that works for you and let our professionals handle the rest.</p></div>
                        </div>
                    </div>
                </section>

                <section className="categories-section">
                    <div className="container">
                        <div className="section-header"><h2 className="section-title">Popular Service Categories</h2><p className="section-subtitle">Whatever the job, we've got a verified professional ready to help.</p></div>
                        <div className="categories-grid">
                            {serviceCategories.map((category, index) => (
                                <div key={index} className="category-card"><span className="category-icon">{category.icon}</span><div><h3 className="category-name">{category.name}</h3><p className="category-count">{category.count}</p></div></div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section className="testimonials-section">
                    <div className="container">
                        <div className="section-header"><h2 className="section-title">Hear From Our Local Users</h2><p className="section-subtitle">We are proud to serve our community in Durgapur and beyond.</p></div>
                        <div className="testimonials-grid">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="testimonial-card"><div className="testimonial-rating">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} size={18} className="star-icon" />))}</div><p className="testimonial-content">"{testimonial.content}"</p><div className="testimonial-author"><div className="author-name">{testimonial.name}</div><div className="author-role">{testimonial.role}</div></div></div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <div className="cta-card"><div className="cta-content"><h2 className="cta-title">Ready to Simplify Your Life?</h2><p className="cta-subtitle">Post a job today or join our network of skilled professionals making a difference in our city.</p><div className="hero-cta-group"><button onClick={handleGetStarted} className="btn btn-hero-primary">Find Services Now</button><button onClick={() => navigate('/signup?role=provider')} className="btn btn-hero-secondary">Join as a Professional</button></div></div></div>
                    </div>
                </section>
            </main>

            <footer className="main-footer">
                <div className="container footer-content">
                    <div className="footer-brand"><div className="logo"><Layers /><span>FixItNow</span></div><p className="footer-tagline">Your trusted partner for local home and professional services.</p></div>
                    <div className="footer-links"><h4>For Customers</h4><ul><li><a href="#features">How It Works</a></li><li><Link to="/login">Find Services</Link></li><li><a href="/#">Safety</a></li></ul></div>
                    <div className="footer-links"><h4>For Professionals</h4><ul><li><Link to="/signup?role=provider">Join Network</Link></li><li><a href="/#">Success Stories</a></li><li><a href="/#">Support</a></li></ul></div>
                    <div className="footer-links"><h4>Company</h4><ul><li><a href="/#">About Us</a></li><li><a href="/#">Contact</a></li><li><a href="/#">Privacy Policy</a></li></ul></div>
                </div>
                <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} FixItNow. All rights reserved.</p></div>
            </footer>
        </div>
    );
};

export default Home;