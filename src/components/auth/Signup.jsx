import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signup } = useAuth()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await signup(name, email, password)

      if (response.token) {
        navigate('/')
      } else {
        navigate('/login', { state: { message: 'Account created. Please sign in.' } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Admin Signup</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block mb-2">
          <span className="text-sm">Name</span>
          <input value={name} onChange={event => setName(event.target.value)} required type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </label>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={email} onChange={event => setEmail(event.target.value)} required type="email" className="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input value={password} onChange={event => setPassword(event.target.value)} required type="password" className="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </label>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <Link to="/login" className="block mt-4 text-center text-sm text-blue-600">
          Back to login
        </Link>
      </form>
    </div>
  )
}

export default Signup