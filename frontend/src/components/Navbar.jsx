import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="brand-logo">Civic Complaint</Link>
                <div className="nav-links">
                    {!currentUser ? (
                        <>
                            <Link to="/login" className="btn-nav btn-nav-secondary">Login</Link>
                            <Link to="/register" className="btn-nav btn-nav-primary">Register</Link>
                        </>
                    ) : (
                        <>
                            <span className="welcome-text">Welcome, {currentUser.username}</span>
                            {currentUser.roles && currentUser.roles.includes('ROLE_ADMIN') ? (
                                <Link to="/admin/dashboard" className="btn-nav btn-nav-primary">Dashboard</Link>
                            ) : (
                                <Link to="/dashboard" className="btn-nav btn-nav-primary">Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="btn-nav btn-nav-danger">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
