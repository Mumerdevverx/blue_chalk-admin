import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import API from '../../api/axios';

const NewsImageControls = ({ value, onChange, label = 'Choose Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ✅ Check file size (20MB)
  if (file.size > 20 * 1024 * 1024) {
    alert('File size must be less than 20MB');
    return;
  }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('📦 Upload Response:', response.data); // ✅ DEBUG

      if (response.data.success) {
        // ✅ FULL URL BANAO
        const url = `http://localhost:5000${response.data.data.url}`;
        console.log('✅ Image URL:', url); // ✅ DEBUG
        setPreview(url);
        onChange(url);
        alert('✅ Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('❌ Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <FiUpload /> {uploading ? 'Uploading...' : label}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={removeImage}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <FiX size={20} />
          </button>
        )}
        {value && <span className="text-xs text-gray-500 truncate max-w-[200px]">{value}</span>}
      </div>
      {preview && (
        <div className="mt-2 relative w-32 h-20 border rounded overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Image load error:', preview);
              e.target.src = 'https://via.placeholder.com/128x80?text=Invalid+URL';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NewsImageControls;