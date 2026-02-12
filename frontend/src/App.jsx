import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Import AdminLayout
import UnifiedLogin from './pages/UnifiedLogin';
import Register from './pages/Register';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import LodgeComplaint from './pages/LodgeComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Supervision from './pages/Supervision';
import UserManagement from './pages/UserManagement';
import ComplaintDetailsAdmin from './pages/ComplaintDetailsAdmin';
import ChangePassword from './pages/ChangePassword';

// Layout for User pages (Navbar + Container)
const UserLayout = ({ children }) => (
    <>
        <Navbar />
        <div className="container mt-4">
            {children}
        </div>
    </>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<UserLayout><Home /></UserLayout>} />
                    <Route path="/login" element={<UserLayout><UnifiedLogin /></UserLayout>} />
                    <Route path="/register" element={<UserLayout><Register /></UserLayout>} />
                    <Route path="/admin/login" element={<UserLayout><UnifiedLogin /></UserLayout>} />

                    {/* User Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
                        <Route path="/lodge-complaint" element={<UserLayout><LodgeComplaint /></UserLayout>} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin/change-password" element={<ChangePassword />} />

                    <Route element={<ProtectedRoute adminOnly={true} />}>

                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="complaints" element={<AdminDashboard />} />
                            <Route path="supervision" element={<Supervision />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="complaints/:id/details" element={<ComplaintDetailsAdmin />} />
                        </Route>
                    </Route>

                </Routes>
                <ToastContainer position="bottom-right" />
            </Router>
        </AuthProvider>
    );
}

export default App;
