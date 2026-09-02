import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function AboutContentManager() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    aboutUsText: '',
    aboutUsRightText: '',
    onAssignmentTitle: 'Blue Chalk On Assignment',
    onAssignmentText: '',
    services: [],
    careersText: '',
    videoUrl: ''
  });

  useEffect(() => { loadAbout(); }, []);

  const loadAbout = async () => {
    try {
      const res = await API.get('/about');
      if (res.data.success) {
        setAbout(res.data.data);
        setForm(res.data.data);
      } else {
        setAbout(null);
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e) => {
  const value = e.target.value;

  setForm((prev) => ({
    ...prev,
    services: value.split(',').map((item) => item.trimStart()),
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (about) {
        await API.put('/about', form);
      } else {
        await API.post('/about', form);
      }
      alert('✅ Saved!');
      loadAbout();
      setIsEditing(false);
    } catch (error) {
      alert('❌ Error saving');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete all about content?')) return;
    try {
      await API.delete('/about');
      setAbout(null);
      setForm({
        aboutUsText: '',
        aboutUsRightText: '',
        onAssignmentTitle: 'Blue Chalk On Assignment',
        onAssignmentText: '',
        services: [],
        careersText: '',
        videoUrl: ''
      });
      alert('✅ Deleted!');
    } catch (error) {
      alert('❌ Error deleting');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // ✅ VIEW MODE – Show card with data (same styling as Gallery/Clients)
  if (about && !isEditing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📄 About Page Content</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Card – same shadow and border as Gallery/Clients */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">About Us (Left)</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{about.aboutUsText}</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">About Us (Right)</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{about.aboutUsRightText}</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">On Assignment Title</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{about.onAssignmentTitle}</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">On Assignment Text</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{about.onAssignmentText}</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">Services</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {about.services.map((s, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">Careers Text</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{about.careersText}</p>
            </div>
            {about.videoUrl && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 whitespace-pre-wrap">Video URL</h3>
                <a
                  href={about.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {about.videoUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ EDIT MODE – Show form
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {about ? '✏️ Edit About Content' : '📄 Add About Content'}
        </h1>
        {about && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border">
        <div>
          <label className="block text-sm font-medium whitespace-pre-wrap">About Us (Left) *</label>
          <textarea name="aboutUsText" value={form.aboutUsText} onChange={handleChange} rows="4" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium whitespace-pre-wrap">About Us (Right) *</label>
          <textarea name="aboutUsRightText" value={form.aboutUsRightText} onChange={handleChange} rows="4" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">On Assignment Title</label>
          <input type="text" name="onAssignmentTitle" value={form.onAssignmentTitle} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">On Assignment Text *</label>
          <textarea name="onAssignmentText" value={form.onAssignmentText} onChange={handleChange} rows="2" className="w-full border rounded px-3 py-2" required />
        </div>
     <textarea
  value={form.services.join('\n')}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      services: e.target.value.split('\n'),
    }))
  }
  rows={6}
  className="w-full border rounded px-3 py-2"
  placeholder="Enter each service on a new line"
  required
/>
        <div>
          <label className="block text-sm font-medium">Careers Text *</label>
          <textarea name="careersText" value={form.careersText} onChange={handleChange} rows="4" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Video URL</label>
          <input type="text" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." className="w-full border rounded px-3 py-2" />
        </div>
        <div className="pt-2">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            💾 Save
          </button>
        </div>
      </form>
    </div>
  );
}