import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ items: 0 })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/items/count')
        if (mounted) setStats(res.data)
      } catch (err) {
        // fallback: get items length
        try {
          const r = await api.get('/items')
          if (mounted) setStats({ items: r.data.length })
        } catch {}
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow"> 
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-3xl font-bold">{stats.items}</div>
        </div>
        <div className="bg-white p-4 rounded shadow"> 
          <div className="text-sm text-gray-500">Placeholder</div>
          <div className="text-3xl font-bold">—</div>
        </div>
        <div className="bg-white p-4 rounded shadow"> 
          <div className="text-sm text-gray-500">Placeholder</div>
          <div className="text-3xl font-bold">—</div>
        </div>
      </div>
    </div>
  )
}
