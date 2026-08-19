import API from '../api/axios';

export const footerService = {
  // Get footer
  getFooter: async () => {
    const response = await API.get('/footer');
    return response.data;
  },

  // Create footer
  createFooter: async (data) => {
    const response = await API.post('/footer', data);
    return response.data;
  },

  // Update footer
  updateFooter: async (data) => {
    const response = await API.put('/footer', data);
    return response.data;
  },

  // Delete footer
  deleteFooter: async (id) => {
    const response = await API.delete(`/footer/${id}`);
    return response.data;
  }
};

// ✅ YE ADD KARO - Default export
export default footerService;