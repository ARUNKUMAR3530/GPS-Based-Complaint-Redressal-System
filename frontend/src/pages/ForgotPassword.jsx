import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Lock, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify & Reset
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { identifier });
            toast.success(response.data.message);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "User not found or error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                identifier,
                otpCode: otp,
                newPassword
            });
            toast.success(response.data.message);
            setStep(3); // Success state
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP or error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="recovery-card">
                <button className="back-link" onClick={() => navigate('/login')}>
                    <ArrowLeft size={18} />
                    <span>Back to Login</span>
                </button>

                <div className="recovery-header">
                    <h2>Account Recovery</h2>
                    <p>{step === 1 ? 'Enter your details to receive an OTP' : 
                        step === 2 ? 'Verify OTP and set new password' : 
                        'Success!'}</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="Username or Mobile Number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                            <div className="input-icon">
                                <User size={20} />
                            </div>
                        </div>
                        <button type="submit" className="recovery-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                            Send OTP
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="6-Digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                            />
                            <div className="input-icon">
                                <KeyRound size={20} />
                            </div>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                className="modern-input"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <div className="input-icon">
                                <Lock size={20} />
                            </div>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                className="modern-input"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className="input-icon">
                                <Lock size={20} />
                            </div>
                        </div>

                        <button type="submit" className="recovery-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                            Reset Password
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="success-state">
                        <CheckCircle2 color="#10b981" size={64} />
                        <h3>Successfully Reset!</h3>
                        <p>Your password has been updated. You can now log in with your new credentials.</p>
                        <button className="recovery-btn" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
