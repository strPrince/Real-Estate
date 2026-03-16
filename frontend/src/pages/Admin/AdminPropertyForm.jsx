import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { createProperty, updateProperty, getProperty, uploadImage } from '../../api.js';
import { X, Upload, Loader2, Info, DollarSign, MapPin, Sparkles, ImagePlus, Settings2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['residential', 'commercial', 'plot', 'pg'];
const INTENTS = ['buy', 'rent', 'commercial'];
const STATUSES = ['active', 'draft', 'sold', 'rented'];
const DEFAULT_CITY = 'Vadodara';

const AMENITIES_LIST = [
  'Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup',
  'Garden', 'Club House', 'Play Area', 'CCTV', 'Intercom', 'Gas Pipeline',
];

const EMPTY_FORM = {
  title: '', description: '',
  type: 'residential', intent: 'buy',
  price: '', priceUnit: 'total',
  bedrooms: '', bathrooms: '', area: '',
  locality: '', address: '',
  lat: '', lng: '',
  status: 'active', featured: false,
  images: [], amenities: [],
};

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingProp, setLoadingProp] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getProperty(id)
      .then((data) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'residential',
          intent: data.intent || 'buy',
          price: data.price ?? '',
          priceUnit: data.priceUnit || 'total',
          bedrooms: data.bedrooms ?? '',
          bathrooms: data.bathrooms ?? '',
          area: data.area ?? '',
          locality: data.location?.locality || '',
          address: data.location?.address || '',
          lat: data.location?.lat ?? '',
          lng: data.location?.lng ?? '',
          status: data.status || 'active',
          featured: Boolean(data.featured),
          images: data.images || [],
          amenities: data.amenities || [],
        });
      })
      .catch(() => toast.error('Failed to load property'))
      .finally(() => setLoadingProp(false));
  }, [id]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  function toggleAmenity(a) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  }

  function removeImage(url) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const token = await getToken();
      const urls = await Promise.all(files.map((file) => uploadImage(file, token)));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        intent: form.intent,
        price: form.price,
        priceUnit: form.priceUnit,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area: form.area,
        location: {
          city: DEFAULT_CITY,
          locality: form.locality.trim(),
          address: form.address.trim(),
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        },
        status: form.status,
        featured: form.featured,
        images: form.images,
        amenities: form.amenities,
      };

      if (isEdit) {
        await updateProperty(id, payload, token);
        toast.success('Property updated!');
      } else {
        await createProperty(payload, token);
        toast.success('Property created!');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProp) return (
    <div className="flex items-center gap-3 text-gray-500 p-8">
      <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> Loading property...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7 flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mt-1 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Property Listing' : 'Add New Property'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isEdit
              ? 'Update the details of your property listing'
              : 'Fill in the details for your new property listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center"><Info className="w-3.5 h-3.5 text-brand-500" /></div>
            <h2 className="font-bold text-gray-800 text-base">Basic Information</h2>
          </div>

          <div className="space-y-5">
            <Field label="Title *" required>
              <input required value={form.title} onChange={set('title')} placeholder="e.g. 3BHK Apartment in Prime Location" className={inputCls} />
            </Field>

            <Field label="Description">
              <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Describe the property in detail..." className={`${inputCls} resize-none`} />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Property Type *" required>
                <select required value={form.type} onChange={set('type')} className={inputCls}>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Intent *" required>
                <select required value={form.intent} onChange={set('intent')} className={inputCls}>
                  {INTENTS.map((i) => <option key={i} value={i} className="capitalize">{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Pricing & Size */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-green-600" /></div>
            <h2 className="font-bold text-gray-800 text-base">Pricing & Size</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Price (₹) *" required>
              <input required type="number" min={0} value={form.price} onChange={set('price')} placeholder="e.g. 5000000" className={inputCls} />
            </Field>
            <Field label="Price Unit">
              <select value={form.priceUnit} onChange={set('priceUnit')} className={inputCls}>
                <option value="total">Total Price</option>
                <option value="per_month">Per Month</option>
              </select>
            </Field>
            <Field label="Bedrooms (BHK)">
              <input type="number" min={0} value={form.bedrooms} onChange={set('bedrooms')} placeholder="0" className={inputCls} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" min={0} value={form.bathrooms} onChange={set('bathrooms')} placeholder="0" className={inputCls} />
            </Field>
            <Field label="Area (sq.ft)">
              <input type="number" min={0} value={form.area} onChange={set('area')} placeholder="e.g. 1200" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-blue-600" /></div>
            <h2 className="font-bold text-gray-800 text-base">Location Details</h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <Field label="Locality *" required>
              <input required value={form.locality} onChange={set('locality')} placeholder="e.g. Alkapuri" className={inputCls} />
            </Field>
          </div>
          <Field label="Full Address">
            <input value={form.address} onChange={set('address')} placeholder="Street address..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <Field label="Latitude (for map)">
              <input type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="e.g. 19.076" className={inputCls} />
            </Field>
            <Field label="Longitude (for map)">
              <input type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="e.g. 72.877" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-yellow-500" /></div>
            <h2 className="font-bold text-gray-800 text-base">Amenities</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {AMENITIES_LIST.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  form.amenities.includes(a)
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:border-brand-500 hover:bg-brand-50'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><ImagePlus className="w-3.5 h-3.5 text-purple-600" /></div>
            <h2 className="font-bold text-gray-800 text-base">Property Images</h2>
          </div>

          {/* Previews */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-5">
              {form.images.map((url) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={url} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageUpload} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-brand-500 text-gray-700 hover:text-brand-500 px-5 py-4 rounded-xl text-sm font-medium w-full justify-center transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Images (JPEG / PNG / WebP)'}
          </button>
        </div>

        {/* Status & visibility */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Settings2 className="w-3.5 h-3.5 text-gray-600" /></div>
            <h2 className="font-bold text-gray-800 text-base">Visibility Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-5">
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl">
              <input type="checkbox" checked={form.featured} onChange={set('featured')} className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
              <div>
                <span className="text-base font-medium text-gray-800">Mark as Featured</span>
                <p className="text-sm text-gray-600">Featured properties appear prominently on the homepage</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper components
const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white';

function Field({ label, children, required }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>
      {children}
    </div>
  );
}
