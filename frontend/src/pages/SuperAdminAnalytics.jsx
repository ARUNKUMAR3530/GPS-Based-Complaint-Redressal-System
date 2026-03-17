import React, { useEffect, useState } from 'react';
import SuperAdminService from '../services/superAdmin.service';
import ComplaintService from '../services/complaint.service';
import { toast } from 'react-toastify';
import { BarChart2, Users, CheckCircle, Clock, Download, RefreshCw, MapPin, AlertCircle } from 'lucide-react';

const STATUS_COLORS = { PENDING: '#d97706', IN_PROGRESS: '#2563eb', COMPLETED: '#16a34a', REJECTED: '#dc2626' };
const CITIES = ['Chennai', 'Coimbatore', 'Salem'];
const CATEGORIES = ['ROAD', 'GARBAGE', 'WATER', 'ELECTRICITY', 'OTHER'];

const SuperAdminAnalytics = () => {
    const [complaints, setComplaints] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [cRes, aRes] = await Promise.all([
                ComplaintService.getAllComplaintsAdmin(),
                SuperAdminService.getAdminWorkStatus()
            ]);
            setComplaints(cRes.data || []);
            setAdmins(aRes.data || []);
        } catch { toast.error("Failed to load analytics"); }
        finally { setLoading(false); }
    };

    const total = complaints.length;
    const byStatus = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, REJECTED: 0 };
    complaints.forEach(c => { if (byStatus[c.status] !== undefined) byStatus[c.status]++; });
    const resolutionRate = total > 0 ? Math.round((byStatus.COMPLETED / total) * 100) : 0;
    const byCity = CITIES.map(city => ({ city, count: complaints.filter(c => c.cityName === city).length }));
    const byCategory = CATEGORIES.map(cat => ({ cat, count: complaints.filter(c => c.category === cat).length }));
    const maxCity = Math.max(...byCity.map(b => b.count), 1);
    const maxCat = Math.max(...byCategory.map(b => b.count), 1);

    const exportCSV = () => {
        const rows = [['ID','Title','Category','Status','City','Date'], ...complaints.map(c => [c.id, `"${c.title}"`, c.category, c.status, c.cityName||'N/A', new Date(c.createdAt).toLocaleDateString()])];
        const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `report_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        toast.success("Report downloaded!");
    };

    const card = (icon, value, label, bg, color) => (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{React.cloneElement(icon, { size: 22, color })}</div>
            <div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div><div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.2rem' }}>{label}</div></div>
        </div>
    );

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#6b7280' }}>Loading analytics...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div><h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem' }}>State-wide Analytics</h1><p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>Chennai · Coimbatore · Salem</p></div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#374151', border: '1px solid #e5e7eb', padding: '0.6rem 1.1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}><RefreshCw size={16} /> Refresh</button>
                    <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#1e40af', color: 'white', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}><Download size={16} /> Export CSV</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {card(<BarChart2/>, total, 'Total Complaints', '#e0f2fe', '#0284c7')}
                {card(<Clock/>, byStatus.PENDING, 'Pending', '#fef3c7', '#d97706')}
                {card(<CheckCircle/>, byStatus.COMPLETED, 'Resolved', '#dcfce7', '#16a34a')}
                {card(<Users/>, resolutionRate + '%', 'Resolution Rate', '#dbeafe', '#2563eb')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>Status Breakdown</h3>
                    {Object.entries(byStatus).map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status], flexShrink: 0 }} />
                            <span style={{ width: 90, fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>{status.replace('_',' ')}</span>
                            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: STATUS_COLORS[status], borderRadius: 4, width: total > 0 ? `${(count/total)*100}%` : '0%', transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', minWidth: 24, textAlign: 'right' }}>{count}</span>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16}/>By City</h3>
                    {byCity.map(({ city, count }) => (
                        <div key={city} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: 90, fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>{city}</span>
                            <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#1e40af', borderRadius: 6, width: `${(count/maxCity)*100}%`, transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', minWidth: 24, textAlign: 'right' }}>{count}</span>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertCircle size={16}/>By Category</h3>
                    {byCategory.map(({ cat, count }) => (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: 90, fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>{cat}</span>
                            <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#0891b2', borderRadius: 6, width: `${(count/maxCat)*100}%`, transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', minWidth: 24, textAlign: 'right' }}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>Official Work Status</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600, fontSize: '0.875rem' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Official','Department','Municipality','Total','Pending','Resolved','Progress'].map(h => (
                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {admins.map(admin => {
                                const pct = admin.totalComplaints > 0 ? Math.round((admin.resolvedComplaints / admin.totalComplaints) * 100) : 0;
                                return (
                                    <tr key={admin.adminId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{admin.username}</td>
                                        <td style={{ padding: '12px 14px', color: '#6b7280' }}>{admin.departmentName || '—'}</td>
                                        <td style={{ padding: '12px 14px', color: '#6b7280' }}>{admin.municipalityName || '—'}</td>
                                        <td style={{ padding: '12px 14px' }}>{admin.totalComplaints}</td>
                                        <td style={{ padding: '12px 14px', color: '#d97706', fontWeight: 600 }}>{admin.pendingComplaints}</td>
                                        <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>{admin.resolvedComplaints}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                                                    <div style={{ height: '100%', background: '#16a34a', borderRadius: 3, width: `${pct}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', minWidth: 36 }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminAnalytics;
