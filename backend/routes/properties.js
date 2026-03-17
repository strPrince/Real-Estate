import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { promises as fsPromises } from 'fs';
import { db } from '../firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

const DEFAULT_CITY = 'Vadodara';

const normalizeUserStatus = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'draft') return 'draft';
  if (value === 'available' || value === 'active') return 'active';
  if (value === 'sold' || value === 'rented') return value;
  return 'active';
};

const normalizeUserType = (propertyType) => {
  const value = String(propertyType || '').toLowerCase();
  if (value === 'plot') return 'plot';
  if (value === 'commercial') return 'commercial';
  if (value === 'pg') return 'pg';
  return 'residential';
};

const normalizeUserIntent = (intent) => {
  const value = String(intent || '').toLowerCase();
  if (value === 'rent') return 'rent';
  if (value === 'commercial') return 'commercial';
  return 'buy';
};

const sanitizePublicProperty = (property) => {
  if (!property) return property;
  return property;
};

// ── GET /api/properties
// Query params: intent, type, q, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, sort, featured, limit
router.get('/', async (req, res) => {
  try {
    const {
      intent,
      type,
      q,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      sort,
      featured,
      cursor,
    } = req.query;
    const pageLimit = Math.min(parseInt(req.query.limit) || 12, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    let baseQuery = db.collection('properties').where('status', '==', 'active');

    if (intent) baseQuery = baseQuery.where('intent', '==', intent);
    if (type) baseQuery = baseQuery.where('type', '==', type);
    if (featured === 'true') baseQuery = baseQuery.where('featured', '==', true);

    const needsInMemory =
      Boolean(q) ||
      Boolean(minPrice) ||
      Boolean(maxPrice) ||
      Boolean(bedrooms) ||
      Boolean(bathrooms) ||
      Boolean(minArea) ||
      Boolean(maxArea);

    if (needsInMemory) {
      const snapshot = await baseQuery.get();
      let properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const normalize = (value) => String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const isSubsequence = (needle, haystack) => {
        let i = 0;
        for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
          if (haystack[j] === needle[i]) i += 1;
        }
        return i === needle.length;
      };

      const tokens = normalize(q).split(' ').filter(Boolean);

      if (tokens.length) {
        properties = properties.filter((p) => {
          const hay = normalize([
            p.title,
            p.location?.locality,
            p.location?.address,
            p.type,
            p.propertyType,
            p.intent,
            p.status,
            Array.isArray(p.amenities) ? p.amenities.join(' ') : '',
            p.bedrooms,
            p.bathrooms,
            p.area,
          ].filter(Boolean).join(' '));
          return tokens.every((t) => hay.includes(t) || isSubsequence(t, hay));
        });
      }

      // Post-filter for price range and bedrooms
      if (minPrice) properties = properties.filter((p) => p.price >= parseInt(minPrice));
      if (maxPrice) properties = properties.filter((p) => p.price <= parseInt(maxPrice));
      if (bedrooms) properties = properties.filter((p) => (p.bedrooms || 0) >= parseInt(bedrooms));
      if (bathrooms) properties = properties.filter((p) => (p.bathrooms || 0) >= parseInt(bathrooms));
      if (minArea) properties = properties.filter((p) => (p.area || 0) >= parseInt(minArea));
      if (maxArea) properties = properties.filter((p) => (p.area || 0) <= parseInt(maxArea));

      // Sort in memory
      if (sort === 'price_asc') {
        properties = properties.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sort === 'price_desc') {
        properties = properties.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else {
        properties = properties.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }

      const cursorIndex = cursor ? properties.findIndex((p) => p.id === cursor) : -1;
      const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      const pageItems = properties.slice(start, start + pageLimit).map(sanitizePublicProperty);

      const nextCursor = pageItems.length ? pageItems[pageItems.length - 1].id : null;
      const hasMore = start + pageLimit < properties.length;
      res.json({ properties: pageItems, nextCursor, hasMore, pageSize: pageLimit });
      return;
    }

    let query = baseQuery;
    if (sort === 'price_asc') query = query.orderBy('price', 'asc');
    else if (sort === 'price_desc') query = query.orderBy('price', 'desc');
    else query = query.orderBy('createdAt', 'desc');

    if (cursor) {
      const cursorDoc = await db.collection('properties').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }
    query = query.limit(pageLimit);

    const snapshot = await query.get();
    const properties = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .map(sanitizePublicProperty);

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;
    const hasMore = snapshot.size === pageLimit;
    res.json({ properties, nextCursor, hasMore, pageSize: pageLimit });
  } catch (err) {
    console.error('GET /properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// ── GET /api/properties/user/my-properties  (authenticated users only)
router.get('/user/my-properties', requireAuth, async (req, res) => {
  try {
    const pageLimit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { cursor } = req.query;

    let query = db.collection('properties')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc');

    if (cursor) {
      const cursorDoc = await db.collection('properties').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    query = query.limit(pageLimit);

    const snapshot = await query.get();
    const properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;
    const hasMore = snapshot.size === pageLimit;

    res.json({ properties, nextCursor, hasMore, pageSize: pageLimit });
  } catch (err) {
    console.error('GET /properties/user/my-properties error:', err);
    res.status(500).json({ error: 'Failed to fetch your properties' });
  }
});

// ── GET /api/properties/user/:id  (authenticated users only)
router.get('/user/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Property not found' });
    const data = doc.data();
    if (data.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden - not your property' });
    }
    res.json({ id: doc.id, ...data });
  } catch (err) {
    console.error('GET /properties/user/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ── GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Property not found' });
    const data = sanitizePublicProperty({ id: doc.id, ...doc.data() });
    res.json(data);
  } catch (err) {
    console.error('GET /properties/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ── POST /api/properties/user-post  (authenticated users only)
router.post('/user-post', requireAuth, async (req, res) => {
  try {
    // Multer handles multipart/form-data parsing
    const payload = req.body || {};
    
    // Validate required fields
    if (!payload.title || !payload.location) {
      return res.status(400).json({
        error: 'Missing required fields: title, location'
      });
    }
    
    const now = new Date().toISOString();
    
    // Handle uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // In a real implementation, you would upload these to cloud storage
      // For now, we'll just store the filenames
      imageUrls = req.files.map(file => `/uploads/${file.originalname}`);
    }
    
    // Create property data with user info
    let amenities = [];
    if (payload.amenities) {
      try {
        const parsed = JSON.parse(payload.amenities);
        if (Array.isArray(parsed)) amenities = parsed;
      } catch {
        amenities = String(payload.amenities)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const data = {
      title: payload.title,
      description: payload.description || '',
      price: payload.price ? Number(payload.price) : 0,
      location: {
        city: DEFAULT_CITY,
        locality: payload.location,
      },
      area: payload.area ? Number(payload.area) : 0,
      bedrooms: payload.bedrooms ? Number(payload.bedrooms) : 0,
      bathrooms: payload.bathrooms ? Number(payload.bathrooms) : 0,
      propertyType: payload.propertyType || 'apartment',
      status: normalizeUserStatus(payload.status), // User posts visible by default
      images: imageUrls,
      amenities,
      userId: req.user.uid, // From auth middleware
      userName: payload.userName || 'Unknown User',
      featured: false,
      intent: normalizeUserIntent(payload.intent), // Default to buy
      type: normalizeUserType(payload.propertyType),
      createdAt: now,
      updatedAt: now,
    };
    
    // Add property to main properties collection
    const ref = await db.collection('properties').add(data);
    
    res.status(201).json({ 
      id: ref.id, 
      ...data,
      message: 'Property submitted successfully. It will be reviewed by our team.' 
    });
  } catch (err) {
    console.error('POST /properties/user-post error:', err);
    res.status(500).json({ error: 'Failed to submit property' });
  } finally {
    if (Array.isArray(req.files)) {
      await Promise.all(req.files.map((file) => (
        file?.path ? fsPromises.unlink(file.path).catch(() => {}) : Promise.resolve()
      )));
    }
  }
});

// ── PUT /api/properties/user/:id  (authenticated users only)
router.put('/user/:id', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const docRef = db.collection('properties').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Property not found' });

    const existing = doc.data();
    if (existing.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden - not your property' });
    }

    const payload = req.body || {};

    let amenities = [];
    if (payload.amenities) {
      try {
        const parsed = JSON.parse(payload.amenities);
        if (Array.isArray(parsed)) amenities = parsed;
      } catch {
        amenities = String(payload.amenities)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    let existingImages = [];
    if (payload.existingImages) {
      try {
        const parsed = JSON.parse(payload.existingImages);
        if (Array.isArray(parsed)) existingImages = parsed;
      } catch {
        existingImages = [];
      }
    } else if (Array.isArray(existing.images)) {
      existingImages = existing.images;
    }

    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      newImageUrls = req.files.map((file) => `/uploads/${file.originalname}`);
    }

    const now = new Date().toISOString();
    const data = {
      title: payload.title || existing.title || '',
      description: payload.description || existing.description || '',
      price: payload.price ? Number(payload.price) : (existing.price || 0),
      location: {
        city: existing.location?.city || DEFAULT_CITY,
        locality: payload.location || existing.location?.locality || '',
      },
      area: payload.area ? Number(payload.area) : (existing.area || 0),
      bedrooms: payload.bedrooms ? Number(payload.bedrooms) : (existing.bedrooms || 0),
      bathrooms: payload.bathrooms ? Number(payload.bathrooms) : (existing.bathrooms || 0),
      propertyType: payload.propertyType || existing.propertyType || 'apartment',
      status: normalizeUserStatus(payload.status || existing.status),
      images: [...existingImages, ...newImageUrls],
      amenities,
      userName: payload.userName || existing.userName || 'Unknown User',
      intent: normalizeUserIntent(payload.intent || existing.intent),
      type: normalizeUserType(payload.propertyType || existing.type),
      updatedAt: now,
    };

    await docRef.update(data);
    res.json({ id: doc.id, ...existing, ...data });
  } catch (err) {
    console.error('PUT /properties/user/:id error:', err);
    res.status(500).json({ error: 'Failed to update property' });
  } finally {
    if (Array.isArray(req.files)) {
      await Promise.all(req.files.map((file) => (
        file?.path ? fsPromises.unlink(file.path).catch(() => {}) : Promise.resolve()
      )));
    }
  }
});

// ── POST /api/properties  (admin only)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title || !payload.intent || !payload.type || !payload.location?.locality) {
      return res.status(400).json({
        error: 'Missing required fields: title, intent, type, location.locality',
        receivedKeys: Object.keys(payload || {}),
        contentType: req.headers['content-type'] || '',
      });
    }
    const now = new Date().toISOString();
    const data = {
      ...payload,
      location: {
        ...payload.location,
        city: payload.location?.city || DEFAULT_CITY,
      },
      price: payload.price !== '' && payload.price !== undefined ? Number(payload.price) : 0,
      bedrooms: payload.bedrooms !== '' && payload.bedrooms !== undefined ? Number(payload.bedrooms) : 0,
      bathrooms: payload.bathrooms !== '' && payload.bathrooms !== undefined ? Number(payload.bathrooms) : 0,
      area: payload.area !== '' && payload.area !== undefined ? Number(payload.area) : 0,
      featured: payload.featured === true || payload.featured === 'true',
      images: payload.images || [],
      amenities: payload.amenities || [],
      status: payload.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    const ref = await db.collection('properties').add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /properties error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// ── PUT /api/properties/:id  (admin only)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const payload = req.body || {};
    const data = {
      ...payload,
      location: payload.location
        ? { ...payload.location, city: payload.location?.city || DEFAULT_CITY }
        : payload.location,
      price: payload.price !== '' && payload.price !== undefined ? Number(payload.price) : 0,
      bedrooms: payload.bedrooms !== '' && payload.bedrooms !== undefined ? Number(payload.bedrooms) : 0,
      bathrooms: payload.bathrooms !== '' && payload.bathrooms !== undefined ? Number(payload.bathrooms) : 0,
      area: payload.area !== '' && payload.area !== undefined ? Number(payload.area) : 0,
      featured: payload.featured === true || payload.featured === 'true',
      images: payload.images || [],
      amenities: payload.amenities || [],
      updatedAt: new Date().toISOString(),
    };
    await db.collection('properties').doc(req.params.id).update(data);
    res.json({ id: req.params.id, ...data });
  } catch (err) {
    console.error('PUT /properties/:id error:', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// ── DELETE /api/properties/:id  (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('properties').doc(req.params.id).delete();
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('DELETE /properties/:id error:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;
