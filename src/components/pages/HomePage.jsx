import React, { useEffect, useState } from 'react'
import MediaModal from '../MediaModal'

const HomePage = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [images, setImages] = useState([])
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem('homeMedia')

        if (raw) {
          const parsed = JSON.parse(raw)
          setVideoUrl(parsed.videoUrl || '')
          setImages(parsed.images || [])
        }
      } catch (e) {}
    }

    load()
    window.addEventListener('homeMediaUpdated', load)

    return () => window.removeEventListener('homeMediaUpdated', load)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (!images || images.length <= 1) return

    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, 3000)

    return () => clearInterval(t)
  }, [images])

  // Save
  function handleSave(data) {
    localStorage.setItem('homeMedia', JSON.stringify(data))

    setVideoUrl(data.videoUrl || '')
    setImages(data.images || [])

    window.dispatchEvent(new Event('homeMediaUpdated'))

    setOpen(false)
    setEditData(null)
  }

  // Edit
  function handleEdit() {
    setEditData({
      videoUrl,
      images,
    })

    setOpen(true)
  }

  // Delete Video
  function handleDeleteVideo() {
    if (!window.confirm('Are you sure you want to delete the video?')) {
      return
    }

    const data = {
      videoUrl: '',
      images,
    }

    localStorage.setItem('homeMedia', JSON.stringify(data))

    setVideoUrl('')

    window.dispatchEvent(new Event('homeMediaUpdated'))
  }

  // Delete Image
  function handleDeleteImage(imageIndex) {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }

    const updatedImages = images.filter((_, i) => i !== imageIndex)

    const data = {
      videoUrl,
      images: updatedImages,
    }

    localStorage.setItem('homeMedia', JSON.stringify(data))

    setImages(updatedImages)

    if (index >= updatedImages.length) {
      setIndex(0)
    }

    window.dispatchEvent(new Event('homeMediaUpdated'))
  }

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Home
        </h1>

        <button
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Video */}
      {videoUrl && (
        <div className="mb-6">

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Video
            </h2>

            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
              >
                Edit
              </button>

              <button
                onClick={handleDeleteVideo}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-2xl aspect-video">
            <iframe
              src={videoUrl}
              title="video"
              className="absolute inset-0 w-full h-full rounded shadow"
              allowFullScreen
            />
          </div>

        </div>
      )}

      {/* Images */}
      <div className="mb-6">

        <h2 className="text-lg font-semibold mb-3">
          Images
        </h2>

        {images.length === 0 && (
          <div className="p-6 bg-white rounded shadow">
            No images added yet.
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-4">

            {/* Image */}
            <div className="relative w-full max-w-xl h-64 overflow-hidden rounded shadow">

              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`img-${i}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === index
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                />
              ))}

            </div>

            {/* Image Actions */}
            <div className="flex flex-wrap gap-2">

              {images.map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => setIndex(i)}
                    className={`px-3 py-1 rounded ${
                      i === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    Image {i + 1}
                  </button>

                  <button
                    onClick={() => handleDeleteImage(i)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>

      {/* Modal */}
      <MediaModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          setEditData(null)
        }}
        onSave={handleSave}
        editData={editData}
      />

    </div>
  )
}

export default HomePage