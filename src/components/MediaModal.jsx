import React, { useState } from 'react'

export default function MediaModal({ isOpen, onClose, onSave }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [imagesText, setImagesText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const images = imagesText.split('\n').map(s => s.trim()).filter(Boolean)
    onSave({ videoUrl, images })
    setVideoUrl('')
    setImagesText('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Add Media</h3>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <span className="text-sm">Video URL</span>
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="mt-1 block w-full rounded border-gray-300" />
          </label>

          <label className="block mb-2">
            <span className="text-sm">Image URLs (one per line)</span>
            <textarea value={imagesText} onChange={e => setImagesText(e.target.value)} rows={6} className="mt-1 block w-full rounded border-gray-300" />
          </label>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
