import API from '../api/axios';

export const workService = {
  getAll: async () => {
    const res = await API.get('/api/work');
    return res.data;
  },
  getBySlug: async (slug) => {
    const res = await API.get(`/api/work/slug/${slug}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await API.get(`/api/work/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await API.post('/api/work', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await API.put(`/api/work/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/api/work/${id}`);
    return res.data;
  }
};