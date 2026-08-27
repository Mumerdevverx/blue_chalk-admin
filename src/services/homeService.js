import API from '../api/axios';

export const homeService = {
  // Get all home items
  getHomeItems: async () => {
    const response = await API.get('/home');
    return response.data;
  },

  // Create new home item
  createHomeItem: async (data) => {
    const response = await API.post('/home', data);
    return response.data;
  },

  // Update existing home item
  updateHomeItem: async (id, data) => {
    try {
      // ✅ Ensure id is a string
      const response = await API.put(`/home/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Update service error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete home item
  deleteHomeItem: async (id) => {
    const response = await API.delete(`/home/${id}`);
    return response.data;
  }
};

export default homeService;