import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComplaintService from '../services/complaint.service';
import AuthService from '../services/auth.service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, MapPin, User, Phone, Mail, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import L from 'leaflet';

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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!complaint) return <div style={{ padding: '2rem', textAlign: 'center' }}>Complaint not found</div>;

    const user = showPrivateData && privateData ? privateData : complaint.user;

    return (
        <div className="complaint-details-page" style={{ paddingBottom: '2rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4b5563',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                }}
            >
                <ArrowLeft size={20} /> Back
            </button>

            <div className="details-header" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                            {complaint.title}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            <span>ID: C-{complaint.id}</span>
                            <span>•</span>
                            <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <span className={`status-badge status-${complaint.status.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {complaint.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column */}
                <div className="details-main" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Description Card */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                            <FileText size={20} /> Description
                        </h3>
                        <p style={{ lineHeight: '1.6', color: '#4b5563' }}>{complaint.description}</p>
                    </div>

                    {/* Image Card */}
                    {complaint.imageUrl && (
                        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                                Evidence
                            </h3>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <img
                                    src={`/uploads/${complaint.imageUrl}`}
                                    alt="Evidence"
                                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', background: '#f9fafb' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="details-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Complainant Details (Gatekeeper) */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                            <User size={20} /> Complainant Details
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563' }}>
                                <User size={16} />
                                <span>{user ? user.fullName : 'Unknown'}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563' }}>
                                <Phone size={16} />
                                <span>{user ? user.mobile : '******'}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563' }}>
                                <Mail size={16} />
                                <span>{user ? user.email : '******'}</span>
                            </div>

                            {!showPrivateData && (
                                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#92400e' }}>
                                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0 }}>
                                            Contact details are masked for Data Privacy.
                                            {isSuperAdmin ? " As Super Admin, you can reveal this." : " Only Super Admin can view this."}
                                        </p>
                                    </div>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={handleViewPrivateData}
                                            style={{
                                                marginTop: '0.75rem',
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: '#d97706',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            View Private Data
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                            <MapPin size={20} /> Location
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                            {complaint.address || "No address provided"}
                        </p>
                        {complaint.latitude && (
                            <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
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
