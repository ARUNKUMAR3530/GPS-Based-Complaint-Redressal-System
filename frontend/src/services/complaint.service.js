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
    // Sending data in the body is more conventional for PUT requests.
    return api.put(`/admin/complaints/${id}/status`, { status, remarks });
};

const deleteComplaint = (id) => {
    return api.delete(`/complaints/${id}`);
};

const getComplainantDetails = (id) => {
    return api.get(`/admin/complaints/${id}/complainant-details`);
};

const ComplaintService = {
    getAllComplaints,
    getComplaintById,
    createComplaint,
    getAllComplaintsAdmin,
    updateStatus,
    deleteComplaint,
    getComplainantDetails
};

export default ComplaintService;
