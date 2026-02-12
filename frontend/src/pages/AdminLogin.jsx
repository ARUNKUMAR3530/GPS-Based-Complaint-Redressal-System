import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminLogin(username, password);
            toast.success("Admin Login Successful");
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error("Login Failed: " + (error.response?.data?.message || "Invalid credentials"));
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto', border: '2px solid maroon' }}>
            <h2 className="text-center mb-4" style={{ color: 'maroon' }}>Admin Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-danger" style={{ width: '100%', backgroundColor: 'maroon' }}>Login</button>
            </form>
        </div>
    );
};

export default AdminLogin;
