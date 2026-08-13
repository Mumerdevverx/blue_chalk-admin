import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function AddItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', type: '', mediaUrl: '', link: '', description: '', order: 0 })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      try {
        const res = await api.get(`/items/${id}`)
        if (mounted) setForm(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => (mounted = false)
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('type', form.type)
      payload.append('mediaUrl', form.mediaUrl)
      payload.append('link', form.link)
      payload.append('description', form.description)
      payload.append('order', form.order)
      if (file) payload.append('file', file)

      if (id) {
        await api.put(`/items/${id}`, payload)
      } else {
        await api.post('/items', payload)
      }
      navigate('/items')
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{id ? 'Edit Item' : 'Add Item'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-xl">
        <label className="block mb-2">
          <span className="text-sm">Title</span>
          <input name="title" value={form.title} onChange={onChange} required className="mt-1 block w-full rounded border-gray-300" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Type</span>
          <input name="type" value={form.type} onChange={onChange} className="mt-1 block w-full rounded border-gray-300" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Media URL</span>
          <input name="mediaUrl" value={form.mediaUrl} onChange={onChange} className="mt-1 block w-full rounded border-gray-300" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">File Upload</span>
          <input type="file" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Link</span>
          <input name="link" value={form.link} onChange={onChange} className="mt-1 block w-full rounded border-gray-300" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Description</span>
          <textarea name="description" value={form.description} onChange={onChange} className="mt-1 block w-full rounded border-gray-300" />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Order</span>
          <input type="number" name="order" value={form.order} onChange={onChange} className="mt-1 block w-24 rounded border-gray-300" />
        </label>

        <div className="flex items-center space-x-2">
          <button disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => navigate('/items')} className="px-3 py-2 rounded border">Cancel</button>
        </div>
      </form>
    </div>
  )
}
