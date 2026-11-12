import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { workService } from '../../services/workService';
import getImageUrl from '../../utils/imageUrl';
import { getWorkAboutContent } from '../../utils/workAboutContent';

const getYouTubeVideoId = (value) => {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    if (!url.hostname.includes('youtube.com')) return '';
    if (url.pathname === '/watch') return url.searchParams.get('v') || '';
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || '';
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || '';
    return '';
  } catch {
    return '';
  }
};

const resolveMediaUrl = (value) => {
  if (!value || /^https?:\/\//i.test(value)) return value;
  return getImageUrl(value);
};

const normalizeVideoPreviews = (html, poster) => {
  if (!html || typeof window === 'undefined') return html;

  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('iframe[src]').forEach((iframe) => {
    const videoId = getYouTubeVideoId(iframe.getAttribute('src'));

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
    }
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;';
  });

  documentFragment.querySelectorAll('video').forEach((video) => {
    const sourceElement = video.querySelector('source[src]');
    const source = video.getAttribute('src') || sourceElement?.getAttribute('src');
    const videoId = getYouTubeVideoId(source);

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.title = 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;';
      video.replaceWith(iframe);
      return;
    }

    if (poster && !video.getAttribute('poster')) {
      video.setAttribute('poster', poster);
    }
    if (!video.hasAttribute('controls')) video.setAttribute('controls', '');
    video.setAttribute('preload', 'metadata');
    if (source) {
      const resolvedSource = resolveMediaUrl(source);
      if (video.getAttribute('src')) {
        video.setAttribute('src', resolvedSource);
      } else if (sourceElement) {
        sourceElement.setAttribute('src', resolvedSource);
      }
    }
  });

  return documentFragment.body.innerHTML;
};

function WorkDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        let foundWork = null;

        try {
          const response = await workService.getBySlug(slug);
          foundWork = response?.data || (response?.success === undefined ? response : null);
        } catch {
          // Try the work list when the slug endpoint is unavailable or has stale data.
        }

        if (!foundWork) {
          const response = await workService.getAll();
          const works = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
          foundWork = works.find((item) => item.slug === slug) || null;
        }

        if (foundWork) {
          setWork(foundWork);
        } else {
          setError('Work not found');
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

  const aboutContent = getWorkAboutContent(work.aboutContent);

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
           
           
          </div>
        </div>

        <div className="p-6">
          {aboutContent.content && (
            <div
              className="text-gray-800 text-base leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: normalizeVideoPreviews(aboutContent.content, getImageUrl(work.image))
              }}
            />
          )}
          {aboutContent.left || aboutContent.right ? (
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <section>
                <h2 className="mb-3 text-xl font-semibold text-gray-900">About Us (Left)</h2>
                {aboutContent.legacyColumns ? (
                  <div
                    className="text-gray-800 text-base leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: normalizeVideoPreviews(aboutContent.left, getImageUrl(work.image))
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-gray-800">{aboutContent.left}</p>
                )}
              </section>
              <section>
                <h2 className="mb-3 text-xl font-semibold text-gray-900">About Us (Right)</h2>
                {aboutContent.legacyColumns ? (
                  <div
                    className="text-gray-800 text-base leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: normalizeVideoPreviews(aboutContent.right, getImageUrl(work.image))
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-gray-800">{aboutContent.right}</p>
                )}
              </section>
            </div>
          ) : null}
          {!aboutContent.content && !aboutContent.left && !aboutContent.right && (
            <p className="text-gray-500">No content provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkDetail;