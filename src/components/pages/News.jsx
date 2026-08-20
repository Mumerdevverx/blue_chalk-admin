import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newsService from '../../services/newsService';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiEye } from 'react-icons/fi';
import TipTapEditor from '../TipTapEditor';

function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    date: '',
    description: '',
    content: '',
    excerpt: ''
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await newsService.getAllNews();
      setNews(res.data || []);
    } catch (error) {
      console.error('Error loading news:', error);
      alert('Failed to load news');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.image.trim()) {
      alert('Image URL is required');
      return;
    }
    if (!formData.date.trim()) {
      alert('Date is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!formData.content || formData.content === '<p><br></p>' || formData.content === '') {
      alert('Content is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews._id, formData);
        alert('✅ News updated successfully!');
      } else {
        await newsService.createNews(formData);
        alert('✅ News created successfully!');
      }
      setShowModal(false);
      setEditingNews(null);
      resetForm();
      loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      alert(error.response?.data?.message || 'Failed to save news');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    try {
      await newsService.deleteNews(id);
      alert('✅ News deleted successfully!');
      loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      date: '',
      description: '',
      content: '',
      excerpt: ''
    });
    setEditingNews(null);
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      image: newsItem.image,
      date: newsItem.date,
      description: newsItem.description,
      content: newsItem.content || '',
      excerpt: newsItem.excerpt || ''
    });
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ Read More handler - Admin panel ke andar hi detail page par le jayega
  const handleReadMore = (slug) => {
    if (slug) {
      navigate(`/news/${slug}`);
    } else {
      alert('Slug not found for this news.');
    }
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
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📰 News Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              {news.length} articles found
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadNews}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus /> Add News
            </button>
          </div>
        </div>

        {/* News Cards */}
        {news.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-500 text-lg">No news articles found.</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add News" to create your first article.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {news.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/4 h-48 md:h-auto bg-gray-200">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600">
                          {item.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {formatDate(item.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Published: {item.date}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-yellow-500 hover:text-yellow-700 p-1"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* ✅ READ MORE BUTTON - Admin panel ke andar detail page */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleReadMore(item.slug)}
                        className="text-[#1893DB] font-medium text-[16px] hover:underline inline-flex items-center gap-1 transition hover:translate-x-1"
                      >
                        Read More →
                      </button>
                    </div>

                    <div className="flex gap-4 mt-3">
                      <span className="text-sm text-gray-400">
                        👁️ {item.views || 0} views
                      </span>
                      <span className="text-sm text-gray-400">
                        📌 {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-400">
                        🔗 /news/{item.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== ADD/EDIT MODAL ========== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingNews ? '✏️ Edit News' : '➕ Add New News'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter news title"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formData.image && (
                    <div className="mt-2 h-20 w-32 overflow-hidden rounded border">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x80?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="AUGUST 19, 2025"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of the news"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <TipTapEditor
                    value={formData.content}
                    onChange={handleContentChange}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Use the toolbar to format text, add images, videos, and links.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : editingNews ? 'Update' : 'Save'}
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

export default News;