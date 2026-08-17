import api from './api'

export const getHomeItems = async () => {
  try {
    // Try /home first; if it returns 404, fallback to /items
    try {
      const res = await api.get('/home')
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.items || [])
      return { success: true, data }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const res = await api.get('/items')
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.items || [])
        return { success: true, data }
      }
      throw err
    }
  } catch (error) {
    console.error('Error fetching home items:', error)
    return { success: false, data: [], error: error.message }
  }
}

export const createHomeItem = async (data) => {
  try {
    try {
      const res = await api.post('/home', data)
      return res.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const res = await api.post('/items', data)
        return res.data
      }
      throw err
    }
  } catch (error) {
    console.error('Error creating home item:', error)
    throw error
  }
}

export const updateHomeItem = async (id, data) => {
  try {
    try {
      const res = await api.put(`/home/${id}`, data)
      return res.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const res = await api.put(`/items/${id}`, data)
        return res.data
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating home item:', error)
    throw error
  }
}

export const deleteHomeItem = async (id) => {
  try {
    try {
      const res = await api.delete(`/home/${id}`)
      return res.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const res = await api.delete(`/items/${id}`)
        return res.data
      }
      throw err
    }
  } catch (error) {
    console.error('Error deleting home item:', error)
    throw error
  }
}

const homeService = {
  getHomeItems,
  createHomeItem,
  updateHomeItem,
  deleteHomeItem,
}

export default homeService
