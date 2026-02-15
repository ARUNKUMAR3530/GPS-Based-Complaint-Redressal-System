import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="home-container">
            <h1 className="home-title">Welcome to the Civic Complaint Redressal System</h1>
            <p className="home-subtitle">
                Empowering citizens to report issues and helping authorities resolve them efficiently.
            </p>

            <div className="home-actions">
                {!currentUser ? (
                    <>
                        <Link to="/login" className="btn btn-primary home-btn">Login to Report</Link>
                        <Link to="/register" className="btn btn-secondary home-btn">Register</Link>
                    </>
                ) : (
                    <Link to="/dashboard" className="btn btn-primary home-btn">Go to Dashboard</Link>
                )}
            </div>
        </div>
    );
};

export default Home;
