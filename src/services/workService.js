
import API from '../api/axios';

export const workService = {
  // Get all works with complete content
  getAll: async () => {
    const res = await API.get('/api/work', {
      params: {
        includeInactive: true
      }
    });

    return res.data;
  },

  // Get work by slug
  getBySlug: async (slug) => {
    const res = await API.get(
      `/api/work/slug/${encodeURIComponent(slug)}`
    );

    return res.data;
  },

  // Get work by ID
  getById: async (id) => {
    const res = await API.get(`/api/work/${id}`);
    return res.data;
  },

  // Create work
  create: async (data) => {
    const res = await API.post('/api/work', data);
    return res.data;
  },

  // Update work
  update: async (id, data) => {
    const res = await API.put(`/api/work/${id}`, data);
    return res.data;
  },

  // Delete work
  delete: async (id) => {
    const res = await API.delete(`/api/work/${id}`);
    return res.data;
  }
};
