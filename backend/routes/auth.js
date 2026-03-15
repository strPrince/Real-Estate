import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_DAYS_RAW = parseInt(process.env.JWT_REFRESH_DAYS || '7', 10);
const REFRESH_DAYS = Number.isFinite(REFRESH_DAYS_RAW) ? REFRESH_DAYS_RAW : 7;
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || `${REFRESH_DAYS}d`;
const REFRESH_COOKIE = 'refresh_token';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const buildUser = (doc) => {
  const data = doc.data() || {};
  const name = data.name || data.displayName || '';
  return {
    id: doc.id,
    uid: doc.id,
    email: data.email || '',
    name,
    displayName: name,
    role: data.role || 'user',
  };
};

const signAccessToken = (user, tokenVersion) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
      tokenVersion,
      type: 'access',
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );

const signRefreshToken = (user, tokenVersion) =>
  jwt.sign(
    {
      sub: user.id,
      tokenVersion,
      type: 'refresh',
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL }
  );

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const signupLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signup attempts. Please try again later.' },
});

const findUserByEmail = async (email) => {
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0];
};

const issueTokens = async (userDoc, res) => {
  const data = userDoc.data() || {};
  const tokenVersion = data.tokenVersion || 0;
  const user = buildUser(userDoc);
  const accessToken = signAccessToken(user, tokenVersion);
  const refreshToken = signRefreshToken(user, tokenVersion);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await db.collection('users').doc(user.id).update({
    refreshTokenHash,
    lastLoginAt: new Date().toISOString(),
  });

  setRefreshCookie(res, refreshToken);
  return { accessToken, user };
};

router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const ref = db.collection('users').doc();
    await ref.set({
      email,
      name,
      displayName: name,
      passwordHash,
      role: 'user',
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });

    const userDoc = await ref.get();
    const payload = await issueTokens(userDoc, res);
    res.status(201).json(payload);
  } catch (err) {
    console.error('POST /auth/signup error:', err);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const data = userDoc.data() || {};
    const ok = await bcrypt.compare(password, data.passwordHash || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = await issueTokens(userDoc, res);
    res.json(payload);
  } catch (err) {
    console.error('POST /auth/login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized - missing refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Unauthorized - invalid refresh token' });
    }

    const userDoc = await db.collection('users').doc(payload.sub).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Unauthorized - user not found' });
    }

    const data = userDoc.data() || {};
    const tokenVersion = data.tokenVersion || 0;
    if ((payload.tokenVersion || 0) !== tokenVersion) {
      return res.status(401).json({ error: 'Unauthorized - token revoked' });
    }

    const storedHash = data.refreshTokenHash || '';
    const valid = storedHash ? await bcrypt.compare(refreshToken, storedHash) : false;
    if (!valid) {
      await db.collection('users').doc(userDoc.id).update({
        tokenVersion: tokenVersion + 1,
        refreshTokenHash: null,
      });
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Unauthorized - token reuse detected' });
    }

    const user = buildUser(userDoc);
    const accessToken = signAccessToken(user, tokenVersion);
    const nextRefreshToken = signRefreshToken(user, tokenVersion);
    const refreshTokenHash = await bcrypt.hash(nextRefreshToken, 10);

    await db.collection('users').doc(userDoc.id).update({ refreshTokenHash });
    setRefreshCookie(res, nextRefreshToken);

    res.json({ accessToken, user });
  } catch (err) {
    clearRefreshCookie(res);
    res.status(401).json({ error: 'Unauthorized - invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        await db.collection('users').doc(payload.sub).update({ refreshTokenHash: null });
      } catch {
        // Ignore token errors on logout.
      }
    }
  } catch (err) {
    console.error('POST /auth/logout error:', err);
  } finally {
    clearRefreshCookie(res);
    res.json({ ok: true });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const now = new Date().toISOString();
    const ref = db.collection('users').doc(req.user.id);
    await ref.update({ name, displayName: name, updatedAt: now });
    const doc = await ref.get();
    res.json({ user: buildUser(doc) });
  } catch (err) {
    console.error('PUT /auth/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const oldPassword = String(req.body?.oldPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const ref = db.collection('users').doc(req.user.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const data = doc.data() || {};
    const ok = await bcrypt.compare(oldPassword, data.passwordHash || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const tokenVersion = (data.tokenVersion || 0) + 1;
    const user = buildUser(doc);
    const accessToken = signAccessToken(user, tokenVersion);
    const refreshToken = signRefreshToken(user, tokenVersion);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await ref.update({
      passwordHash,
      tokenVersion,
      refreshTokenHash,
      passwordUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user });
  } catch (err) {
    console.error('POST /auth/change-password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
