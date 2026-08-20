import API from '../api/axios';

export const newsService = {
  getAllNews: async () => {
    const response = await API.get('/news');
    return response.data;
  },
  getNewsBySlug: async (slug) => {
    const response = await API.get(`/news/slug/${slug}`);
    return response.data;
  },
  getNewsById: async (id) => {
    const response = await API.get(`/news/${id}`);
    return response.data;
  },
  createNews: async (data) => {
    const response = await API.post('/news', data);
    return response.data;
  },
  updateNews: async (id, data) => {
    const response = await API.put(`/news/${id}`, data);
    return response.data;
  },
  deleteNews: async (id) => {
    const response = await API.delete(`/news/${id}`);
    return response.data;
  }
};

// ✅ IMPORTANT: Default export
export default newsService;