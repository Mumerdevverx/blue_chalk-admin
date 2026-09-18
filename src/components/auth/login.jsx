import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input value={password} onChange={e => setPassword(e.target.value)} required type="password" className="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </label>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <Link to="/signup" className="block mt-4 text-center text-sm text-blue-600">
          Create an account
        </Link>
      </form>
    </div>
  )
}