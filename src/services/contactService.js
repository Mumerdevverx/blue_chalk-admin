import API from '../api/axios';

export const contactService = {
    getContacts: async () => {
        const response = await API.get('/contact');
        return response.data;
    },
    getOffice: async (officeName) => {
        const response = await API.get(`/contact/${officeName}`);
        return response.data;
    },
    createContact: async (data) => {
        const response = await API.post('/contact', data);
        return response.data;
    },
    updateContact: async (id, data) => {
        const response = await API.put(`/contact/${id}`, data);
        return response.data;
    },
    deleteContact: async (id) => {
        const response = await API.delete(`/contact/${id}`);
        return response.data;
    }
};

export default contactService;