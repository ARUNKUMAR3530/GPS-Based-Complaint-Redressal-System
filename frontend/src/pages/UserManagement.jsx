import React, { useEffect, useState } from 'react';
import SuperAdminService from '../services/superAdmin.service';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit } from 'lucide-react';

const UserManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        departmentId: '',
        municipalityId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [adminsRes, deptsRes, munisRes] = await Promise.all([
                SuperAdminService.getAllAdmins(),
                SuperAdminService.getAllDepartments(),
                SuperAdminService.getAllMunicipalities()
            ]);
            setAdmins(adminsRes.data);
            setDepartments(deptsRes.data);
            setMunicipalities(munisRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await SuperAdminService.createAdmin({
                username: formData.username,
                password: formData.password,
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                municipalityId: formData.municipalityId ? parseInt(formData.municipalityId) : null
            });
            toast.success("Admin created successfully");
            setShowModal(false);
            setFormData({ username: '', password: '', departmentId: '', municipalityId: '' });
            loadData(); // Reload list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create admin");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this admin?")) {
            try {
                await SuperAdminService.deleteAdmin(id);
                toast.success("Admin deleted");
                loadData();
            } catch (error) {
                toast.error("Failed to delete admin");
            }
        }
    };

    return (
        <div className="user-management-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>User Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add New Admin
                </button>
            </div>

            <div className="table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Username</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Department</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Municipality</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No admins found.</td></tr>
                        ) : (
                            admins.map(admin => (
                                <tr key={admin.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px' }}>{admin.id}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{admin.username}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {admin.department ? (
                                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {admin.department.name}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {admin.municipality ? (
                                            <span style={{ background: '#fce7f3', color: '#9d174d', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {admin.municipality.name}
                                            </span>
                                        ) : <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Global (Super)</span>}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '8px', minWidth: '400px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Create New Admin</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Department (Optional)</label>
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                >
                                    <option value="">-- Select Department --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <small style={{ color: '#6b7280' }}>Leave empty for Super Admin (if Municipality also empty)</small>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Municipality (Optional)</label>
                                <select
                                    name="municipalityId"
                                    value={formData.municipalityId}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                >
                                    <option value="">-- Select Municipality --</option>
                                    {municipalities.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
