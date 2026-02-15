import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComplaintService from '../services/complaint.service';
import AuthService from '../services/auth.service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, MapPin, User, Phone, Mail, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import L from 'leaflet';
import './ComplaintDetailsAdmin.css';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ComplaintDetailsAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [privateData, setPrivateData] = useState(null);
    const [showPrivateData, setShowPrivateData] = useState(false);

    const currentUser = AuthService.getCurrentUser();
    const isSuperAdmin = currentUser && !currentUser.departmentId && currentUser.roles.includes("ROLE_ADMIN");

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        setLoading(true);
        try {
            const response = await ComplaintService.getComplaintById(id);
            setComplaint(response.data);
        } catch (error) {
            toast.error("Failed to load complaint details");
            navigate('/admin/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPrivateData = async () => {
        try {
            const response = await ComplaintService.getComplainantDetails(id);
            setPrivateData(response.data);
            setShowPrivateData(true);
            toast.success("Private data retrieved successfully");
        } catch (error) {
            toast.error("Access Denied: Only Super Admin can view private data.");
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (!complaint) return <div className="text-center p-4">Complaint not found</div>;

    const user = showPrivateData && privateData ? privateData : complaint.user;

    return (
        <div className="complaint-details-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className="details-header">
                <div className="header-content">
                    <div className="header-title-section">
                        <h1>{complaint.title}</h1>
                        <div className="header-meta">
                            <span>ID: C-{complaint.id}</span>
                            <span>•</span>
                            <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <span className={`status-badge status-${complaint.status.toLowerCase()}`}>
                        {complaint.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="details-grid">
                {/* Left Column */}
                <div className="details-main">

                    {/* Description Card */}
                    <div className="details-card">
                        <h3 className="card-header-title">
                            <FileText size={20} /> Description
                        </h3>
                        <p className="description-text">{complaint.description}</p>
                    </div>

                    {/* Image Card */}
                    {complaint.imageUrl && (
                        <div className="details-card">
                            <h3 className="card-header-title">
                                Evidence
                            </h3>
                            <div className="evidence-image-container">
                                <img
                                    src={`/uploads/${complaint.imageUrl}`}
                                    alt="Evidence"
                                    className="evidence-image"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="details-sidebar">

                    {/* Complainant Details (Gatekeeper) */}
                    <div className="details-card">
                        <h3 className="card-header-title">
                            <User size={20} /> Complainant Details
                        </h3>

                        <div className="info-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="info-row">
                                <User size={16} />
                                <span>{user ? user.fullName : 'Unknown'}</span>
                            </div>

                            <div className="info-row">
                                <Phone size={16} />
                                <span>{user ? user.mobile : '******'}</span>
                            </div>

                            <div className="info-row">
                                <Mail size={16} />
                                <span>{user ? user.email : '******'}</span>
                            </div>

                            {!showPrivateData && (
                                <div className="privacy-notice">
                                    <div className="privacy-content">
                                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0 }}>
                                            Contact details are masked for Data Privacy.
                                            {isSuperAdmin ? " As Super Admin, you can reveal this." : " Only Super Admin can view this."}
                                        </p>
                                    </div>
                                    {isSuperAdmin && (
                                        <button
                                            className="view-private-btn"
                                            onClick={handleViewPrivateData}
                                        >
                                            View Private Data
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="details-card">
                        <h3 className="card-header-title">
                            <MapPin size={20} /> Location
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                            {complaint.address || "No address provided"}
                        </p>
                        {complaint.latitude && (
                            <div className="map-container">
                                <MapContainer
                                    center={[complaint.latitude, complaint.longitude]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[complaint.latitude, complaint.longitude]} />
                                </MapContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetailsAdmin;
