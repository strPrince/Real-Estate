import { Router } from 'express';
import { db } from '../firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

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

export default router;
