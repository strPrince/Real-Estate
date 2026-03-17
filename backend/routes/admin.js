import { Router } from 'express';
import { db } from '../firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const buildUserSummary = (doc) => {
  const data = doc.data() || {};
  const name = data.name || data.displayName || '';
  return {
    id: doc.id,
    uid: doc.id,
    email: data.email || '',
    name,
    displayName: name,
    role: data.role || 'user',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    lastLoginAt: data.lastLoginAt || null,
  };
};

// GET /api/admin/stats
// Returns aggregate stats for admin dashboards.
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const coll = db.collection('properties');
    
    // Use parallel count aggregations for maximum speed
    const [
      totalCount,
      activeCount,
      soldCount,
      rentedCount,
      featuredCount,
      buyCount,
      rentCount,
      commercialCount
    ] = await Promise.all([
      coll.count().get(),
      coll.where('status', '==', 'active').count().get(),
      coll.where('status', '==', 'sold').count().get(),
      coll.where('status', '==', 'rented').count().get(),
      coll.where('featured', '==', true).count().get(),
      coll.where('intent', '==', 'buy').count().get(),
      coll.where('intent', '==', 'rent').count().get(),
      coll.where('intent', '==', 'commercial').count().get(),
    ]);

    const stats = {
      total: totalCount.data().count,
      active: activeCount.data().count,
      sold: soldCount.data().count,
      rented: rentedCount.data().count,
      inactive: totalCount.data().count - (activeCount.data().count + soldCount.data().count + rentedCount.data().count),
      featured: featuredCount.data().count,
      forSale: buyCount.data().count,
      forRent: rentCount.data().count,
      commercial: commercialCount.data().count,
    };

    res.json({ stats });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/properties
// Returns paginated list of properties with search/filter.
router.get('/properties', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { q, status, intent, type, limit = 20, cursor } = req.query;
    const pageLimit = Math.min(parseInt(limit) || 20, 100);

    let query = db.collection('properties').orderBy('createdAt', 'desc');

    // Note: Firestore search is limited. For real search, use Algolia/Elasticsearch.
    // Here we'll do basic filtering if provided.
    if (status) query = query.where('status', '==', status);
    if (intent) query = query.where('intent', '==', intent);
    if (type) query = query.where('type', '==', type);

    if (cursor) {
      const cursorDoc = await db.collection('properties').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    query = query.limit(pageLimit);

    const snapshot = await query.get();
    let properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Simple in-memory search for 'q' if provided (since Firestore doesn't support partial match well)
    if (q) {
      const term = q.toLowerCase();
      properties = properties.filter(p => 
        p.title?.toLowerCase().includes(term) || 
        p.location?.locality?.toLowerCase().includes(term)
      );
    }

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    res.json({ properties, nextCursor, hasMore: snapshot.size === pageLimit });
  } catch (err) {
    console.error('GET /admin/properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/admin/users
// Returns all users for admin management.
router.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(buildUserSummary)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.json({ users });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:id
// Returns details for a specific user (admin only).
router.get('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(buildUserSummary(doc));
  } catch (err) {
    console.error('GET /admin/users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/admin/users/:id/properties
// Returns properties uploaded by a specific user (admin only).
router.get('/users/:id/properties', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const pageLimit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { cursor } = req.query;
    let query = db.collection('properties')
      .where('userId', '==', req.params.id)
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
    console.error('GET /admin/users/:id/properties error:', err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// GET /api/admin/users/:id/queries
// Returns queries sent to a specific user (admin only).
router.get('/users/:id/queries', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('queries')
      .where('ownerId', '==', req.params.id)
      .orderBy('createdAt', 'desc')
      .get();
    const queries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ queries });
  } catch (err) {
    console.error('GET /admin/users/:id/queries error:', err);
    res.status(500).json({ error: 'Failed to fetch user queries' });
  }
});

export default router;
