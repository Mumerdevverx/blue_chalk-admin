import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { workService } from '../../services/workService';

function WorkDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await workService.getBySlug(slug);
        if (res.success) {
          setWork(res.data);
        } else {
          setError(res.message || 'Work not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching work:', err);
        setError('Failed to load work');
        setLoading(false);
      }
    };
    fetchWork();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this work?')) return;
    try {
      await workService.delete(work._id);
      alert('✅ Deleted');
      navigate('/work');
    } catch (error) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-gray-500 text-lg">{error || 'Work not found'}</p>
        <button onClick={() => navigate('/work')} className="text-[#1893DB] hover:underline mt-4">
          ← Back to all Work
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center flex-wrap gap-2">
          <button
            onClick={() => navigate('/work')}
            className="flex items-center gap-2 text-[#1893DB] hover:underline"
          >
            <FiArrowLeft /> Back to all Work
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/work/edit/${work._id}`)}
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

        {/* ✅ Render the saved HTML content (includes video) */}
        <div className="p-6">
          {work.aboutContent ? (
            <div
              className="text-gray-800 text-base leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: work.aboutContent }}
            />
          ) : (
            <p className="text-gray-500">No content provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkDetail;