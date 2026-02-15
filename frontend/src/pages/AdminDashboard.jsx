import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ComplaintService from '../services/complaint.service';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';
import L from 'leaflet';
import {
    LayoutDashboard,
    MapPin,
    LogOut,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    ShieldCheck,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import './AdminDashboard.css';

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

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedMapComplaint, setSelectedMapComplaint] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);

    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const response = await ComplaintService.getAllComplaintsAdmin();
            setComplaints(response.data);
        } catch (error) {
            toast.error("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await ComplaintService.updateStatus(id, newStatus, "Status updated by Admin");
            toast.success("Status updated!");
            loadComplaints();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const statusMatch = filterStatus === 'ALL' || c.status === filterStatus;
        const deptMatch = filterDepartment === 'ALL' ||
            (c.department && c.department.name === filterDepartment) ||
            (!c.department && c.category === filterDepartment);
        return statusMatch && deptMatch;
    });

    // Calculate Stats
    const stats = {
        pending: complaints.filter(c => c.status === 'PENDING').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'COMPLETED').length,
        rejected: complaints.filter(c => c.status === 'REJECTED').length
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="admin-dashboard-page">
            <div className="dashboard-title">
                <h1>Authority Dashboard</h1>
                <p>Manage and assign civic complaints.</p>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
                <div className="chart-card">
                    <h3>Complaint Status</h3>
                    {/* Placeholder for Chart - Recharts would go here */}
                    {/* Since I cannot guarantee recharts install worked fully without verifying, I will add simple bars or text if library fails, but let's try assuming it works or create a placeholder if import fails. 
                        Actually, let's just use simple HTML/CSS bars for robustness as user requested "Vanilla CSS" but "data visualization". 
                        I will use a simple CSS bar chart to be safe and fast. */}
                    <div className="simple-bar-chart">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="chart-bar-row">
                                <span className="chart-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <div className="chart-bar-bg">
                                    <div
                                        className="chart-bar-fill"
                                        style={{
                                            width: `${complaints.length > 0 ? (value / complaints.length) * 100 : 0}%`,
                                            background: key === 'pending' ? '#d97706' : key === 'resolved' ? '#16a34a' : key === 'rejected' ? '#dc2626' : '#2563eb'
                                        }}
                                    />
                                </div>
                                <span className="chart-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Resolution Rate</h3>
                    <div className="resolution-circle-container">
                        <div className="resolution-content">
                            <div className="resolution-percentage">
                                {complaints.length > 0 ? Math.round((stats.resolved / complaints.length) * 100) : 0}%
                            </div>
                            <div className="resolution-label">Resolution Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Actions */}
            <div className="filter-bar">
                {/* ... existing filter code ... */}
                <div className="filter-group">
                    <Filter size={18} color="#6b7280" />
                    <span>Filters:</span>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Departments</option>
                        <option value="ROAD">Roads</option>
                        <option value="GARBAGE">Garbage</option>
                        <option value="WATER">Water</option>
                        <option value="ELECTRICITY">Electricity</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <button onClick={loadComplaints} className="refresh-btn">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: '#d97706' }}>{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">In Progress</div>
                    <div className="stat-value" style={{ color: '#2563eb' }}>{stats.inProgress}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Resolved</div>
                    <div className="stat-value" style={{ color: '#16a34a' }}>{stats.resolved}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value" style={{ color: '#dc2626' }}>{stats.rejected}</div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID / Date</th>
                            <th>Issue</th>
                            <th>Department</th>
                            <th>Location</th>
                            <th>Evidence</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComplaints.length > 0 ? (
                            filteredComplaints.map(complaint => (
                                <tr key={complaint.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>C-{complaint.id}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(complaint.createdAt)}</div>
                                    </td>
                                    <td>
                                        <div className="issue-cell">
                                            <div
                                                className="issue-icon clickable-icon"
                                                onClick={() => setSelectedDescription(complaint)}
                                                title="Click to view full description"
                                            >
                                                <FileText size={20} />
                                            </div>
                                            <div className="issue-details">
                                                <h4>{complaint.title}</h4>
                                                <p>{complaint.description}</p>
                                                {/* Gatekeeper Link */}
                                                <button
                                                    className="btn-link"
                                                    style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }}
                                                    onClick={() => window.location.href = `/admin/complaints/${complaint.id}/details`}
                                                >
                                                    View Complainant Details (Restricted)
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="department-badge">
                                            {complaint.department ? complaint.department.name : complaint.category}
                                        </span>
                                    </td>
                                    <td>
                                        {complaint.latitude && (
                                            <div
                                                className="location-link"
                                                onClick={() => setSelectedMapComplaint(complaint)}
                                            >
                                                <MapPin size={16} /> Map
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {complaint.imageUrl ? (
                                            <div
                                                className="image-link"
                                                onClick={() => setSelectedImage(complaint)}
                                            >
                                                <ImageIcon size={20} /> View
                                            </div>
                                        ) : (
                                            <span className="text-muted" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No Image</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${complaint.status.toLowerCase()}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="action-select"
                                            value={complaint.status}
                                            onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '2rem' }}>
                                    No complaints found matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Modals remain the same... */}
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
            {/* Image Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedImage(null)}>&times;</button>
                        <h3>Complaint Evidence</h3>
                        <div className="full-image-container">
                            <img
                                src={selectedImage.imageUrl ? `/uploads/${selectedImage.imageUrl}` : '/placeholder-image.png'}
                                alt="Complaint Evidence"
                                className="full-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/400x300?text=No+Image+Available"
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Description Modal */}
            {selectedDescription && (
                <div className="modal-overlay" onClick={() => setSelectedDescription(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedDescription(null)}>&times;</button>
                        <h3>{selectedDescription.title}</h3>
                        <div style={{ marginTop: '1rem', color: '#374151', lineHeight: '1.6' }}>
                            <p><strong>Category:</strong> {selectedDescription.category}</p>
                            <p><strong>Status:</strong> {selectedDescription.status}</p>
                            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
                            <p><strong>Description:</strong></p>
                            <p>{selectedDescription.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
