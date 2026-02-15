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
    Trash2
} from 'lucide-react';
import './UserDashboard.css';
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

const UserDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMapComplaint, setSelectedMapComplaint] = useState(null);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await ComplaintService.getAllComplaints();
            setComplaints(response.data);
        } catch (error) {
            toast.error("Failed to load complaints");
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

    const handleDeleteComplaint = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
            try {
                await ComplaintService.deleteComplaint(id);
                toast.success("Complaint deleted successfully");
                setComplaints(complaints.filter(c => c.id !== id));
            } catch (error) {
                toast.error("Failed to delete complaint: " + (error.response?.data?.message || "Unknown error"));
            }
        }
    };

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

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading your complaints...</p>
                </div>
            ) : (
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
                            return (
                                <div key={complaint.id} className="complaint-card" onClick={() => setSelectedMapComplaint(complaint)}>
                                    <div className="card-image-container">
                                        {complaint.imageUrl ? (
                                            <img
                                                src={`/uploads/${complaint.imageUrl}`}
                                                alt={complaint.title}
                                                className="card-image"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className="no-image-placeholder" style={{ display: complaint.imageUrl ? 'none' : 'flex' }}>
                                            <ImageIcon size={32} />
                                            <span className="no-image-text">No Evidence Provided</span>
                                        </div>

                                        <div className={`status-pill status-${complaint.status.toLowerCase()}`}>
                                            {getStatusIcon(complaint.status)}
                                            {complaint.status.replace('_', ' ')}
                                        </div>

                                        {isDeletable && (
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => handleDeleteComplaint(complaint.id, e)}
                                                title="Delete this complaint (Only available for 7 mins)"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="card-content">
                                        <div className="card-meta-top">
                                            <span className="complaint-id">#{complaint.id}</span>
                                            <span className="complaint-date">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <h3 className="card-title">{complaint.title}</h3>
                                        <p className="card-description">{complaint.description}</p>

                                        <div className="card-details">
                                            <div className="detail-item">
                                                <MapPin />
                                                <span className="truncate">{complaint.address || "Location unavailable"}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock />
                                                <span>{new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <style>{`
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
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .delete-btn:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }
            `}</style>

            {/* Map Modal */}
            {selectedMapComplaint && (
                <div className="modal-overlay" onClick={() => setSelectedMapComplaint(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedMapComplaint(null)}>&times;</button>
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
        </div>
    );
};

export default UserDashboard;
