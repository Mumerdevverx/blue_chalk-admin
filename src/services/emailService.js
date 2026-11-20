import API from '../api/axios';

const emailService = {
  getSettings: async () => {
    const res = await API.get('/api/email/settings');
    return res.data;
  },

  updateSettings: async (data) => {
    const res = await API.put('/api/email/settings', data);
    return res.data;
  },

  sendTestEmail: async (targetEmail) => {
    const res = await API.post('/api/email/test', { targetEmail });
    return res.data;
  },

  getMessages: async (type) => {
    const res = await API.get('/api/email/messages', {
      params: type ? { type } : {}
    });
    return res.data;
  },

  deleteMessage: async (id) => {
    const res = await API.delete(`/api/email/messages/${id}`);
    return res.data;
  }
};

export default emailService;
