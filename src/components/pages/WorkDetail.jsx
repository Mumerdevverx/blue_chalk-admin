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
      <div className="max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header: Back + Edit/Delete */}
        <div className="p-6 border-b flex justify-between items-center flex-wrap gap-2">
          <button
            onClick={() => navigate('/work')}
            className="flex items-center gap-2 text-[#1893DB] hover:underline"
          >
            <FiArrowLeft /> Back to all Work
          </button>
         
        </div>

        {/* ✅ ONLY VIDEO – NO IMAGE FALLBACK */}
      <div className="w-full bg-gray-200">
  {work.videoUrl && (
    <div className="aspect-video">
      <iframe
        src={work.videoUrl}
        title={work.title || 'Video'}
        className="w-[800px] h-full"
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )}
</div>

        {/* ✅ ONLY CONTENT – RICH TEXT */}
        <div className="p-6">
          <div
            className="text-gray-800 text-base leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: work.aboutContent || '<p>No content provided.</p>' }}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkDetail;