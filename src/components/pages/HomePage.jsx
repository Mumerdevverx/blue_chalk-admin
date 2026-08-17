import React, { useEffect, useState } from 'react'
import homeService from '../../services/homeService'

export default function HomePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Modal States
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editingImage, setEditingImage] = useState(null)

  // Form States
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [videoTitleInput, setVideoTitleInput] = useState('')
  const [imagesTextInput, setImagesTextInput] = useState('')
  const [singleImageUrl, setSingleImageUrl] = useState('')
  const [singleImageTitle, setSingleImageTitle] = useState('')

  // Active Image Carousel Index
  const [index, setIndex] = useState(0)



  // ✅ FIX: Load from MongoDB (/api/home)
  async function load() {
    setLoading(true)
    try {
      const res = await homeService.getHomeItems()
      if (res.success) {
        setItems(res.data)
        console.log('✅ All items:', res.data)

        // ✅ DEBUG: Check each item's type
        res.data.forEach((item, i) => {
          console.log(`Item ${i}:`, {
            title: item.title,
            type: item.type,
            typeLength: item.type?.length,
            typeLowerCase: item.type?.toLowerCase()
          })
        })

        // ✅ VIDEO ITEMS FILTER (case-insensitive)
        const videos = res.data.filter(i => {
          const type = (i.type || '').toLowerCase().trim()
          return type === 'video'
        })
        console.log('📹 Video items found:', videos.length)
        console.log('📹 Video items:', videos)

        // ✅ IMAGE ITEMS FILTER (case-insensitive)
        const images = res.data.filter(i => {
          const type = (i.type || '').toLowerCase().trim()
          return type === 'image'
        })
        console.log('🖼️ Image items found:', images.length)
        console.log('🖼️ Image items:', images)
      }
    } catch (error) {
      console.error('Error loading items:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // ✅ FIX: Case-insensitive filtering
  const videoItems = items.filter((i) => {
    const type = (i.type || '').toLowerCase().trim()
    return type === 'video'
  })

  const images = items.filter((i) => {
    const type = (i.type || '').toLowerCase().trim()
    return type === 'image'
  })

  // Auto-advance carousel
  useEffect(() => {
    if (!images || images.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, 3000)
    return () => clearInterval(t)
  }, [images])

  // Reset forms
  const resetVideoForm = () => {
    setVideoUrlInput('')
    setVideoTitleInput('')
    setEditingVideo(null)
  }

  const resetImageForm = () => {
    setImagesTextInput('')
    setSingleImageUrl('')
    setSingleImageTitle('')
    setEditingImage(null)
  }

  // Open video modal
  const openVideoModal = (video = null) => {
    if (video) {
      setEditingVideo(video)
      setVideoUrlInput(video.mediaUrl || '')
      setVideoTitleInput(video.title || '')
    } else {
      resetVideoForm()
    }
    setShowVideoModal(true)
  }

  // Open image modal
  const openImageModal = (image = null) => {
    if (image) {
      setEditingImage(image)
      setSingleImageUrl(image.mediaUrl || '')
      setSingleImageTitle(image.title || '')
    } else {
      resetImageForm()
    }
    setShowImageModal(true)
  }

  // ✅ FIX: Save Video with correct type
  async function handleSaveVideo(e) {
    e.preventDefault()
    if (!videoUrlInput.trim()) {
      alert('Please enter a Video URL')
      return
    }
    setSaving(true)
    try {
      const videoData = {
        title: videoTitleInput.trim() || 'Home Video',
        type: 'video',              // ✅ FORCE small case
        mediaUrl: videoUrlInput.trim(),
        isActive: true,             // ✅ Add this
        order: 1                    // ✅ Add this
      }
      console.log('📤 Saving video:', videoData)

      if (editingVideo) {
        await homeService.updateHomeItem(editingVideo._id || editingVideo.id, videoData)
      } else {
        await homeService.createHomeItem(videoData)
      }
      setShowVideoModal(false)
      resetVideoForm()
      await load()
    } catch (err) {
      console.error('Error saving video:', err)
      alert(err.message || 'Error saving video to database')
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIX: Save Images with correct type
  async function handleSaveImages(e) {
    e.preventDefault()
    const urls = imagesTextInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    if (urls.length === 0) {
      alert('Please enter at least one Image URL')
      return
    }
    setSaving(true)
    try {
      // Create each image with correct type
      for (const url of urls) {
        await homeService.createHomeItem({
          title: 'Home Image',
          type: 'image',           // ✅ FORCE small case
          mediaUrl: url.trim(),
          isActive: true,
          order: images.length + 1
        })
      }
      setImagesTextInput('')
      setShowImageModal(false)
      resetImageForm()
      await load()
    } catch (err) {
      console.error('Error saving images:', err)
      alert(err.message || 'Error saving images to database')
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIX: Update single image
  async function handleUpdateImage(e) {
    e.preventDefault()
    if (!singleImageUrl.trim()) {
      alert('Please enter an Image URL')
      return
    }
    setSaving(true)
    try {
      await homeService.updateHomeItem(editingImage._id || editingImage.id, {
        title: singleImageTitle.trim() || 'Home Image',
        type: 'image',              // ✅ FORCE small case
        mediaUrl: singleImageUrl.trim(),
        isActive: true,
        order: 1
      })
      setShowImageModal(false)
      resetImageForm()
      await load()
    } catch (err) {
      alert(err.message || 'Error updating image')
    } finally {
      setSaving(false)
    }
  }

  // Delete Video
  async function handleDeleteVideo(videoItem) {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    try {
      await homeService.deleteHomeItem(videoItem._id || videoItem.id)
      await load()
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  // Delete Image
  async function handleDeleteImage(imgItem) {
    if (!window.confirm('Are you sure you want to delete this image?')) return
    try {
      await homeService.deleteHomeItem(imgItem._id || imgItem.id)
      await load()
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  // Helper for YouTube embed
  function getEmbedUrl(url) {
    if (!url) return ''
    try {
      if (url.includes('youtube.com/shorts/')) {
        const match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}`
        }
      }
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}`
        }
      }
      return url
    } catch {
      return url
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">

        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Manage your media content
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => openVideoModal()}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Add Video
              </button>

              <button
                onClick={() => openImageModal()}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Images
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-3 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              All
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === 'images'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Images
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'images' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                {images.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === 'videos'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Videos
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'videos' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                {videoItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* VIDEO MODAL */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-xl">
                    {editingVideo ? 'Edit Video' : 'Add Video'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowVideoModal(false)
                    resetVideoForm()
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Video Title <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    placeholder="e.g. Featured Video"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Video URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://s3.amazonaws.com/..."
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoModal(false)
                      resetVideoForm()
                    }}
                    className="px-5 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingVideo ? 'Update Video' : 'Save Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IMAGE MODAL */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-xl">
                    {editingImage ? 'Edit Image' : 'Add Images'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false)
                    resetImageForm()
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingImage ? handleUpdateImage : handleSaveImages} className="space-y-4">
                {editingImage ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Image Title <span className="text-slate-400 lowercase font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={singleImageTitle}
                        onChange={(e) => setSingleImageTitle(e.target.value)}
                        placeholder="e.g. Home Image"
                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Image URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={singleImageUrl}
                        onChange={(e) => setSingleImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Image URLs <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        One per line
                      </span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={imagesTextInput}
                      onChange={(e) => setImagesTextInput(e.target.value)}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false)
                      resetImageForm()
                    }}
                    className="px-5 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingImage ? 'Update Image' : 'Save Images'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-12 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">Loading items...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* VIDEOS SECTION */}
            {(activeTab === 'all' || activeTab === 'videos') && (
              <>
                {videoItems.length > 0 ? (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Videos ({videoItems.length})
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {videoItems.map((video, index) => (
                        <div key={video._id || video.id || index} className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                          <div className="relative w-full aspect-video bg-slate-950">
                            {/* ✅ Check if it's a YouTube URL or direct video */}
                            {video.mediaUrl && (
                              video.mediaUrl.includes('youtube.com') || video.mediaUrl.includes('youtu.be') ? (
                                <iframe
                                  src={getEmbedUrl(video.mediaUrl)}
                                  title={video.title || 'Video'}
                                  className="absolute inset-0 w-full h-full border-0"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={video.mediaUrl}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  controls
                                  muted
                                  autoPlay
                                  loop
                                />
                              )
                            )}
                          </div>
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {video.title || 'Untitled Video'}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Just now'}
                              </p>
                            </div>
                            <div className="flex gap-1.5 ml-3">
                              <button
                                onClick={() => openVideoModal(video)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video)}
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  (activeTab === 'videos') && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-16 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 text-center">
                      <div className="text-7xl mb-4">🎬</div>
                      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Videos Found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Click the <strong>"Add Video"</strong> button to add your first video.</p>
                    </div>
                  )
                )}
              </>
            )}

            {/* IMAGES SECTION */}
            {(activeTab === 'all' || activeTab === 'images') && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Images ({images.length})
                  </h2>
                </div>

                {images.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="text-5xl mb-4">🖼️</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No images added yet
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                      Click the <strong>"Add Images"</strong> button to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img, i) => (
                      <div key={img._id || img.id || i} className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="relative w-full aspect-square bg-slate-950 overflow-hidden">
                          <img
                            src={img.mediaUrl}
                            alt={img.title || `Image ${i + 1}`}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                            onClick={() => setIndex(i)}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
                            }}
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
                              #{i + 1}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate mb-3">
                            {img.title || `Image ${i + 1}`}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openImageModal(img)}
                              className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                            >
                              View/Edit
                            </button>
                            <button
                              onClick={() => handleDeleteImage(img)}
                              className="flex-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}