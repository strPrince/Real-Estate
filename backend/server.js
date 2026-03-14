import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import propertiesRouter from './routes/properties.js';
import uploadRouter from './routes/upload.js';
import inquiriesRouter from './routes/inquiries.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  }
});

app.use(cors());
app.use(express.json());

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
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
