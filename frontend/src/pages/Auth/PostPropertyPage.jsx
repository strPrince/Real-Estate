import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Upload, Sparkles, Layers, Plus, Trash2, ImagePlus, X, ChevronLeft } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import BrochureUploadSection from '../../components/BrochureUploadSection/BrochureUploadSection.jsx';
import { getLocalities, uploadImage } from '../../api.js';
import { BACKEND_URL } from '../../config.js';

export default function PostPropertyPage() {
  const { currentUser, getToken } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    intent: 'buy',
    propertyType: 'apartment',
    status: 'available',
    images: [],
    videos: [],
    amenities: [],
    floorPlans: [],
    builder: '',
    brochure: null,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(isEdit);
  const [localities, setLocalities] = useState([]);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(null); // Track which floor plan is uploading

  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-50';
  const selectClass = `${inputClass} pr-10`;
  const textAreaClass = `${inputClass} min-h-[140px] resize-none`;

  const AMENITIES_LIST = [
    'Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup',
    'Garden', 'Club House', 'Play Area', 'CCTV', 'Intercom', 'Gas Pipeline',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (let file of files) {
      if (!validImageTypes.includes(file.type)) {
        toast.error(`Invalid image format: ${file.name}. Only JPG, PNG, WebP allowed.`);
        return;
      }
      if (file.size > 50 * 1024) {
        toast.error(`Image too large: ${file.name}. Max size 50KB.`);
        return;
      }
    }

    const totalImages = existingImages.length + files.length;
    if (totalImages > 10) {
      toast.error(`Maximum 10 images allowed. You have ${existingImages.length} existing and trying to add ${files.length} new.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    // Clean up old preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    for (let file of files) {
      if (!validVideoTypes.includes(file.type)) {
        toast.error(`Invalid video format: ${file.name}. Only MP4, MOV, AVI, MKV, WebM allowed.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Video too large: ${file.name}. Max size 10MB.`);
        return;
      }
    }

    const totalVideos = existingVideos.length + files.length;
    if (totalVideos > 5) {
      toast.error(`Maximum 5 videos allowed. You have ${existingVideos.length} existing and trying to add ${files.length} new.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      videos: files,
    }));

    // Clean up old preview URLs
    videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews = files.map((file) => URL.createObjectURL(file));
    setVideoPreviews(previews);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    
    const newImages = [];
    const newVideos = [];
    
    for (let file of files) {
      const isImage = validImageTypes.includes(file.type);
      const isVideo = validVideoTypes.includes(file.type);
      
      if (!isImage && !isVideo) {
        toast.error(`Invalid file format: ${file.name}. Only images (JPG, PNG, WebP) and videos (MP4, MOV, AVI, MKV, WebM) allowed.`);
        continue;
      }
      
      if (isImage) {
        if (file.size > 50 * 1024) {
          toast.error(`Image too large: ${file.name}. Max size 50KB.`);
          continue;
        }
        newImages.push(file);
      }

      if (isVideo) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Video too large: ${file.name}. Max size 10MB.`);
          continue;
        }
        newVideos.push(file);
      }
    }
    
    if (newImages.length > 0) {
      const totalImages = existingImages.length + newImages.length;
      if (totalImages > 10) {
        toast.error(`Maximum 10 images allowed. You have ${existingImages.length} existing and trying to add ${newImages.length} new.`);
        newImages.length = 0;
      } else {
        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        const previews = newImages.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
      }
    }
    
    if (newVideos.length > 0) {
      const totalVideos = existingVideos.length + newVideos.length;
      if (totalVideos > 5) {
        toast.error(`Maximum 5 videos allowed. You have ${existingVideos.length} existing and trying to add ${newVideos.length} new.`);
        newVideos.length = 0;
      } else {
        setFormData((prev) => ({
          ...prev,
          videos: newVideos,
        }));
        videoPreviews.forEach((url) => URL.revokeObjectURL(url));
        const previews = newVideos.map((file) => URL.createObjectURL(file));
        setVideoPreviews(previews);
      }
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((item) => item !== url));
  };

  const removeExistingVideo = (index) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeNewVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setVideoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const data = await getLocalities();
        setLocalities(data);
      } catch (error) {
        toast.error('Could not load localities.');
      }
    };
    fetchLocalities();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  useEffect(() => {
    if (!isEdit) return;
    const loadProperty = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const response = await fetch(`${BACKEND_URL}/api/properties/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to load property');
        const property = await response.json();
        const normalizedStatus = property.status === 'active' ? 'available' : (property.status || 'available');
        setFormData({
          title: property.title || '',
          description: property.description || '',
          price: property.price ?? '',
          location: property.location?.locality || property.location?.city || '',
          address: property.location?.address || '',
          area: property.area ?? '',
          bedrooms: property.bedrooms ?? '',
          bathrooms: property.bathrooms ?? '',
          intent: property.intent || 'buy',
          propertyType: property.propertyType || property.type || 'apartment',
          status: normalizedStatus,
          images: [],
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
          floorPlans: Array.isArray(property.floorPlans) ? property.floorPlans : [],
          builder: property.builder || '',
          brochure: property.brochure
            ? typeof property.brochure === 'string'
              ? { url: property.brochure, name: property.brochure.split('/').pop() || 'brochure', size: 0 }
              : property.brochure
            : null,
          videos: [],
        });
        setExistingImages(Array.isArray(property.images) ? property.images : []);
        setExistingVideos(Array.isArray(property.videos) ? property.videos : []);
      } catch (error) {
        toast.error(error.message || 'Failed to load property');
      } finally {
        setLoadingProperty(false);
      }
    };
    loadProperty();
  }, [id]);

  // Cleanup object URLs for image and video previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      videoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'images') {
          formData.images.forEach((image) => {
            data.append('images', image);
          });
        } else if (key === 'videos') {
          formData.videos.forEach((video) => {
            data.append('videos', video);
          });
        } else if (key === 'amenities') {
          data.append('amenities', JSON.stringify(formData.amenities));
        } else if (key === 'floorPlans') {
          data.append('floorPlans', JSON.stringify(formData.floorPlans));
        } else if (key === 'brochure' && formData.brochure?.file) {
          data.append('brochure', formData.brochure.file, formData.brochure.name);
        } else {
          data.append(key, formData[key]);
        }
      });

      data.append('userId', currentUser.uid);
      data.append('userName', currentUser.displayName || currentUser.email);

      data.append('existingImages', JSON.stringify(existingImages));
      data.append('existingVideos', JSON.stringify(existingVideos));

      const response = await fetch(isEdit ? `${BACKEND_URL}/api/properties/user/${id}` : `${BACKEND_URL}/api/properties/user-post`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to post property');
      }

      toast.success(isEdit ? 'Property updated successfully!' : 'Property posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to post property: ' + error.message);
    }

    setLoading(false);
  };

  if (loadingProperty) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
              {isEdit ? 'Edit Property' : 'Post Property'}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:text-accent-600 hover:border-accent-300 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">
              {isEdit ? 'Update your listing' : 'List your property'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 text-pretty">
              {isEdit
                ? 'Make changes to your listing. Updates may require re-approval.'
                : 'Share the details once and reach thousands of interested buyers in Vadodara.'}
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr,0.85fr] items-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className={textAreaClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                      Price (INR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                      Locality <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="">Select a Locality</option>
                      {localities.map((loc) => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                    Full Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full property address"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="area" className="block text-sm font-semibold text-gray-700">
                      Area (sq ft) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="area"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-semibold text-gray-700">
                      Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="bedrooms"
                      name="bedrooms"
                      required
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-semibold text-gray-700">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="bathrooms"
                      name="bathrooms"
                      required
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="propertyType" className="block text-sm font-semibold text-gray-700">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      required
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="plot">Plot</option>
                      <option value="commercial">Commercial</option>
                      <option value="pg">PG</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="intent" className="block text-sm font-semibold text-gray-700">
                      Intent <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="intent"
                      name="intent"
                      required
                      value={formData.intent}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="buy">Buy</option>
                      <option value="rent">{formData.propertyType === 'commercial' ? 'Lease' : 'Rent'}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="available">Available</option>
                      <option value="draft">Draft</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-semibold text-gray-700">
                    Media (Images & Videos)
                  </label>
                  {existingImages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {existingImages.map((url) => (
                          <div key={url} className="relative">
                            <img
                              src={url}
                              alt="Existing"
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(url)}
                              className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {existingVideos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Existing Videos:</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {existingVideos.map((url, idx) => (
                          <div key={idx} className="relative">
                            <video
                              src={url}
                              controls
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingVideo(idx)}
                              className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <label
                      htmlFor="media"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-white"
                    >
                      <Upload className="w-5 h-5 text-brand-500" />
                      <span className="font-semibold text-gray-900">Upload Images & Videos</span>
                      <span className="text-xs text-gray-500">Images: PNG, JPG, WebP (Max 50KB • up to 10 files) | Videos: MP4, MOV, AVI, MKV, WebM (Max 10MB • up to 5 videos)</span>
                      <input
                        type="file"
                        id="media"
                        name="media"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {(imagePreviews.length > 0 || videoPreviews.length > 0) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">New Media:</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={`img-${index}`} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {videoPreviews.map((preview, index) => (
                          <div key={`vid-${index}`} className="relative">
                            <video
                              src={preview}
                              controls
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewVideo(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Amenities
                  </label>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {AMENITIES_LIST.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                          formData.amenities.includes(amenity)
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:border-brand-500 hover:bg-brand-50'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floor Plans */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Floor Plans
                  </label>
                  <p className="mt-1 text-xs text-gray-500">Add different floor plan variants with details like area, BHK, and pricing.</p>
                  {formData.floorPlans.length > 0 && (
                    <div className="mt-3 space-y-4">
                      {formData.floorPlans.map((fp, idx) => (
                        <div key={idx} className="relative border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, floorPlans: prev.floorPlans.filter((_, i) => i !== idx) }))}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                              <input
                                value={fp.label}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], label: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. 2 BHK - Type A"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Carpet Area</label>
                              <input
                                type="number" min={0} step="any"
                                value={fp.carpetArea}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], carpetArea: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. 660.36"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">BHK</label>
                              <input
                                value={fp.bhk}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], bhk: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. 2 BHK"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                              <input
                                type="number" min={0}
                                value={fp.price}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], price: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. 3799000"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                              <input
                                value={fp.status}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], status: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. New Launch"
                                className={inputClass}
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Other Amenities</label>
                              <input
                                value={fp.otherAmenities || ''}
                                onChange={(e) => {
                                  const updated = [...formData.floorPlans];
                                  updated[idx] = { ...updated[idx], otherAmenities: e.target.value };
                                  setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                }}
                                placeholder="e.g. Private Terrace, Jacuzzi"
                                className={inputClass}
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            {fp.image ? (
                              <div className="relative inline-block">
                                <img src={fp.image} alt={fp.label} className="h-20 rounded-lg object-cover border border-gray-200" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formData.floorPlans];
                                    updated[idx] = { ...updated[idx], image: '' };
                                    setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                  }}
                                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                             ) : (
                               <label className={`inline-flex items-center gap-2 text-xs cursor-pointer transition-colors ${
                                 uploadingFloorPlan === idx
                                   ? 'text-gray-400 cursor-not-allowed'
                                   : 'text-gray-500 hover:text-brand-500'
                               }`}>
                                 {uploadingFloorPlan === idx ? (
                                   <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                 ) : (
                                   <ImagePlus className="w-4 h-4" />
                                 )}
                                 {uploadingFloorPlan === idx ? 'Uploading...' : 'Upload floor plan image'}
                                 <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  disabled={uploadingFloorPlan === idx}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Validate file size (50KB limit)
                                    if (file.size > 50 * 1024) {
                                      toast.error(`Image too large: ${file.name}. Max size 50KB.`);
                                      e.target.value = '';
                                      return;
                                    }

                                    // Validate file type
                                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                    if (!validTypes.includes(file.type)) {
                                      toast.error(`Invalid file format: ${file.name}. Only JPG, PNG, WebP allowed.`);
                                      e.target.value = '';
                                      return;
                                    }

                                    try {
                                      setUploadingFloorPlan(idx);
                                      const token = await getToken();
                                      const url = await uploadImage(file, token);
                                      const updated = [...formData.floorPlans];
                                      updated[idx] = { ...updated[idx], image: url };
                                      setFormData((prev) => ({ ...prev, floorPlans: updated }));
                                      toast.success('Floor plan image uploaded');
                                    } catch (err) {
                                      toast.error(err.message || 'Upload failed');
                                    } finally {
                                      setUploadingFloorPlan(null);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      floorPlans: [...prev.floorPlans, { label: '', carpetArea: '', areaUnit: 'sq.ft.', bhk: '', price: '', status: '', image: '', otherAmenities: '' }],
                    }))}
                    className="mt-3 flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-brand-500 text-gray-600 hover:text-brand-500 px-4 py-3 rounded-xl text-sm font-medium w-full justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Floor Plan
                  </button>
                </div>

                {/* Brochure Upload */}
                <BrochureUploadSection
                  brochure={formData.brochure}
                  onBrochureChange={(brochure) => setFormData((prev) => ({ ...prev, brochure }))}
                  builder={formData.builder}
                  onBuilderChange={(builder) => setFormData((prev) => ({ ...prev, builder }))}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Property' : 'Post Property')}
                </button>
              </form>
            </div>

            <div className="relative rounded-4xl overflow-hidden bg-gray-900 p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[28px_28px] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />
              <div className="relative space-y-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  Listing Tips
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
                  Make your listing stand out
                </h2>
                <p className="text-gray-300 text-pretty">
                  Well-presented listings receive more qualified inquiries and higher quality offers.
                </p>
                <ul className="space-y-4 text-sm text-gray-300">
                  {[
                    'Use a clear, descriptive title with key features.',
                    'Add 6 to 10 photos with good lighting.',
                    'Share accurate pricing and current availability.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-gray-200">
                    Need help? Our advisors can help craft the perfect listing.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-200">Reach out through the Contact page.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
