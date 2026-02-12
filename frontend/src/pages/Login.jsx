import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            toast.success("Login Successful");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Login Failed: " + (error.response?.data?.message || "Invalid credentials"));
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2 className="text-center mb-4">Login</h2>
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
            </form>
            <p className="text-center mt-4">
                <a href="/admin/login">Admin Login</a>
            </p>
        </div>
    );
};

export default Login;
