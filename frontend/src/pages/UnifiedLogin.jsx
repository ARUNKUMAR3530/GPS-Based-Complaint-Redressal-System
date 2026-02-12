import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Lock, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import './UnifiedLogin.css';

const UnifiedLogin = () => {
    const [isLoginAsAdmin, setIsLoginAsAdmin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLoginAsAdmin) {
                await adminLogin(username, password);
                toast.success("Welcome back, Officer!");
                navigate('/admin/dashboard');
            } else {
                await login(username, password);
                toast.success("Welcome back, Citizen!");
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error("Login Failed: " + (error.response?.data?.message || "Invalid credentials"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-page ${isLoginAsAdmin ? 'admin-mode' : ''}`}>
            <div className="login-card">
                <div className="login-header">
                    <h2>{isLoginAsAdmin ? 'Officer Portal' : 'Public Grievance'}</h2>
                    <p>Tamil Nadu Municipal Administration</p>
                </div>

                <div className="login-toggle-container">
                    <button
                        className={`toggle-btn ${!isLoginAsAdmin ? 'active' : ''}`}
                        onClick={() => setIsLoginAsAdmin(false)}
                        type="button"
                    >
                        Citizen
                    </button>
                    <button
                        className={`toggle-btn ${isLoginAsAdmin ? 'active' : ''}`}
                        onClick={() => setIsLoginAsAdmin(true)}
                        type="button"
                    >
                        Official
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <div className="input-icon">
                            <User size={20} />
                        </div>
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="input-icon">
                            <Lock size={20} />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                        {isLoginAsAdmin ? 'Access Dashboard' : 'Secure Login'}
                    </button>
                </form>

                {!isLoginAsAdmin && (
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        Don't have an account? <a href="/register" style={{ color: '#60a5fa', textDecoration: 'none' }}>Register Here</a>
                    </p>
                )}
            </div>
        </div>
    );
};

export default UnifiedLogin;
