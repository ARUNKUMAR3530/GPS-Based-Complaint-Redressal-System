import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        mobile: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await AuthService.register(
                formData.username,
                formData.email,
                formData.password,
                formData.fullName,
                formData.mobile
            );
            toast.success("Registration Successful! Please Login.");
            navigate('/login');
        } catch (error) {
            toast.error("Registration Failed: " + (error.response?.data?.message || "Error occurred"));
        }
    };

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <h2 className="text-center mb-4">Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="fullName" type="text" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input name="username" type="text" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input name="email" type="email" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input name="mobile" type="text" className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input name="password" type="password" className="form-control" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
            </form>
        </div>
    );
};

export default Register;
