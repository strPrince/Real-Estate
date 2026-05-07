import { Router } from 'express';
import { db } from '../firebase.js';

const router = Router();

// ── POST /api/inquiries  (public — user contact form on property detail page)
router.post('/', async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    // Basic input sanitization
    if (!propertyId || !name?.trim()) {
      return res.status(400).json({ error: 'propertyId and name are required' });
    }

    // Email validation (optional but must be valid if provided)
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    }

    const data = {
      propertyId,
      name: name.trim(),
      email: email?.trim() ? email.trim().toLowerCase() : '',
      phone: phone?.trim() || '',
      message: message?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection('inquiries').add(data);
    res.status(201).json({ id: ref.id, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('POST /inquiries error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

export default router;
