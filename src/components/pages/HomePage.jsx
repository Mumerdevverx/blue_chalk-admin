import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeService from '../../services/homeService'
import { workService } from '../../services/workService'
import getImageUrl from '../../utils/imageUrl'

export default function HomePage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('video')
  const [title, setTitle] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Work project states
  const [works, setWorks] = useState([])
  const [selectedWorkSlug, setSelectedWorkSlug] = useState('')
  const [imagePage, setImagePage] = useState(1)
  const imagesPerPage = 6

  // ==========================================
  // LOAD HOME ITEMS
  // ==========================================
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

  // ==========================================
  // LOAD WORK PROJECTS
  // ==========================================
  async function loadWorks() {
    try {
      const res = await workService.getAll()

      console.log('📦 Loaded works:', res)

      if (res.success) {
        setWorks(res.data || [])
      }
    } catch (error) {
      console.error('Error loading works:', error)
      setWorks([])
    }
  }

  // ==========================================
  // LOAD HOME + WORKS
  // ==========================================
  useEffect(() => {
    load()
    loadWorks()
  }, [refreshKey])

  useEffect(() => {
    const imageCount = items.filter(
      item => item.type?.toLowerCase() === 'image'
    ).length
    const lastPage = Math.max(
      1,
      Math.ceil(imageCount / imagesPerPage)
    )

    setImagePage(prev => Math.min(prev, lastPage))
  }, [items])

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setMediaUrl('')
    setMediaType('video')
    setTitle('')
    setSelectedWorkSlug('')
    setEditingItem(null)
  }

  // ==========================================
  // ADD VIDEO
  // ==========================================
  const handleAddVideo = () => {
    resetForm()
    setMediaType('video')
    setShowModal(true)
  }

  // ==========================================
  // ADD IMAGE
  // ==========================================
  const handleAddImage = () => {
    resetForm()
    setMediaType('image')
    setShowModal(true)
  }

  // ==========================================
  // EDIT ITEM
  // ==========================================
  const handleEdit = (item) => {
    if (!item || !item._id) {
      alert('Cannot edit this item')
      return
    }

    setEditingItem(item)
    setMediaUrl(item.mediaUrl || '')
    setMediaType(item.type || 'video')
    setTitle(item.title || '')
    setSelectedWorkSlug(item.workSlug || '')
    setShowModal(true)
  }

  // ==========================================
  // SAVE HOME ITEM
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault()

    if (!mediaUrl.trim()) {
      alert('Please enter a URL')
      return
    }

    setSaving(true)

    try {
      const type = editingItem
        ? editingItem.type || mediaType
        : mediaType

      const data = {
        title: title.trim() || 'Untitled',
        type,
        mediaUrl: mediaUrl.trim(),

        // Work project slug
        workSlug: selectedWorkSlug,

        isActive: true,
        order: editingItem
          ? editingItem.order
          : Math.max(
              0,
              ...items.map(item => Number(item.order) || 0)
            ) + 1
      }

      console.log('📤 Saving Home Item:', data)

      if (editingItem) {
        const id = editingItem._id || editingItem.id

        if (!id) {
          throw new Error('Item ID missing')
        }

        await homeService.updateHomeItem(id, data)
      } else {
        await homeService.createHomeItem(data)
      }

      setShowModal(false)
      resetForm()

      if (!editingItem && type === 'image') {
        setImagePage(
          Math.ceil((imageItems.length + 1) / imagesPerPage)
        )
      }

      setRefreshKey(prev => prev + 1)

    } catch (err) {
      console.error('❌ Save error:', err)

      alert(
        err.response?.data?.message ||
        err.message ||
        'Error saving'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // DELETE ITEM
  // ==========================================
  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item?')) {
      return
    }

    try {
      const id = item._id || item.id

      await homeService.deleteHomeItem(id)

      setRefreshKey(prev => prev + 1)

    } catch (err) {
      console.error('Delete error:', err)

      alert(
        err.message ||
        'Delete failed'
      )
    }
  }

  const handleReadMore = (workSlug) => {
    if (workSlug) {
      navigate(`/work/${workSlug}`)
    }
  }

  // ==========================================
  // YOUTUBE EMBED URL
  // ==========================================
  function getEmbedUrl(url) {
    if (!url) return ''

    try {
      if (
        url.includes('youtube.com/watch') ||
        url.includes('youtu.be')
      ) {
        let videoId = ''

        if (url.includes('youtu.be')) {
          const match = url.match(
            /youtu\.be\/([a-zA-Z0-9_-]+)/
          )

          if (match && match[1]) {
            videoId = match[1]
          }

        } else if (url.includes('youtube.com/watch')) {
          const match = url.match(
            /[?&]v=([a-zA-Z0-9_-]+)/
          )

          if (match && match[1]) {
            videoId = match[1]
          }
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

  // ==========================================
  // FILTER ITEMS
  // ==========================================
  const videoItems = items.filter(
    item =>
      item.type &&
      item.type.toLowerCase() === 'video'
  )

  const imageItems = items.filter(
    item =>
      item.type &&
      item.type.toLowerCase() === 'image'
  )

  const hasVideo = videoItems.length > 0

  const latestVideo = hasVideo
    ? videoItems[videoItems.length - 1]
    : null

  const totalImagePages =
    Math.ceil(imageItems.length / imagesPerPage) || 1

  const paginatedImages = imageItems.slice(
    (imagePage - 1) * imagesPerPage,
    imagePage * imagesPerPage
  )

  const renderPageNumbers = () => {
    const pages = []

    for (let page = 1; page <= totalImagePages; page += 1) {
      pages.push(
        <button
          key={page}
          onClick={() => setImagePage(page)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
            page === imagePage
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {page}
        </button>
      )
    }

    return pages
  }

  const decodeHtmlEntities = (text) => {
  if (!text) return "";

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;

  return textarea.value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

  const getWorkOptionLabel = (work) => {
    return decodeHtmlEntities(
      work.buttonText || work.title || work.slug
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">

      <div className="w-full max-w-6xl mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 mb-6">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">

              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>

            </div>

            <div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Home Dashboard
              </h1>

            </div>

          </div>

        </div>

        {/* ==========================================
            ADD VIDEO EMPTY CARD
        ========================================== */}
        {!loading && !hasVideo && (

          <div
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-16 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 text-center cursor-pointer hover:shadow-2xl transition-all duration-300 mb-6 shadow-[0_0_0_6px_rgba(168,85,247,0.3)]"
            onClick={handleAddVideo}
          >

            <div className="flex flex-col items-center justify-center gap-3">

              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">

                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>

              </div>

              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                Add Video
              </span>

              <span className="text-sm text-slate-500 dark:text-slate-400">
                Click to add your first video
              </span>

            </div>

          </div>

        )}

        {/* ==========================================
            LOADING
        ========================================== */}
        {loading && (
          <div className="text-center py-10">
            Loading...
          </div>
        )}

        {/* ==========================================
            VIDEO SECTION
        ========================================== */}
        {!loading && hasVideo && latestVideo && (

          <div className="mb-6">

            <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">

              <div className="relative w-full aspect-video bg-slate-950">

                {latestVideo.mediaUrl && (

                  latestVideo.mediaUrl.includes('youtube.com') ||
                  latestVideo.mediaUrl.includes('youtu.be')
                    ? (

                      <iframe
                        key={latestVideo._id}
                        src={getEmbedUrl(
                          latestVideo.mediaUrl
                        )}
                        title={
                          latestVideo.title ||
                          'Video'
                        }
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

            <div className="mt-4 flex flex-wrap justify-center gap-3">

              <button
                onClick={() =>
                  handleEdit(latestVideo)
                }
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Edit Video
              </button>

              <button
                onClick={() =>
                  handleDelete(latestVideo)
                }
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold"
              >
                Delete Video
              </button>

            </div>

          </div>

        )}

        {/* ==========================================
            ADD IMAGE BUTTON
        ========================================== */}
        {!loading && (

          <div className="flex justify-end mb-4">

            <button
              onClick={handleAddImage}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center gap-2"
            >

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>

              Add Image

            </button>

          </div>

        )}

        {/* ==========================================
            IMAGES CARD
        ========================================== */}
        {!loading && (

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                All Images ({imageItems.length})
              </h3>

              {totalImagePages > 1 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Page {imagePage} of {totalImagePages}
                </span>
              )}

            </div>

            {imageItems.length === 0 ? (

              <div className="text-center py-12 text-slate-500 dark:text-slate-400">

                <div className="text-4xl mb-3">
                  🖼️
                </div>

                <p className="text-sm">
                  No images yet. Click the{' '}
                  <strong>Add Image</strong>{' '}
                  button above to get started.
                </p>

              </div>

            ) : (

              <>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {paginatedImages.map((item, index) => {

                    const isLatest =
                      item._id ===
                      imageItems[
                        imageItems.length - 1
                      ]?._id
                    return (

                      <div
                        key={
                          item._id ||
                          item.id ||
                          index
                        }
                        className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                      >

                        <div className="relative w-full aspect-video bg-slate-950">

                          <img
                            src={getImageUrl(item.mediaUrl)}
                            alt={
                              item.title ||
                              'Image'
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src =
                                'https://via.placeholder.com/400x225?text=Image+Not+Found'
                            }}
                          />

                          {isLatest && (

                            <div className="absolute top-2 left-2">

                              <span className="px-2 py-0.5 bg-yellow-500/80 text-white text-[10px] font-bold rounded-full shadow-md">
                                Latest
                              </span>

                            </div>

                          )}

                        </div>

                        <div className="p-3">

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {item.title ||
                                'Untitled'}
                            </p>
                            <span className="flex-shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              Order: {(imagePage - 1) * imagesPerPage + index + 1}
                            </span>
                          </div>

                          {/* SHOW CONNECTED WORK */}
                          {item.workSlug && (

                            <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-1 truncate">
                              Work: {item.workSlug}
                            </p>

                          )}

                          <div className="flex gap-1.5 mt-2">

                            <button
                              onClick={() =>
                                handleEdit(item)
                              }
                              className="flex-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-semibold transition-all"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(item)
                              }
                              className="flex-1 px-2 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold transition-all"
                            >
                              Delete
                            </button>

                          </div>

                          {item.workSlug && (
                            <button
                              onClick={() => handleReadMore(item.workSlug)}
                              className="w-full mt-2 px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-[10px] font-semibold transition-all"
                            >
                              Read More
                            </button>
                          )}

                        </div>

                      </div>

                    )
                  })}

                </div>

                {totalImagePages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setImagePage(prev => Math.max(prev - 1, 1))}
                      disabled={imagePage === 1}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Prev
                    </button>

                    <div className="flex gap-1">
                      {renderPageNumbers()}
                    </div>

                    <button
                      onClick={() => setImagePage(prev => Math.min(prev + 1, totalImagePages))}
                      disabled={imagePage === totalImagePages}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}

              </>

            )}

          </div>

        )}

        {/* ==========================================
            MODAL
        ========================================== */}
        {showModal && (

          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/20">

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">

                <div className="flex items-center gap-3">

                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      editingItem?.type === 'image'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/30'
                    }`}
                  >

                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>

                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-xl">

                    {editingItem
                      ? `Edit ${
                          editingItem.type ===
                          'image'
                            ? 'Image'
                            : 'Video'
                        }`
                      : 'Add Media'}

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

              {/* FORM */}
              <form
                onSubmit={handleSave}
                className="space-y-4"
              >

                {/* TITLE */}
                <div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">

                    Title{' '}

                    <span className="text-slate-400 lowercase font-normal">
                      (optional)
                    </span>

                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. Featured Media"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />

                </div>

                {/* ==========================================
                    WORK PROJECT DROPDOWN
                ========================================== */}
                <div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">

                    Work Project{' '}

                    <span className="text-slate-400 lowercase font-normal">
                      (optional)
                    </span>

                  </label>

                  <select
                    value={selectedWorkSlug}
                    onChange={(e) =>
                      setSelectedWorkSlug(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  >

                    <option value="">
                      Select Work Project
                    </option>

                    {works.map((work) => (

                      <option
                        key={work._id}
                        value={work.slug}
                      >
                        {getWorkOptionLabel(work)}
                      </option>

                    ))}

                  </select>

                </div>

                {/* URL */}
                <div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">

                    URL{' '}

                    <span className="text-rose-500">
                      *
                    </span>

                  </label>

                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) =>
                      setMediaUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/image.jpg"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />

                </div>

                {/* BUTTONS */}
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

                    {saving
                      ? 'Saving...'
                      : editingItem
                        ? 'Update'
                        : 'Add'}

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