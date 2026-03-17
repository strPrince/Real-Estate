import { Router } from 'express';
import { db } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/queries
router.post('/', async (req, res) => {
  try {
    const { propertyId, propertyTitle, ownerId, name, email, phone, message } = req.body;

    if (!propertyId || !ownerId || !name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'propertyId, ownerId, name, email, and message are required' });
    }

    const data = {
      propertyId,
      propertyTitle: propertyTitle || 'Unknown Property',
      ownerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection('queries').add(data);
    res.status(201).json({ id: ref.id, message: 'Query submitted successfully' });
  } catch (err) {
    console.error('POST /queries error:', err);
    res.status(500).json({ error: 'Failed to submit query' });
  }
});

// GET /api/queries/my-queries
router.get('/my-queries', requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('queries')
      .where('ownerId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
      
    const queries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ queries });
  } catch (err) {
    console.error('GET /queries/my-queries error:', err);
    res.status(500).json({ error: 'Failed to fetch your queries' });
  }
});

export default router;
