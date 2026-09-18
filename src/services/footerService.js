import API from '../api/axios';

export const footerService = {
  // Get footer
  getFooter: async () => {
    const response = await API.get('/api/footer');
    return response.data;
  },

  // Create footer
  createFooter: async (data) => {
    const response = await API.post('/api/footer', data);
    return response.data;
  },

  // Update footer
  updateFooter: async (data) => {
    const response = await API.put('/api/footer', data);
    return response.data;
  },

  // Delete footer
  deleteFooter: async (id) => {
    const response = await API.delete(`/api/footer/${id}`);
    return response.data;
  }
};

// ✅ YE ADD KARO - Default export
export default footerService;