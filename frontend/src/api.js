// API helper
const apiFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
};

// Simple in-memory cache (reduces repeated calls on filter reset/pagination)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const apiCache = new Map();
const inflightMap = new Map(); // in-flight deduplication

const cacheGet = (key) => {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.value;
};

const cacheSet = (key, value) => {
  apiCache.set(key, { value, ts: Date.now() });
};

const cacheClear = () => { apiCache.clear(); inflightMap.clear(); };

// ── Properties
export const getProperties = (params = {}) => {
  const query = new URLSearchParams();
  if (params.intent)   query.set('intent',   params.intent);
  if (params.type)     query.set('type',      params.type);
  if (params.q)        query.set('q',         params.q);
  if (params.bedrooms) query.set('bedrooms',  params.bedrooms);
  if (params.bathrooms) query.set('bathrooms', params.bathrooms);
  if (params.minPrice) query.set('minPrice',  params.minPrice);
  if (params.maxPrice) query.set('maxPrice',  params.maxPrice);
  if (params.minArea)  query.set('minArea',   params.minArea);
  if (params.maxArea)  query.set('maxArea',   params.maxArea);
  if (params.featured) query.set('featured',  params.featured);
  if (params.sort)     query.set('sort',       params.sort);
  if (params.limit)    query.set('limit',      params.limit);
  if (params.cursor)   query.set('cursor',     params.cursor);
  const qs = query.toString();
  const key = `properties?${qs || 'all'}`;
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  // Return same promise if request is already in-flight
  if (inflightMap.has(key)) return inflightMap.get(key);
  const promise = apiFetch(`/properties${qs ? `?${qs}` : ''}`).then((data) => {
    cacheSet(key, data);
    inflightMap.delete(key);
    return data;
  }).catch((err) => {
    inflightMap.delete(key);
    throw err;
  });
  inflightMap.set(key, promise);
  return promise;
};

export const getCachedProperties = () => {
  const now = Date.now();
  const collected = [];
  for (const [key, entry] of apiCache.entries()) {
    if (!entry || now - entry.ts > CACHE_TTL_MS) continue;
    if (key.startsWith('properties?')) {
      const list = entry.value?.properties;
      if (Array.isArray(list)) collected.push(...list);
    } else if (key.startsWith('property:')) {
      if (entry.value) collected.push(entry.value);
    }
  }
  const unique = new Map();
  for (const item of collected) {
    if (!item?.id) continue;
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  return [...unique.values()];
};

export const getProperty = (id) => {
  const key = `property:${id}`;
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  if (inflightMap.has(key)) return inflightMap.get(key);
  const promise = apiFetch(`/properties/${id}`).then((data) => {
    cacheSet(key, data);
    inflightMap.delete(key);
    return data;
  }).catch((err) => {
    inflightMap.delete(key);
    throw err;
  });
  inflightMap.set(key, promise);
  return promise;
};

export const getAdminStats = (token) =>
  apiFetch('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createProperty = (data, token) =>
  apiFetch('/properties', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((res) => {
    cacheClear();
    return res;
  });

export const updateProperty = (id, data, token) =>
  apiFetch(`/properties/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((res) => {
    cacheClear();
    return res;
  });

export const deleteProperty = (id, token) =>
  apiFetch(`/properties/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    cacheClear();
    return res;
  });

// ── Image Upload
export const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
};

// ── Property Inquiries (Google Sheet)
const PROPERTY_INQUIRY_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxaD_h9vyksE_qKjr7BQFVkbE-jRbTH5iA5BZXSsdofGoUnzSsUyeZMKfl71p6RIudFFg/exec';

export const submitInquiry = (data) =>
  fetch(PROPERTY_INQUIRY_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// ── Contact Form
export const submitContactForm = (data) => {
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyZq5K9i713_my6SSlxli-h0TeiOyxN1a3lmuccJmi8D-DX2p2WadVNBmEB47kxvca_kg/exec';
  
  return fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

