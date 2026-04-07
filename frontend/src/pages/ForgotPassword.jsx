import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Phone, Lock, Loader2, ArrowLeft } from 'lucide-react';
import './UnifiedLogin.css'; // Re-use styling

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [identifier, setIdentifier] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // In actual implementation this would be returned from backend
    const [maskedMobile, setMaskedMobile] = useState('');

    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Update backend endpoint when AuthController is fully implemented
            // const response = await AuthService.sendOtp(identifier);
            // setMaskedMobile(response.data.maskedMobile);
            
            // Simulating API success for now since backend is still being wired up
            setTimeout(() => {
                setMaskedMobile('******9999'); // Mock
                toast.success("OTP sent to your registered mobile number");
                setStep(2);
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("User not found or an error occurred.");
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
            // Note: Update backend endpoint when AuthController is fully implemented
            // await AuthService.verifyOtpAndReset(identifier, otpCode, newPassword);
            
            // Simulating success
            setTimeout(() => {
                toast.success("Password reset successful! Please log in.");
                navigate('/login');
            }, 1000);
        } catch (error) {
            toast.error("Invalid OTP or error resetting password.");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <button 
                         onClick={() => step === 2 ? setStep(1) : navigate('/login')}
                         style={{ position: 'absolute', left: '-10px', top: '5px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    >
                         <ArrowLeft size={24} />
                    </button>
                    <h2>Password Recovery</h2>
                    <p>Tamil Nadu Municipal Administration</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                            Enter your Username or Mobile Number to receive an OTP.
                        </p>
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

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                            Send OTP
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        <p style={{ color: '#16a34a', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center', background: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>
                            OTP has been sent to <strong>{maskedMobile}</strong>
                        </p>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="Enter 6-digit OTP"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                required
                                maxLength="6"
                            />
                            <div className="input-icon">
                                <Phone size={20} />
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

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
