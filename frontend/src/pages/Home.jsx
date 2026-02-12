import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="text-center" style={{ marginTop: '5rem' }}>
            <h1>Welcome to the Civic Complaint Redressal System</h1>
            <p className="mt-4" style={{ fontSize: '1.2rem', color: '#666' }}>
                Empowering citizens to report issues and helping authorities resolve them efficiently.
            </p>

            <div className="mt-4">
                {!currentUser ? (
                    <>
                        <Link to="/login" className="btn btn-primary" style={{ marginRight: '1rem' }}>Login to Report</Link>
                        <Link to="/register" className="btn btn-secondary">Register</Link>
                    </>
                ) : (
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                )}
            </div>
        </div>
    );
};

export default Home;
