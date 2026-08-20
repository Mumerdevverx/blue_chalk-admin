import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import newsService from '../../services/newsService';

function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.getNewsBySlug(slug);
        if (res.success) {
          setNews(res.data);
        } else {
          setError('News not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
        setLoading(false);
      }
    };
    fetchNews();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    try {
      await newsService.deleteNews(news._id);
      alert('✅ News deleted successfully!');
      navigate('/news');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-gray-500 text-lg">{error || 'News not found'}</p>
        <button
          onClick={() => navigate('/news')}
          className="text-[#1893DB] hover:underline mt-4"
        >
          ← Back to all News
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Back Button */}
        <div className="p-6 border-b">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-[#1893DB] hover:underline"
          >
            <FiArrowLeft /> Back to all News
          </button>
        </div>

        {/* Image */}
        <div className="w-full h-96 bg-gray-200">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x400?text=No+Image';
            }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{news.title}</h1>
              <p className="text-sm text-gray-500 mt-2">
                📅 Published: {news.date}
              </p>
              <p className="text-sm text-gray-500">
                👁️ {news.views || 0} views
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/news/edit/${news._id}`)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-2"
              >
                <FiEdit2 /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{news.description}</p>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Full Content</h3>
            {news.content ? (
              <div
                className="text-gray-800 text-base leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            ) : (
              <p className="text-gray-500">No content available.</p>
            )}
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-gray-400">
            <p>Created: {formatDate(news.createdAt)}</p>
            <p>Last Updated: {formatDate(news.updatedAt)}</p>
            <p>Status: {news.isActive ? '✅ Active' : '❌ Inactive'}</p>
            <p>Slug: /news/{news.slug}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;