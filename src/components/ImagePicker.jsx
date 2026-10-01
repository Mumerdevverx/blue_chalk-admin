import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import API from '../api/axios';
import getImageUrl from '../utils/imageUrl';

const compressImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Image compression failed'));
        return;
      }
      resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.75);
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Image could not be read'));
  };

  image.src = objectUrl;
});

const ImagePicker = ({ value, onChange, label = 'Choose Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(getImageUrl(value));

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, GIF, WebP, SVG images are allowed.');
      return;
    }

    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);
      const response = await API.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const imageUrl = getImageUrl(response.data.data.url);
        setPreview(imageUrl);
        onChange(imageUrl);
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
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
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
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default ImagePicker;