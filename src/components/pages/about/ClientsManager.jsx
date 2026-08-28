import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import ImagePicker from '../../ImagePicker';

export default function ClientsManager() {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ imageUrl: '', name: '', order: 0 });

  useEffect(() => { loadLogos(); }, []);

  const loadLogos = async () => {
    const res = await API.get('/clients');
    setLogos(res.data.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ imageUrl: '', name: '', order: 0 });
    setEditingId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({ imageUrl: item.imageUrl, name: item.name, order: item.order });
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
        await API.put(`/clients/${editingId}`, form);
      } else {
        await API.post('/clients', form);
      }
      handleCloseModal();
      loadLogos();
    } catch (error) {
      alert('Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this logo?')) return;
    await API.delete(`/clients/${id}`);
    loadLogos();
  };

  // ✅ Helper to get full image URL
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
        <h1 className="text-2xl font-bold">🤝 Clients & Partners</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Logo
        </button>
      </div>

      {/* Cards Grid – SAME AS GALLERY */}
      {logos.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          No logos added yet. Click "Add Logo" to upload.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map(logo => (
            <div key={logo._id} className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col">
              <div className="h-40 flex items-center justify-center p-2 bg-gray-50">
                <img
                  src={getImageUrl(logo.imageUrl)}
                  alt={logo.name || 'Client'}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Logo+Not+Found'; }}
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-sm font-semibold truncate">{logo.name || 'Client'}</p>
                <p className="text-xs text-gray-400">Order: {logo.order}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenModal(logo)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(logo._id)}
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
              <h2 className="text-xl font-bold">{editingId ? 'Edit Logo' : 'Add New Logo'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo Image</label>
                <ImagePicker
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  label="Choose Logo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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