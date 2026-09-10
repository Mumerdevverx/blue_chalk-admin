import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import ImagePicker from '../../ImagePicker';

export default function TeamManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null); // ✅ Track which card is hovered
  const [form, setForm] = useState({
    name: '', pronouns: '', position: '', image: '', hoverImage: '',
    description: '', linkedin: '', twitter: '', email: '', order: 0
  });

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    const res = await API.get('/team');
    setMembers(res.data.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: '', pronouns: '', position: '', image: '', hoverImage: '',
      description: '', linkedin: '', twitter: '', email: '', order: 0
    });
    setEditingId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        name: item.name,
        pronouns: item.pronouns || '',
        position: item.position,
        image: item.image,
        hoverImage: item.hoverImage,
        description: item.description,
        linkedin: item.linkedin || '',
        twitter: item.twitter || '',
        email: item.email || '',
        order: item.order || 0
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
    if (!form.name || !form.image || !form.hoverImage) return alert('Name, Image, and Hover Image required');
    try {
      if (editingId) {
        await API.put(`/team/${editingId}`, form);
      } else {
        await API.post('/team', form);
      }
      handleCloseModal();
      loadMembers();
    } catch (error) {
      alert('Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member?')) return;
    await API.delete(`/team/${id}`);
    loadMembers();
  };

  // ✅ Helper to get full image URL
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👥 Team Members</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Member
        </button>
      </div>

      {/* Cards Grid */}
      {members.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          No team members added yet. Click "Add Member" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map(member => {
            const isHovered = hoveredId === member._id;
            const imageSrc = isHovered ? getImageUrl(member.hoverImage) : getImageUrl(member.image);
            return (
              <div
                key={member._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col transition-all duration-200 hover:shadow-lg"
                onMouseEnter={() => setHoveredId(member._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="h-48 flex items-center justify-center p-2 bg-gray-50">
                  <img
                    src={imageSrc}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover transition-opacity duration-300"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-center truncate">{member.name}</h3>
                  <p className="text-xs text-center text-gray-500">{member.position}</p>
                  <p className="text-xs text-center text-gray-400">{member.pronouns}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pronouns</label>
                <input
                  name="pronouns"
                  value={form.pronouns}
                  onChange={handleChange}
                  placeholder="e.g., He/Him"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position *</label>
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Main Image</label>
                <ImagePicker
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  label="Choose Main Image"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hover Image</label>
                <ImagePicker
                  value={form.hoverImage}
                  onChange={(url) => setForm({ ...form, hoverImage: url })}
                  label="Choose Hover Image"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter URL</label>
                <input
                  name="twitter"
                  value={form.twitter}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
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