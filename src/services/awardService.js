import API from '../api/axios';

export const awardService = {
  // Get all awards
  getAll: async (params = {}) => {
    const res = await API.get('/api/awards', { params });
    return res.data;
  },

  // Get award by slug
  getBySlug: async (slug) => {
    const res = await API.get(`/api/awards/slug/${encodeURIComponent(slug)}`);
    return res.data;
  },

  // Get award by ID
  getById: async (id) => {
    const res = await API.get(`/api/awards/${id}`);
    return res.data;
  },

  // Create award
  create: async (data) => {
    const res = await API.post('/api/awards', data);
    return res.data;
  },

  // Update award
  update: async (id, data) => {
    const res = await API.put(`/api/awards/${id}`, data);
    return res.data;
  },

  // Delete award
  delete: async (id) => {
    const res = await API.delete(`/api/awards/${id}`);
    return res.data;
  },

  // Save awards order
  saveOrder: async (awardIds) => {
    const res = await API.put('/api/awards/order', { awardIds });
    return res.data;
  }
};

export default awardService;
