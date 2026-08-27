import React, { useEffect, useState } from 'react'
import homeService from '../../services/homeService'

export default function HomePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [title, setTitle] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const res = await homeService.getHomeItems()
      console.log('📦 Loaded items:', res)
      if (res.success) {
        setItems(res.data)
      }
    } catch (error) {
      console.error('Error loading items:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [refreshKey])

  const resetForm = () => {
    setMediaUrl('')
    setTitle('')
    setEditingItem(null)
  }

  const handleAddVideo = () => {
    resetForm()
    setShowModal(true)
  }

  const handleAddImage = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (item) => {
    console.log('✏️ Editing item:', item)
    if (!item || !item._id) {
      alert('Cannot edit this item')
      return
    }
    setEditingItem(item)
    setMediaUrl(item.mediaUrl || '')
    setTitle(item.title || '')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!mediaUrl.trim()) {
      alert('Please enter a URL')
      return
    }

    setSaving(true)
    try {
      let type = 'video'
      if (editingItem) {
        type = editingItem.type || 'video'
      } else {
        const url = mediaUrl.trim().toLowerCase()
        if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.webp')) {
          type = 'image'
        }
      }

      const data = {
        title: title.trim() || 'Untitled',
        type: type,
        mediaUrl: mediaUrl.trim(),
        isActive: true,
        order: editingItem ? editingItem.order : items.length + 1
      }

      let response
      if (editingItem) {
        const id = editingItem._id || editingItem.id
        if (!id) throw new Error('Item ID missing')
        response = await homeService.updateHomeItem(id, data)
      } else {
        response = await homeService.createHomeItem(data)
      }

      setShowModal(false)
      resetForm()
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item?')) return
    try {
      const id = item._id || item.id
      await homeService.deleteHomeItem(id)
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  function getEmbedUrl(url) {
    if (!url) return ''
    try {
      if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
        let videoId = ''
        if (url.includes('youtu.be')) {
          const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
          if (match && match[1]) videoId = match[1]
        } else if (url.includes('youtube.com/watch')) {
          const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
          if (match && match[1]) videoId = match[1]
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }
      return url
    } catch {
      return url
    }
  }

  const videoItems = items.filter(item => item.type && item.type.toLowerCase() === 'video')
  const imageItems = items.filter(item => item.type && item.type.toLowerCase() === 'image')
  const hasVideo = videoItems.length > 0
  const latestVideo = hasVideo ? videoItems[videoItems.length - 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* ===== HEADER: SIRF TITLE ===== */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Home Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* ===== ACTION BUTTONS (ADD IMAGE & ADD VIDEO) ===== */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Actions:</span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Video – only if NO video exists */}
            {!hasVideo && (
              <button
                onClick={handleAddVideo}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Add Video
              </button>
            )}

            {/* Add Image – always visible */}
            <button
              onClick={handleAddImage}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Image
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <div className="text-center py-10">Loading...</div>}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-20 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="text-8xl mb-6">🎬</div>
            <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-4">Add Media</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base">Use the action buttons above to add your first video or image.</p>
          </div>
        )}

        {/* ===== VIDEO SECTION ===== */}
        {!loading && hasVideo && latestVideo && (
          <div className="mb-6">
            {/* Video Player */}
            <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <div className="relative w-full aspect-video bg-slate-950">
                {latestVideo.mediaUrl && (
                  latestVideo.mediaUrl.includes('youtube.com') || latestVideo.mediaUrl.includes('youtu.be') ? (
                    <iframe
                      key={latestVideo._id}
                      src={getEmbedUrl(latestVideo.mediaUrl)}
                      title={latestVideo.title || 'Video'}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      key={latestVideo._id}
                      src={latestVideo.mediaUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  )
                )}
              </div>
            </div>

            {/* Edit/Delete buttons – directly below video */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleEdit(latestVideo)}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Edit Video
              </button>
              <button
                onClick={() => handleDelete(latestVideo)}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold"
              >
                Delete Video
              </button>
            </div>
          </div>
        )}

        {/* ===== IMAGES SECTION ===== */}
        {!loading && imageItems.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">
              All Images ({imageItems.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageItems.map((item, index) => (
                <div key={item._id || item.id || index} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <div className="relative w-full aspect-video bg-slate-950">
                    <img
                      src={item.mediaUrl}
                      alt={item.title || 'Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x225?text=Image+Not+Found'
                      }}
                    />
                    {index === imageItems.length - 1 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-yellow-500/80 text-white text-[10px] font-bold rounded-full">Latest</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {item.title || 'Untitled'}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-semibold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 px-2 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MODAL ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    editingItem?.type === 'image'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/30'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-xl">
                    {editingItem ? `Edit ${editingItem.type === 'image' ? 'Image' : 'Video'}` : 'Add Media'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Title <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Featured Media"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/image.jpg"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2.5 text-white rounded-2xl text-xs font-bold transition-all shadow-lg disabled:opacity-50 ${
                      editingItem?.type === 'image'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30 hover:shadow-emerald-500/50'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30 hover:shadow-purple-500/50'
                    }`}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}