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
// Returns aggregate stats plus full property list for admin dashboards.
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('properties').get();
    const properties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const stats = {
      total: properties.length,
      active: 0,
      sold: 0,
      rented: 0,
      inactive: 0,
      featured: 0,
      forSale: 0,
      forRent: 0,
      commercial: 0,
    };

    for (const p of properties) {
      const status = p.status || 'active';
      if (status === 'active') stats.active += 1;
      else if (status === 'sold') stats.sold += 1;
      else if (status === 'rented') stats.rented += 1;
      else stats.inactive += 1;

      if (p.featured) stats.featured += 1;
      if (p.intent === 'buy') stats.forSale += 1;
      if (p.intent === 'rent') stats.forRent += 1;
      if (p.intent === 'commercial') stats.commercial += 1;
    }

    res.json({ stats, properties });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
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

export default router;
