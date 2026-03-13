import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { storage } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── POST /api/upload  (admin only) — Upload a single image and return its public URL
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const bucket = storage.bucket();
    const file = bucket.file(filename);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.json({ url: publicUrl });
  } catch (err) {
    console.error('POST /upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;
