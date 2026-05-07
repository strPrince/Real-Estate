import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { storage } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// File size limits in bytes
const FILE_SIZE_LIMITS = {
  image: 50 * 1024,        // 50KB for images
  video: 10 * 1024 * 1024, // 10MB for videos
};

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
};

const ALLOWED_MIME_TYPES_FLAT = [
  ...ALLOWED_MIME_TYPES.image,
  ...ALLOWED_MIME_TYPES.video,
];

// Helper to get file category and size limit
function getFileCategoryAndLimit(mimetype) {
  if (ALLOWED_MIME_TYPES.image.includes(mimetype)) {
    return { category: 'image', limit: FILE_SIZE_LIMITS.image };
  }
  if (ALLOWED_MIME_TYPES.video.includes(mimetype)) {
    return { category: 'video', limit: FILE_SIZE_LIMITS.video };
  }
  return null;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`);
    },
  }),
  limits: { fileSize: FILE_SIZE_LIMITS.image }, // 50KB for images
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.image.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP images are allowed.`), false);
    }
  },
});

// ── POST /api/upload  (authenticated users) — Upload a single image and return its public URL
router.post('/', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50KB for images.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Validate file type and size based on category
    const fileInfo = getFileCategoryAndLimit(req.file.mimetype);
    if (!fileInfo) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP images or MP4, WebM, MOV, AVI videos are allowed.' });
    }

    // Check file size against category-specific limit
    if (req.file.size > fileInfo.limit) {
      const sizeMB = Math.round(fileInfo.limit / (1024 * 1024) * 10) / 10;
      const sizeKB = Math.round(fileInfo.limit / 1024);
      const maxSize = sizeMB > 1 ? `${sizeMB}MB` : `${sizeKB}KB`;
      return res.status(400).json({ 
        error: `${fileInfo.category.charAt(0).toUpperCase() + fileInfo.category.slice(1)} file too large. Maximum size is ${maxSize}.` 
      });
    }

    const ext = path.extname(req.file.originalname) || (fileInfo.category === 'video' ? '.mp4' : '.jpg');
    const folder = fileInfo.category === 'video' ? 'videos' : 'properties';
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

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
    res.json({ url: publicUrl, type: fileInfo.category });
  } catch (err) {
    console.error('POST /upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  } finally {
    if (req.file?.path) {
      fsPromises.unlink(req.file.path).catch(() => {});
    }
  }
});

export default router;
