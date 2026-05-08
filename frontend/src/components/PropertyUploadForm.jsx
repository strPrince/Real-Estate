/**
 * Property Upload Component for Admin Dashboard
 * 
 * This component provides a UI for uploading properties to Firestore
 * Use this as a template for integrating the upload functionality into your admin panel
 */

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase-config'; // Adjust path to your config

export default function PropertyUploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    name: 'Aadikara Avenue',
    locality: 'Atladra',
    city: 'Vadodara',
    description: 'Premium residential and commercial project',
    category: 'residential',
    type: 'residential',
    intent: 'buy',
    status: 'active',
    priceMin: 3350000,
    priceMax: 4800000,
    areaMin: 197,
    areaMax: 860,
    bedrooms: 2,
    amenities: 'Parking, Security, Water Supply, Electricity',
  });

  const FILE_SIZE_LIMITS = {
    image: 100 * 1024,        // 100KB
    video: 10 * 1024 * 1024, // 10MB
  };

  const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  };

  const validateFiles = (files, type) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      const isAllowedType = type === 'image' 
        ? ALLOWED_TYPES.image.includes(file.type)
        : ALLOWED_TYPES.video.includes(file.type);

      if (!isAllowedType) {
        errors.push(`${file.name}: Invalid file type. ${type === 'image' ? 'Use JPEG, PNG, or WebP' : 'Use MP4, WebM, MOV, or AVI'}.`);
        continue;
      }

      const maxSize = type === 'image' ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.video;
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024) * 10) / 10;
        const maxSizeKB = Math.round(maxSize / 1024);
        const maxSizeStr = maxSizeMB > 1 ? `${maxSizeMB}MB` : `${maxSizeKB}KB`;
        errors.push(`${file.name}: File too large. Maximum size is ${maxSizeStr}.`);
        continue;
      }

      validFiles.push(file);
    }

    return { validFiles, errors };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Min') || name.includes('Max') || name === 'bedrooms'
        ? parseInt(value)
        : value,
    }));
  };

  const handleImageChange = (e) => {
    const { validFiles, errors } = validateFiles(Array.from(e.target.files), 'image');
    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError('');
    }
    setImages(validFiles);
  };

  const handleVideoChange = (e) => {
    const { validFiles, errors } = validateFiles(Array.from(e.target.files), 'video');
    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError('');
    }
    setVideos(validFiles);
  };

  const uploadFiles = async (files, type) => {
    const fileUrls = [];

    for (const file of files) {
      try {
        const folder = type === 'video' ? 'videos' : 'properties';
        const storageRef = ref(
          storage,
          `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        fileUrls.push(downloadUrl);
      } catch (err) {
        throw new Error(`Failed to upload ${type} ${file.name}: ${err.message}`);
      }
    }

    return fileUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload images and videos
      const imageUrls = images.length > 0 ? await uploadFiles(images, 'image') : [];
      const videoUrls = videos.length > 0 ? await uploadFiles(videos, 'video') : [];

      // Create property document
      const propertyData = {
        ...formData,
        category: formData.category,
        type: formData.type,
        intent: formData.intent,
        amenities: formData.amenities.split(',').map(a => a.trim()),
        images: imageUrls,
        videos: videoUrls,
        units: formData.type === 'residential' ? [
          {
            type: '2 BHK',
            carpetArea: { min: 665, max: 860, unit: 'sq ft' },
            price: { min: formData.priceMin, max: formData.priceMax, currency: 'INR' },
          },
        ] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'properties'), propertyData);

      setSuccess(`Property "${formData.name}" uploaded successfully! ID: ${docRef.id}`);
      setFormData({
        name: '',
        locality: '',
        city: 'Vadodara',
        description: '',
        category: 'residential',
        type: 'residential',
        intent: 'buy',
        status: 'active',
        priceMin: 0,
        priceMax: 0,
        areaMin: 0,
        areaMax: 0,
        bedrooms: 0,
        amenities: '',
      });
      setImages([]);
      setVideos([]);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Upload New Property</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <fieldset className="border-l-4 border-brand-500 pl-4">
          <legend className="text-lg font-semibold mb-4">Basic Information</legend>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Intent *</label>
              <select
                name="intent"
                value={formData.intent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <optgroup label="Commercial">
                  <option value="rent">Rent</option>
                  <option value="lease">Lease</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Locality *</label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </fieldset>

        {/* Pricing & Area */}
        <fieldset className="border-l-4 border-blue-500 pl-4">
          <legend className="text-lg font-semibold mb-4">Pricing & Area</legend>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Price (in paise) *</label>
              <input
                type="number"
                name="priceMin"
                value={formData.priceMin}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Price (in paise) *</label>
              <input
                type="number"
                name="priceMax"
                value={formData.priceMax}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Area (sq ft) *</label>
              <input
                type="number"
                name="areaMin"
                value={formData.areaMin}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Area (sq ft) *</label>
              <input
                type="number"
                name="areaMax"
                value={formData.areaMax}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Additional Info */}
        <fieldset className="border-l-4 border-green-500 pl-4">
          <legend className="text-lg font-semibold mb-4">Additional Information</legend>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleInputChange}
              placeholder="Parking, Security, Water Supply"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="border-l-4 border-purple-500 pl-4">
          <legend className="text-lg font-semibold mb-4">Images (Max 100KB each)</legend>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              ✅ {images.length} image(s) selected
            </p>
          )}
        </fieldset>

        {/* Videos */}
        <fieldset className="border-l-4 border-orange-500 pl-4">
          <legend className="text-lg font-semibold mb-4">Videos (Max 10MB each)</legend>
          <input
            type="file"
            multiple
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            onChange={handleVideoChange}
            className="w-full"
          />
          {videos.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              ✅ {videos.length} video(s) selected
            </p>
          )}
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50 transition"
        >
          {loading ? '⏳ Uploading...' : '✅ Upload Property'}
        </button>
      </form>
    </div>
  );
}
