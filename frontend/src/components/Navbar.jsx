import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const ADMIN_ROLES = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MUNICIPALITY_ADMIN'];

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = currentUser?.roles && ADMIN_ROLES.some(role => currentUser.roles.includes(role));

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
                            {isAdmin ? (
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
