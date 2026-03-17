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
    MessageSquare,
    FileText,
    Download,
    ChevronDown,
    ChevronUp
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

const isDocumentUrl = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.pdf') || lower.includes('.doc') || lower.includes('raw/upload');
};

const RemarksPanel = ({ complaintId }) => {
    const [history, setHistory] = React.useState([]);
    const [expanded, setExpanded] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const loadHistory = async (e) => {
        if (e) e.stopPropagation();
        if (expanded) { setExpanded(false); return; }
        setLoading(true);
        try {
            const res = await ComplaintService.getStatusHistory(complaintId);
            const withRemarks = (res.data || []).filter(h => h.remarks && h.remarks.trim());
            setHistory(withRemarks);
            setExpanded(true);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={loadHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                <MessageSquare size={14} />
                {loading ? 'Loading...' : expanded ? 'Hide Remarks' : 'Official Remarks'}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expanded && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {history.length === 0 ? (
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>No official remarks yet.</p>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #1e40af', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <span style={{ fontWeight: 700, color: '#1e40af' }}>{h.status?.replace('_', ' ')}</span>
                                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0 }}>{h.remarks}</p>
                                {h.updatedBy && <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0', fontStyle: 'italic' }}>— {h.updatedBy.username}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const UserDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMapComplaint, setSelectedMapComplaint] = useState(null);
    const [, setTick] = useState(0);

    useEffect(() => {
        loadComplaints();
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
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
                            return (
                                <div key={complaint.id} className="complaint-card" onClick={() => setSelectedMapComplaint(complaint)}>
                                    <div className="card-image-container">
                                        {complaint.imageUrl && isDocumentUrl(complaint.imageUrl) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: '#64748b' }}>
                                                <FileText size={36} />
                                                <span style={{ fontSize: '0.875rem' }}>Document Attached</span>
                                                <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', background: '#1e40af', color: 'white', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none' }}>
                                                    <Download size={14} /> Download
                                                </a>
                                            </div>
                                        ) : complaint.imageUrl ? (
                                            <img src={complaint.imageUrl} alt="Evidence" className="card-image" />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <ImageIcon size={32} />
                                                <span className="no-image-text">No Evidence Provided</span>
                                            </div>
                                        )}

                                        <div className={`status-pill status-${complaint.status.toLowerCase()}`}>
                                            {getStatusIcon(complaint.status)}
                                            {complaint.status.replace('_', ' ')}
                                        </div>

                                        {(() => {
                                            const elapsed = Date.now() - new Date(complaint.createdAt).getTime();
                                            const remaining = Math.max(0, 7 * 60 * 1000 - elapsed);
                                            const mins = Math.floor(remaining / 1000 / 60);
                                            const secs = Math.floor((remaining / 1000) % 60);
                                            return remaining > 0 ? (
                                                <button className="delete-btn" onClick={(e) => handleDeleteComplaint(complaint.id, e)}>
                                                    <Trash2 size={16} />
                                                    <span style={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}>
                                                        {mins}:{secs.toString().padStart(2, '0')}
                                                    </span>
                                                </button>
                                            ) : null;
                                        })()}
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
                                        
                                        <RemarksPanel complaintId={complaint.id} />
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
                    border-radius: 16px;
                    padding: 0 0.75rem;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 20;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .delete-btn:hover {
                    background: #dc2626;
                    transform: scale(1.05);
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
