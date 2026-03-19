const API_PREFIX = '/api';

const cache = new Map();
let lastPropertiesCache = [];

const buildUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalized}`;
};

const mergeHeaders = (headers = {}) => ({
  Accept: 'application/json',
  ...headers,
});

const parseError = async (res) => {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
    return data?.message || res.statusText;
  } catch {
    return res.statusText;
  }
};

const apiFetch = async (path, options = {}) => {
  const init = { ...options };
  init.headers = mergeHeaders(options.headers);
  if (init.body && !(init.body instanceof FormData)) {
    init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
  }
  const res = await fetch(buildUrl(path), init);
  if (!res.ok) {
    const message = await parseError(res);
    const err = new Error(message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
};

const setCache = (key, data) => {
  cache.set(key, { data, ts: Date.now() });
};

const getCache = (key, ttlMs) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (ttlMs && Date.now() - entry.ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const withCache = (key, fetcher, { ttlMs = 60_000 } = {}) => {
  const cached = getCache(key, ttlMs);
  if (cached) return Promise.resolve(cached);
  return fetcher().then((data) => {
    setCache(key, data);
    return data;
  });
};

const cacheClear = (prefix = '') => {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
};

// ── Properties
export const getProperties = async (params = {}) => {
  const data = await apiFetch(`/properties${buildQuery(params)}`);
  if (Array.isArray(data?.properties)) lastPropertiesCache = data.properties;
  return data;
};

export const getCachedProperties = () => lastPropertiesCache || [];

export const getProperty = (id) =>
  withCache(`property:${id}`, () => apiFetch(`/properties/${id}`), { ttlMs: 120_000 });

export const createProperty = (payload, token) =>
  apiFetch('/properties', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }).then((res) => {
    cacheClear('properties');
    return res;
  });

export const updateProperty = (id, payload, token) =>
  apiFetch(`/properties/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }).then((res) => {
    cacheClear('properties');
    cacheClear(`property:${id}`);
    return res;
  });

export const deleteProperty = (id, token) =>
  apiFetch(`/properties/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    cacheClear('properties');
    cacheClear(`property:${id}`);
    return res;
  });

export const uploadImage = async (file, token) => {
  const data = new FormData();
  data.append('image', file);
  const res = await apiFetch('/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  return res?.url;
};

// ── Inquiries & Queries
export const submitInquiry = (payload) =>
  apiFetch('/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const submitQuery = (payload) =>
  apiFetch('/queries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getMyQueries = (token) =>
  apiFetch('/queries/my-queries', {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Admin
export const getAdminStats = (token) =>
  apiFetch('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminProperties = (token, params = {}) =>
  apiFetch(`/admin/properties${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminUsers = (token) =>
  apiFetch('/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminUser = (id, token) =>
  apiFetch(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminUserProperties = (id, token, params = {}) =>
  apiFetch(`/admin/users/${id}/properties${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminUserQueries = (id, token) =>
  apiFetch(`/admin/users/${id}/queries`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Localities
export const getLocalities = () => {
  const key = 'localities:list';
  return withCache(key, () => apiFetch('/localities'), { ttlMs: 60_000 });
};

export const saveLocality = (data, token) =>
  apiFetch('/localities', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((res) => {
    cacheClear('localities');
    return res;
  });

export const deleteLocality = (id, token) =>
  apiFetch(`/localities/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    cacheClear('localities');
    return res;
  });

// ── Contact (maps to inquiries collection)
export const submitContactForm = (formData) => {
  const messageParts = [
    formData?.query ? `Query: ${formData.query}` : '',
    formData?.location ? `Location: ${formData.location}` : '',
    formData?.contactNumber ? `Contact: ${formData.contactNumber}` : '',
  ].filter(Boolean);

  const payload = {
    propertyId: 'general-contact',
    name: formData?.name || 'Anonymous',
    email: formData?.email || '',
    phone: formData?.contactNumber || '',
    message: messageParts.join('\n'),
  };

  return submitInquiry(payload);
};
