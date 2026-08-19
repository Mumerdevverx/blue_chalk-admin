import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h3 className="text-xl font-bold mb-4">Admin</h3>
        <nav className="space-y-2">
          <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-700">Home</Link>
          <Link to="/about" className="block px-3 py-2 rounded hover:bg-gray-700">About</Link>
          <Link to="/contacts" className="block px-3 py-2 rounded hover:bg-gray-700">Contacts</Link>
          <Link to="/news" className="block px-3 py-2 rounded hover:bg-gray-700">News</Link>
          <Link to="/work" className="block px-3 py-2 rounded hover:bg-gray-700">Work</Link>
          <Link to="/footer" className="block px-3 py-2 rounded hover:bg-gray-700">Footer</Link>

        </nav>

        <div className="mt-6">
          <button onClick={logout} className="w-full bg-red-600 py-2 rounded">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}
