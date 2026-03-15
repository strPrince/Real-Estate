import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Upload, Sparkles } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';

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
    area: '',
    bedrooms: '',
    bathrooms: '',
    intent: 'buy',
    propertyType: 'apartment',
    status: 'available',
    images: [],
    amenities: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(isEdit);

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
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
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

  useEffect(() => {
    if (!isEdit) return;
    const loadProperty = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const response = await fetch(`/api/properties/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to load property');
        const property = await response.json();
        setFormData({
          title: property.title || '',
          description: property.description || '',
          price: property.price ?? '',
          location: property.location?.locality || property.location?.city || '',
          area: property.area ?? '',
          bedrooms: property.bedrooms ?? '',
          bathrooms: property.bathrooms ?? '',
          intent: property.intent || 'buy',
          propertyType: property.propertyType || property.type || 'apartment',
          status: property.status || 'pending',
          images: [],
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
        });
        setExistingImages(Array.isArray(property.images) ? property.images : []);
      } catch (error) {
        toast.error(error.message || 'Failed to load property');
      } finally {
        setLoadingProperty(false);
      }
    };
    loadProperty();
  }, [id]);

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
        } else if (key === 'amenities') {
          data.append('amenities', JSON.stringify(formData.amenities));
        } else {
          data.append(key, formData[key]);
        }
      });

      data.append('userId', currentUser.uid);
      data.append('userName', currentUser.displayName || currentUser.email);

      data.append('existingImages', JSON.stringify(existingImages));

      const response = await fetch(isEdit ? `/api/properties/user/${id}` : '/api/properties/user-post', {
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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            {isEdit ? 'Edit Property' : 'Post Property'}
          </span>
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
                    Property Title
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
                    Description
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
                      Price (INR)
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
                      Locality
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="area" className="block text-sm font-semibold text-gray-700">
                      Area (sq ft)
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
                      Bedrooms
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
                      Bathrooms
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
                      Property Type
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
                      Intent
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
                      <option value="rent">Rent</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                      Status
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
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-semibold text-gray-700">
                    Images
                  </label>
                  {existingImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                  )}
                  <label
                    htmlFor="images"
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-white"
                  >
                    <Upload className="w-5 h-5 text-brand-500" />
                    <span className="font-semibold text-gray-900">Upload photos</span>
                    <span className="text-xs text-gray-500">PNG or JPG, up to 10 files</span>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index}`}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                      ))}
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
