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

const deleteComplaint = (id) => {
    return api.delete(`/complaints/${id}`);
};

const getComplainantDetails = (id) => {
    return api.get(`/admin/complaints/${id}/complainant-details`);
};

const sendRemark = (adminId, complaintId, message) => {
    return api.post(`/super-admin/admins/${adminId}/remark`, { message }, {
        params: { complaintId }
    });
};

const replyToRemark = (complaintId, message) => {
    return api.post('/super-admin/admins/reply', { message }, {
        params: { complaintId }
    });
};

const ComplaintService = {
    getAllComplaints,
    getComplaintById,
    createComplaint,
    getAllComplaintsAdmin,
    updateStatus,
    deleteComplaint,
    getComplainantDetails,
    sendRemark,
    replyToRemark
};

export default ComplaintService;
