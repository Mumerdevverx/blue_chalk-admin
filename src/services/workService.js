
import API from '../api/axios';

export const workService = {
  // Get category chunk (12 items per chunk)
  getCategoryChunk: async (category, page = 1, limit = 12) => {
    const cat = String(category || '').trim().toLowerCase();
    let endpoint = `/api/work/category/${encodeURIComponent(category)}`;
    if (cat === 'all' || cat === 'all projects' || cat === 'all-projects') {
      endpoint = '/api/work/all-projects';
    } else if (cat === 'featured') {
      endpoint = '/api/work/featured';
    } else if (cat === 'brand' || cat === 'branded') {
      endpoint = '/api/work/branded';
    } else if (cat === 'entertainment') {
      endpoint = '/api/work/entertainment';
    } else if (cat === 'social impact' || cat === 'social-impact') {
      endpoint = '/api/work/social-impact';
    } else if (cat === 'documentary') {
      endpoint = '/api/work/documentary';
    } else if (cat === 'award' || cat === 'awards') {
      endpoint = '/api/work/award';
    }

    try {
      const res = await API.get(endpoint, {
        params: {
          page,
          limit,
          includeInactive: true
        }
      });

      return res.data;
    } catch (error) {
      if ((cat === 'award' || cat === 'awards') && error?.response?.status === 404) {
        const fallbackRes = await API.get('/api/work', {
          params: {
            category: 'Award',
            page,
            limit,
            includeInactive: true
          }
        });
        return fallbackRes.data;
      }
      throw error;
    }
  },

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
  delete: async (id, fromCategory) => {
    const config = {};
    if (fromCategory) {
      config.params = { fromCategory };
    }
    const res = await API.delete(`/api/work/${id}`, config);
    return res.data;
  },

  // Get All Projects order
  getOrder: async () => {
    const res = await API.get('/api/work/all-projects/order');
    return res.data;
  },

  // Save All Projects order
  saveOrder: async (projectIds) => {
    const res = await API.put('/api/work/all-projects/order', { projectIds });
    return res.data;
  }
};
