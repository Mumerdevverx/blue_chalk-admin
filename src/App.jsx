import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import api from './services/api'
import AllRoutes from './allRoutes'
import './App.css'

// Dev convenience: ensure a token exists and set axios header
function ensureDevToken() {
  const token = localStorage.getItem('token')
  if (!token) {
    const devToken = 'dev-token'
    localStorage.setItem('token', devToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${devToken}`
  } else {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

export default function App() {
  useEffect(() => { ensureDevToken() }, [])

  return (
    <BrowserRouter>
      <AllRoutes />
    </BrowserRouter>
  )
}
