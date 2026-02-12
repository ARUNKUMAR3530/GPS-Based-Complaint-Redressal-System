import api from './api';

const getAllComplaints = () => {
    return api.get('/complaints/my');
};

const getComplaintById = (id) => {
    return api.get(`/complaints/${id}`);
};

const createComplaint = (formData) => {
    return api.post('/complaints', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Admin endpoints
const getAllComplaintsAdmin = () => {
    return api.get('/admin/complaints');
};

const updateStatus = (id, status, remarks) => {
    return api.put(`/admin/complaints/${id}/status`, null, {
        params: {
            status,
            remarks
        }
    });
};

const ComplaintService = {
    getAllComplaints,
    getComplaintById,
    createComplaint,
    getAllComplaintsAdmin,
    updateStatus
};

export default ComplaintService;
