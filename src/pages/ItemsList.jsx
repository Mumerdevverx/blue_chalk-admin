import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ItemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/items')
      setItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/items/${id}`)
      setItems(items.filter(i => i._id !== id && i.id !== id))
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Items</h1>
        <Link to="/items/add" className="bg-blue-600 text-white px-3 py-2 rounded">Add Item</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Order</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id || item.id} className="border-t">
                  <td className="p-2">{item.title}</td>
                  <td className="p-2">{item.type}</td>
                  <td className="p-2">{item.order}</td>
                  <td className="p-2">
                    <Link to={`/items/edit/${item._id || item.id}`} className="mr-2 text-blue-600">Edit</Link>
                    <button onClick={() => remove(item._id || item.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
