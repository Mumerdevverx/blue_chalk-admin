import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import ImagePicker from '../../ImagePicker';

export default function AwardsManager() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', year: '', category: '', breadcrumb: '', image: '', description: ''
  });

  useEffect(() => { loadAwards(); }, []);

  const loadAwards = async () => {
    const res = await API.get('/awards');
    setAwards(res.data.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: '', year: '', category: '', breadcrumb: '', image: '', description: '' });
    setEditingId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        title: item.title,
        year: item.year,
        category: item.category,
        breadcrumb: item.breadcrumb,
        image: item.image,
        description: item.description || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image) return alert('Title and Image required');
    try {
      if (editingId) {
        await API.put(`/awards/${editingId}`, form);
      } else {
        await API.post('/awards', form);
      }
      handleCloseModal();
      loadAwards();
    } catch (error) {
      alert('Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this award?')) return;
    await API.delete(`/awards/${id}`);
    loadAwards();
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
        <h1 className="text-2xl font-bold">🏆 Awards</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Award
        </button>
      </div>

      {/* Cards Grid – same as Gallery */}
      {awards.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          No awards added yet. Click "Add Award" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {awards.map(award => (
            <div key={award._id} className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col">
              <img
                src={getImageUrl(award.image)}
                alt={award.title}
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
              />
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm truncate">{award.title}</h3>
                <p className="text-xs text-gray-600">{award.year} – {award.category}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{award.breadcrumb}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenModal(award)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(award._id)}
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
              <h2 className="text-xl font-bold">{editingId ? 'Edit Award' : 'Add New Award'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Breadcrumb</label>
                <input
                  name="breadcrumb"
                  value={form.breadcrumb}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Award Image</label>
                <ImagePicker
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  label="Choose Image"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
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