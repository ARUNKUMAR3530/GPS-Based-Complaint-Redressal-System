import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintService from '../services/complaint.service';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Plus,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Image as ImageIcon,
    Trash2,
    FileText
} from 'lucide-react';
import './UserDashboard.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMapComplaint, setSelectedMapComplaint] = useState(null);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ComplaintService.getAllComplaints();
            setComplaints(response.data || []);
        } catch (err) {
            console.error('Failed to load complaints:', err);
            // Only show error if NOT a 401 (401 is handled by interceptor)
            if (err.response?.status !== 401) {
                setError('Failed to load complaints. Please try again.');
                toast.error('Failed to load complaints');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={14} />;
            case 'IN_PROGRESS': return <AlertCircle size={14} />;
            case 'COMPLETED': return <CheckCircle2 size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'PENDING';
            case 'IN_PROGRESS': return 'IN PROGRESS';
            case 'COMPLETED': return 'COMPLETED';
            case 'REJECTED': return 'REJECTED';
            default: return status;
        }
    };

    const handleDeleteComplaint = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
            try {
                await ComplaintService.deleteComplaint(id);
                toast.success('Complaint deleted successfully');
                setComplaints(complaints.filter(c => c.id !== id));
            } catch (err) {
                toast.error('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
            }
        }
    };

    const isImageUrl = (url) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|gif|webp)/i.test(url) || url.includes('cloudinary') && !url.includes('.pdf') && !url.includes('.docx');
    };

    if (loading) {
        return (
            <div className="user-dashboard">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading your complaints...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-dashboard">
                <div className="empty-state">
                    <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#ef4444' }} />
                    <h3>Could not load complaints</h3>
                    <p>{error}</p>
                    <button onClick={loadComplaints} className="btn-report" style={{ marginTop: '1.5rem', textDecoration: 'none' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2>My Complaints</h2>
                    <p>Track the status of your reported issues.</p>
                </div>
                <Link to="/lodge-complaint" className="btn-report">
                    <Plus size={18} /> Report New Issue
                </Link>
            </div>

            <div className="complaints-grid">
                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No Issues Reported Yet</h3>
                        <p>You haven't submitted any complaints. Help improve your city by reporting an issue today.</p>
                        <Link to="/lodge-complaint" className="btn-report" style={{ marginTop: '1.5rem' }}>
                            Report Now
                        </Link>
                    </div>
                ) : (
                    complaints.map(complaint => {
                        const isDeletable = (new Date().getTime() - new Date(complaint.createdAt).getTime()) < 7 * 60 * 1000;
                        const statusClass = `status-${complaint.status?.toLowerCase()}`;

                        return (
                            <div
                                key={complaint.id}
                                className="complaint-card"
                                onClick={() => complaint.latitude && setSelectedMapComplaint(complaint)}
                            >
                                {/* Image / Placeholder */}
                                <div className="card-image-container">
                                    {complaint.imageUrl && isImageUrl(complaint.imageUrl) ? (
                                        <img
                                            src={complaint.imageUrl}
                                            alt={complaint.title}
                                            className="card-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}

                                    <div
                                        className="no-image-placeholder"
                                        style={{ display: (complaint.imageUrl && isImageUrl(complaint.imageUrl)) ? 'none' : 'flex' }}
                                    >
                                        <ImageIcon size={32} />
                                        <span className="no-image-text">No Evidence Provided</span>
                                    </div>

                                    {/* Status pill */}
                                    <div className={`status-pill ${statusClass}`}>
                                        {getStatusIcon(complaint.status)}
                                        {getStatusLabel(complaint.status)}
                                    </div>

                                    {/* Delete button (7-min window) */}
                                    {isDeletable && (
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => handleDeleteComplaint(complaint.id, e)}
                                            title="Delete this complaint (only available within 7 minutes)"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="card-content">
                                    <div className="card-meta-top">
                                        <span className="complaint-id">C-{complaint.id}</span>
                                        <span className="complaint-date">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="card-title">{complaint.title}</h3>
                                    <p className="card-description">{complaint.description}</p>

                                    <div className="card-details">
                                        <div className="detail-item">
                                            <MapPin size={14} />
                                            <span className="truncate">
                                                {complaint.address || 'Location unavailable'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <FileText size={14} />
                                            <span>{complaint.category}</span>
                                        </div>
                                    </div>

                                    {/* View Map link */}
                                    {complaint.latitude && (
                                        <button
                                            className="view-map-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMapComplaint(complaint);
                                            }}
                                        >
                                            <MapPin size={14} /> View Map
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Map Modal */}
            {selectedMapComplaint && (
                <div className="modal-overlay" onClick={() => setSelectedMapComplaint(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedMapComplaint(null)}>
                            &times;
                        </button>
                        <h3>Location: {selectedMapComplaint.title}</h3>
                        <div style={{ marginTop: '1rem' }}>
                            <MapContainer
                                center={[selectedMapComplaint.latitude, selectedMapComplaint.longitude]}
                                zoom={15}
                                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[selectedMapComplaint.latitude, selectedMapComplaint.longitude]}>
                                    <Popup>
                                        <strong>{selectedMapComplaint.title}</strong><br />
                                        {selectedMapComplaint.status}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .view-map-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 0.75rem;
                    background: none;
                    border: 1px solid #2563eb;
                    color: #2563eb;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .view-map-btn:hover {
                    background: #2563eb;
                    color: white;
                }
                .delete-btn {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: rgba(239, 68, 68, 0.9);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 20;
                    transition: all 0.2s;
                }
                .delete-btn:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    gap: 1rem;
                    color: #64748b;
                }
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UserDashboard;
