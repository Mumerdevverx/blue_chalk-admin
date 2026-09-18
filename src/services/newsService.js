import API from '../api/axios';

export const newsService = {
  getAllNews: async () => {
    const response = await API.get('/api/news');
    return response.data;
  },
  getNewsBySlug: async (slug) => {
    const response = await API.get(`/api/news/slug/${slug}`);
    return response.data;
  },
  getNewsById: async (id) => {
    const response = await API.get(`/api/news/${id}`);
    return response.data;
  },
  createNews: async (data) => {
    const response = await API.post('/api/news', data);
    return response.data;
  },
  updateNews: async (id, data) => {
    const response = await API.put(`/api/news/${id}`, data);
    return response.data;
  },
  deleteNews: async (id) => {
    const response = await API.delete(`/api/news/${id}`);
    return response.data;
  }
};

// ✅ IMPORTANT: Default export
export default newsService;