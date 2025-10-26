// src/AdminDashboard.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';
import { Layers, Users, Briefcase, BarChart, ClipboardCheck, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

const StatCard = ({ icon, title, value, color, animationDelay }) => (
    <div className="admin-stat-card" style={{ '--stat-color': color, animationDelay }}>
        <div className="admin-stat-icon">{icon}</div>
        <div className="admin-stat-info">
            <span className="admin-stat-title">{title}</span>
            <span className="admin-stat-value">{value || 0}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [topCategories, setTopCategories] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchData = async () => {
        try {
            const [statsRes, servicesRes] = await Promise.all([
                axiosWithAuth.get('/admin/stats'),
                axiosWithAuth.get('/admin/services')
            ]);
            
            setStats(statsRes.data.stats || {});
            setTopCategories(statsRes.data.topCategories || []);
            setTopServices(statsRes.data.topServices || []);
            setServices(servicesRes.data || []);
        } catch (err) {
            toast.error("Failed to fetch admin data. You may not have access.");
            if (err.response?.status === 403) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!token || !currentUser || currentUser.role !== 'Admin') {
            toast.error("Access Denied.");
            navigate('/login');
        } else {
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate]);

    const handleServiceStatus = async (serviceId, status) => {
        try {
            await axiosWithAuth.put(`/admin/services/${serviceId}/status`, { status });
            toast.success(`Service has been ${status.toLowerCase()}.`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update service status.");
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loader-container"><div className="loader"></div></div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div key="dashboard" className="page-content">
                        <section className="stats-section">
                            <StatCard icon={<Users size={28} />} title="Total Users" value={stats.total_users} color="var(--primary-color)" animationDelay="100ms" />
                            <StatCard icon={<Briefcase size={28} />} title="Service Providers" value={stats.total_providers} color="var(--accent-color)" animationDelay="200ms" />
                            <StatCard icon={<BarChart size={28} />} title="Total Services" value={stats.total_services} color="var(--success-color)" animationDelay="300ms" />
                            <StatCard icon={<ClipboardCheck size={28} />} title="Completed Bookings" value={stats.completed_bookings} color="var(--warning-color)" animationDelay="400ms" />
                        </section>
                        <section className="analytics-section">
                            <div className="admin-panel" style={{animationDelay: '500ms'}}>
                                <h3 className="panel-header">Top Categories</h3>
                                <ul className="top-list">
                                    {topCategories.length > 0 ? topCategories.slice(0, 4).map((cat, index) => (
                                        <li key={index}><span className="list-item-name">{cat.category}</span><span className="list-item-count">{cat.booking_count} Bookings</span></li>
                                    )) : <li className='empty-list-item'>No booking data yet.</li>}
                                </ul>
                            </div>
                            <div className="admin-panel" style={{animationDelay: '600ms'}}>
                                <h3 className="panel-header">Top Services</h3>
                                <ul className="top-list">
                                    {topServices.length > 0 ? topServices.slice(0, 4).map((srv, index) => (
                                        <li key={index}><span className="list-item-name">{srv.service_name}</span><span className="list-item-count">{srv.booking_count} Bookings</span></li>
                                    )) : <li className='empty-list-item'>No booking data yet.</li>}
                                </ul>
                            </div>
                        </section>
                    </div>
                );
            case 'moderation':
                return (
                    <div key="moderation" className="page-content">
                        <section className="admin-panel">
                            <h3 className="panel-header">Service Listing Moderation</h3>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr><th>Service</th><th>Provider</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {services.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.service_name}</td>
                                                <td>{s.provider_name}</td>
                                                <td>{s.category}</td>
                                                <td>₹{s.price}</td>
                                                <td><span className={`status-badge ${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                                <td className="actions-cell">
                                                    {s.status === 'Pending' ? (
                                                        <>
                                                            <button className="btn-admin-action approve" onClick={() => handleServiceStatus(s.id, 'Approved')}>Approve</button>
                                                            <button className="btn-admin-action reject" onClick={() => handleServiceStatus(s.id, 'Rejected')}>Reject</button>
                                                        </>
                                                    ) : (
                                                        <span className="no-actions-text">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            <ToastContainer theme="dark" position="bottom-right" />
            <aside className="admin-sidebar">
                <div>
                    <div className="sidebar-logo">
                        <Layers />
                        <span>FixItNow Admin</span>
                    </div>
                    <nav className="sidebar-nav">
                        <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>
                        <button className={`nav-link ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                            <ShieldCheck size={20} />
                            <span>Moderation</span>
                        </button>
                    </nav>
                </div>
                <button onClick={handleSignOut} className="signout-btn">
                    <LogOut size={16} /> 
                    <span>Sign Out</span>
                </button>
            </aside>
            <main className="admin-main-content">
                <header className="main-header">
                    <h1>{activeTab === 'dashboard' ? 'Dashboard Overview' : 'Service Moderation'}</h1>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;