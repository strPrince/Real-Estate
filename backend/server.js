import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import os from 'os';
import propertiesRouter from './routes/properties.js';
import uploadRouter from './routes/upload.js';
import inquiriesRouter from './routes/inquiries.js';
import queriesRouter from './routes/queries.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads (disk-backed to avoid memory spikes)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Max 10 files
  },
});

const isProd = process.env.NODE_ENV === 'production';
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProd && corsOrigins.length === 0) {
  console.error('CORS_ORIGIN must be set in production.');
  process.exit(1);
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser or same-origin
    if (!corsOrigins.length) return cb(null, true); // dev fallback
    if (corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Middleware for handling multipart/form-data for user property posts
app.use('/api/properties/user-post', upload.array('images', 10));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real Estate API is running' });
});
// Health check alias (non-API)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real Estate API is running' });
});

// Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
