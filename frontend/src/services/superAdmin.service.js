import api from './api';

const getAllAdmins = () => {
    return api.get('/super-admin/admins');
};

const createAdmin = (adminData) => {
    return api.post('/super-admin/admins', adminData);
};

const updateAdmin = (id, adminData) => {
    return api.put(`/super-admin/admins/${id}`, adminData);
};

const deleteAdmin = (id) => {
    return api.delete(`/super-admin/admins/${id}`);
};

const getAdminWorkStatus = () => {
    return api.get('/super-admin/admins/status');
};

const sendRemark = (adminId, message) => {
    return api.post(`/super-admin/admins/${adminId}/remark`, { message });
};

const getAllDepartments = () => {
    return api.get('/super-admin/departments');
};

const getAllMunicipalities = () => {
    return api.get('/super-admin/municipalities');
};

const SuperAdminService = {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminWorkStatus,
    sendRemark,
    getAllDepartments,
    getAllMunicipalities
};

export default SuperAdminService;
