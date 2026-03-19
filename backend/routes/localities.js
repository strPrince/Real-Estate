import { Router } from 'express';
import { db } from '../firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// ── GET /api/localities
// Fetch all localities
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('localities').orderBy('name', 'asc').get();
    const localities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(localities);
  } catch (error) {
    console.error('Error fetching localities:', error);
    res.status(500).json({ error: 'Failed to fetch localities' });
  }
});

// ── POST /api/localities
// Add or update a locality (Admin only)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id, name, description, lat, lng } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Locality name is required' });
    }

    const localityData = {
      name,
      description: description || '',
      lat: parseFloat(lat) || null,
      lng: parseFloat(lng) || null,
      updatedAt: new Date().toISOString()
    };

    if (id) {
      // Update existing
      await db.collection('localities').doc(id).update(localityData);
      res.json({ message: 'Locality updated', id });
    } else {
      // Create new
      localityData.createdAt = new Date().toISOString();
      const docRef = await db.collection('localities').add(localityData);
      res.json({ message: 'Locality created', id: docRef.id });
    }
  } catch (error) {
    console.error('Error saving locality:', error);
    res.status(500).json({ error: 'Failed to save locality' });
  }
});

// ── DELETE /api/localities/:id
// Delete a locality (Admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('localities').doc(req.params.id).delete();
    res.json({ message: 'Locality deleted' });
  } catch (error) {
    console.error('Error deleting locality:', error);
    res.status(500).json({ error: 'Failed to delete locality' });
  }
});

export default router;
