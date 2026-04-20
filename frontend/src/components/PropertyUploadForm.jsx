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
  const [formData, setFormData] = useState({
    name: 'Aadikara Avenue',
    locality: 'Atladra',
    city: 'Vadodara',
    description: 'Premium residential and commercial project',
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
    setImages([...e.target.files]);
  };

  const uploadImages = async () => {
    const imageUrls = [];

    for (const image of images) {
      try {
        const storageRef = ref(
          storage,
          `properties/${Date.now()}-${Math.random().toString(36).slice(2)}-${image.name}`
        );
        await uploadBytes(storageRef, image);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      } catch (err) {
        throw new Error(`Failed to upload image ${image.name}: ${err.message}`);
      }
    }

    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload images
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      // Create property document
      const propertyData = {
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim()),
        imageUrls,
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
              <label className="block text-sm font-medium mb-1">Intent *</label>
              <select
                name="intent"
                value={formData.intent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
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

          <div className="mb-4">
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
          <legend className="text-lg font-semibold mb-4">Images</legend>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {images.length} image(s) selected
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
