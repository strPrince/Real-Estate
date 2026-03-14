import { Router } from 'express';
import { db } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ── GET /api/properties
// Query params: intent, type, city, minPrice, maxPrice, bedrooms, sort, featured, limit
router.get('/', async (req, res) => {
  try {
    const { intent, type, city, minPrice, maxPrice, bedrooms, sort, featured, cursor } = req.query;
    const pageLimit = Math.min(parseInt(req.query.limit) || 12, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    let baseQuery = db.collection('properties').where('status', '==', 'active');

    if (intent) baseQuery = baseQuery.where('intent', '==', intent);
    if (type) baseQuery = baseQuery.where('type', '==', type);
    if (featured === 'true') baseQuery = baseQuery.where('featured', '==', true);

    // Firestore only allows one inequality filter at a time.
    // City is an equality filter so safe to chain.
    if (city) baseQuery = baseQuery.where('location.city', '==', city);

    const needsInMemory =
      Boolean(minPrice) || Boolean(maxPrice) || Boolean(bedrooms) || Boolean(city);

    if (needsInMemory) {
      const snapshot = await baseQuery.get();
      let properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // City/locality filter (case-insensitive, matches either city or locality)
      if (city) {
        const needle = String(city).trim().toLowerCase();
        properties = properties.filter((p) => {
          const c = p.location?.city?.toLowerCase() || '';
          const l = p.location?.locality?.toLowerCase() || '';
          return c.includes(needle) || l.includes(needle);
        });
      }

      // Post-filter for price range and bedrooms
      if (minPrice) properties = properties.filter((p) => p.price >= parseInt(minPrice));
      if (maxPrice) properties = properties.filter((p) => p.price <= parseInt(maxPrice));
      if (bedrooms) properties = properties.filter((p) => (p.bedrooms || 0) >= parseInt(bedrooms));

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
      const pageItems = properties.slice(start, start + pageLimit);

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
    const properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    const snapshot = await db.collection('user_properties')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(properties);
  } catch (err) {
    console.error('GET /properties/user/my-properties error:', err);
    res.status(500).json({ error: 'Failed to fetch your properties' });
  }
});

// ── GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Property not found' });
    res.json({ id: doc.id, ...doc.data() });
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
    const data = {
      title: payload.title,
      description: payload.description || '',
      price: payload.price ? Number(payload.price) : 0,
      location: {
        city: payload.location,
        locality: payload.location
      },
      area: payload.area ? Number(payload.area) : 0,
      bedrooms: payload.bedrooms ? Number(payload.bedrooms) : 0,
      bathrooms: payload.bathrooms ? Number(payload.bathrooms) : 0,
      propertyType: payload.propertyType || 'apartment',
      status: payload.status || 'pending', // User posts start as pending approval
      images: imageUrls,
      amenities: [],
      userId: req.user.uid, // From auth middleware
      userName: payload.userName || 'Unknown User',
      featured: false,
      intent: 'sale', // Default to sale, can be changed by admin
      type: payload.propertyType || 'apartment',
      createdAt: now,
      updatedAt: now,
    };
    
    // Add property to database
    const ref = await db.collection('user_properties').add(data);
    
    res.status(201).json({ 
      id: ref.id, 
      ...data,
      message: 'Property submitted successfully. It will be reviewed by our team.' 
    });
  } catch (err) {
    console.error('POST /properties/user-post error:', err);
    res.status(500).json({ error: 'Failed to submit property' });
  }
});

// ── POST /api/properties  (admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title || !payload.intent || !payload.type || !payload.location?.city) {
      return res.status(400).json({
        error: 'Missing required fields: title, intent, type, location.city',
        receivedKeys: Object.keys(payload || {}),
        contentType: req.headers['content-type'] || '',
      });
    }
    const now = new Date().toISOString();
    const data = {
      ...payload,
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
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const data = {
      ...payload,
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
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.collection('properties').doc(req.params.id).delete();
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('DELETE /properties/:id error:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;
