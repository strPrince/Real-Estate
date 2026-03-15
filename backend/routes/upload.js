import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { storage } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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

    await new Promise((resolve, reject) => {
      const writeStream = file.createWriteStream({
        metadata: { contentType: req.file.mimetype },
        public: true,
      });
      fs.createReadStream(req.file.path)
        .on('error', reject)
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.json({ url: publicUrl });
  } catch (err) {
    console.error('POST /upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  } finally {
    if (req.file?.path) {
      fsPromises.unlink(req.file.path).catch(() => {});
    }
  }
});

export default router;
