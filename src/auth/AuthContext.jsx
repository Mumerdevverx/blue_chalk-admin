import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

function saveToken(token) {
  if (!token) {
    throw new Error('Authentication token was not returned by the server')
  }

  localStorage.setItem('token', token)
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

function clearToken() {
  localStorage.removeItem('token')
  delete api.defaults.headers.common.Authorization
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return
    }

    api.get('/api/auth/me')
      .then((response) => {
        setUser(response.data.user || response.data)
      })
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const response = await api.post('/api/auth/login', { email, password })
    saveToken(response.data.token)
    setUser(response.data.user || { authenticated: true })
    return response.data
  }

  async function signup(name, email, password) {
    const response = await api.post('/api/auth/signup', { name, email, password })

    if (response.data.token) {
      saveToken(response.data.token)
      setUser(response.data.user || { authenticated: true })
    }

    return response.data
  }

  function logout() {
    clearToken()
    setUser(null)
    window.location.assign('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
