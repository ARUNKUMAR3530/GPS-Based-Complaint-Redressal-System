import React, { useEffect, useState } from 'react';
import SuperAdminService from '../services/superAdmin.service';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'; // Assuming recharts works

const Supervision = () => {
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [remarkMessage, setRemarkMessage] = useState('');
    const [selectedAdminId, setSelectedAdminId] = useState(null);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        setLoading(true);
        try {
            const response = await SuperAdminService.getAdminWorkStatus();
            setStatusData(response.data);
        } catch (error) {
            toast.error("Failed to load work status");
        } finally {
            setLoading(false);
        }
    };

    const handleSendRemark = async () => {
        if (!selectedAdminId || !remarkMessage) {
            toast.warning("Select an admin and enter a message");
            return;
        }

        try {
            await SuperAdminService.sendRemark(selectedAdminId, remarkMessage);
            toast.success("Remark sent successfully");
            setRemarkMessage('');
            setSelectedAdminId(null);
        } catch (error) {
            toast.error("Failed to send remark");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Supervision Module (Work Status)</h1>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {statusData.map(stat => (
                        <div key={stat.adminId} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3>{stat.adminName}</h3>
                            <p><strong>Department:</strong> {stat.departmentName || 'All Departments'}</p>
                            <p><strong>Municipality:</strong> {stat.municipalityName || 'N/A'}</p>
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '10px 0' }}>
                                <div style={{ color: '#d97706', fontWeight: 'bold' }}>Pending: {stat.pendingComplaints}</div>
                                <div style={{ color: '#16a34a', fontWeight: 'bold' }}>Resolved: {stat.resolvedComplaints}</div>
                            </div>

                            <button
                                onClick={() => setSelectedAdminId(stat.adminId)}
                                style={{ width: '100%', padding: '5px', marginTop: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Send Remark
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Remark Modal */}
            {selectedAdminId && (
                <div className="modal-overlay" onClick={() => setSelectedAdminId(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>Send Remark</h3>
                        <textarea
                            value={remarkMessage}
                            onChange={(e) => setRemarkMessage(e.target.value)}
                            style={{ width: '100%', height: '100px', margin: '10px 0' }}
                            placeholder="Enter your remark..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setSelectedAdminId(null)}>Cancel</button>
                            <button onClick={handleSendRemark} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Supervision;
