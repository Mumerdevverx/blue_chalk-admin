import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import ImagePicker from '../../ImagePicker';

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ imageUrl: '', title: '', order: 0 });

  useEffect(() => { loadImages(); }, []);

  const loadImages = async () => {
    const res = await API.get('/gallery');
    setImages(res.data.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ imageUrl: '', title: '', order: 0 });
    setEditingId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({ imageUrl: item.imageUrl, title: item.title, order: item.order });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) return alert('Image URL required');
    try {
      if (editingId) {
        await API.put(`/gallery/${editingId}`, form);
      } else {
        await API.post('/gallery', form);
      }
      handleCloseModal();
      loadImages();
    } catch (error) {
      alert('Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    await API.delete(`/gallery/${id}`);
    loadImages();
  };

  // ✅ Helper: Convert relative URL to full backend URL
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🖼️ Gallery Images</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Image
        </button>
      </div>

      {/* Cards Grid */}
      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          No images added yet. Click "Add Image" to upload.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img._id} className="bg-white rounded-lg shadow-md overflow-hidden border">
              <img
                src={getImageUrl(img.imageUrl)}  // ✅ FIXED
                alt={img.title || 'Gallery'}
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
              />
              <div className="p-3">
                <p className="text-sm font-semibold truncate">{img.title || 'Untitled'}</p>
                <p className="text-xs text-gray-400">Order: {img.order}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenModal(img)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Image' : 'Add New Image'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImagePicker
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  label="Choose Image"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}