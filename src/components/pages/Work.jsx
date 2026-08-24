import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workService } from '../../services/workService';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import ImagePicker from '../../components/ImagePicker';
import TipTapEditor from '../../components/TipTapEditor';

function Work() {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'All Projects',
    image: '',
    buttonText: 'Watch Now',
    aboutContent: '',
    showOverlay: false,
    overlayType: ''
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    try {
      const res = await workService.getAll();
      setWorks(res.data || []);
    } catch (error) {
      console.error('Error loading works:', error);
      alert('Failed to load works');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, aboutContent: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) return alert('Image is required');
    if (!formData.aboutContent.trim()) return alert('About Content is required');

    setIsSaving(true);
    try {
      if (editingWork) {
        await workService.update(editingWork._id, formData);
        alert('✅ Work updated successfully!');
      } else {
        await workService.create(formData);
        alert('✅ Work created successfully!');
      }
      setShowModal(false);
      setEditingWork(null);
      resetForm();
      loadWorks();
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Failed to save work');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work?')) return;
    try {
      await workService.delete(id);
      alert('✅ Deleted');
      loadWorks();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'All Projects',
      image: '',
      buttonText: 'Watch Now',
      aboutContent: '',
      showOverlay: false,
      overlayType: ''
    });
    setEditingWork(null);
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setFormData({
      category: work.category || 'All Projects',
      image: work.image || '',
      buttonText: work.buttonText || 'Watch Now',
      aboutContent: work.aboutContent || '',
      showOverlay: work.showOverlay || false,
      overlayType: work.overlayType || ''
    });
    setShowModal(true);
  };

  const handleReadMore = (slug) => {
    if (slug) {
      navigate(`/work/${slug}`);
    } else {
      alert('Slug not found for this work.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎬 Work Management</h1>
          <div className="flex gap-2">
            <button onClick={loadWorks} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiPlus /> Add Work
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition">
              <img
                src={getImageUrl(item.image)}
                alt={item.title || 'Work'}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />
              <div className="p-4">
                {/* ✅ Category */}
                <p className="text-sm font-semibold text-gray-700">Category: {item.category}</p>
                {/* ✅ Title Button */}
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Title Button:</span> {item.buttonText || 'Watch Now'}
                </p>

                {/* ✅ Edit / Delete (left) and Read More (right) */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleReadMore(item.slug)}
                    className="text-[#1893DB] hover:underline text-sm flex items-center gap-1"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">{editingWork ? '✏️ Edit Work' : '➕ Add Work'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="All Projects">All Projects</option>
                    <option value="Featured">Featured</option>
                    <option value="Branded">Branded</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Documentary">Documentary</option>
                  </select>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Image *</label>
                  <ImagePicker
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    label="Choose Image"
                  />
                </div>

                {/* ✅ Label changed to "Title Button" */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title Button</label>
                  <input
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    placeholder="Watch Now"
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* About Content */}
                <div>
                  <label className="block text-sm font-medium mb-1">About Content *</label>
                  <TipTapEditor
                    value={formData.aboutContent}
                    onChange={handleContentChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">Add text, images, videos – HTML content</p>
                </div>

                {/* Show Overlay */}
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showOverlay" checked={formData.showOverlay} onChange={handleChange} />
                  Show Overlay
                </label>

                {formData.showOverlay && (
                  <input
                    type="text"
                    name="overlayType"
                    value={formData.overlayType}
                    onChange={handleChange}
                    placeholder="Overlay text (e.g., atomic, firebreak)"
                    className="w-full p-2 border rounded"
                  />
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {isSaving ? 'Saving...' : (editingWork ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Work;