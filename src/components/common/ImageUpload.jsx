import { useState, useRef } from 'react';

const ImageUpload = ({ onImageSelect, maxSizeMB = 5 }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onImageSelect) onImageSelect(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageSelect) onImageSelect(null, null);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
          <span className="text-gray-400">Click to upload an image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImageUpload;
