import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

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

router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      // Don't reveal if user exists or not, just return success
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    }

    const { randomBytes } = await import('crypto');
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    await db.collection('users').doc(userDoc.id).update({
      resetTokenHash,
      resetTokenExpires,
    });

    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; color: #222222; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background: linear-gradient(100deg, #ff7a00 0%, #ffb84d 55%, #ffd9b0 100%); padding: 32px 24px; text-align: center; }
          .header .logo { width: 80px; height: auto; margin-bottom: 16px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
          .content { padding: 40px 32px; text-align: left; }
          .content h2 { margin-top: 0; font-size: 22px; font-weight: 600; color: #222222; }
          .content p { font-size: 16px; line-height: 1.6; color: #6b6b6b; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 36px 0; }
          .btn { display: inline-block; background-color: #ff7a00; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px 0 rgba(255,122,0,0.35); }
          .btn:hover { background-color: #cc5c00; }
          .footer { background-color: #fffaf5; padding: 24px; text-align: center; border-top: 1px solid #ece7df; }
          .footer p { margin: 0; font-size: 14px; color: #6b6b6b; }
          .footer a { color: #0077b6; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:brandlogo" alt="Property Master Logo" class="logo">
            <h1>Property Master</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for the Property Master account associated with ${email}. If you made this request, please click the button below to choose a new password.</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            
            <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
            <p>Thanks,<br>The Property Master Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Property Master. All rights reserved.</p>
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; margin-top: 8px;"><a href="${resetUrl}">${resetUrl}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const logoPath = fileURLToPath(new URL('../../frontend/src/property-master.png', import.meta.url));

    const mailOptions = {
      from: '"Property Master" <' + (process.env.EMAIL_USER || 'noreply@propertymaster.com') + '>',
      to: email,
      subject: 'Reset Your Password - Property Master',
      html: emailHtml,
      attachments: [
        {
          filename: 'property-master.png',
          path: logoPath,
          cid: 'brandlogo'
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
  } catch (err) {
    console.error('POST /auth/forgot-password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const token = String(req.body?.token || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const data = userDoc.data() || {};
    
    if (!data.resetTokenHash || !data.resetTokenExpires || Date.now() > data.resetTokenExpires) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const isValidToken = await bcrypt.compare(token, data.resetTokenHash);
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const tokenVersion = (data.tokenVersion || 0) + 1; // Revoke old sessions

    await db.collection('users').doc(userDoc.id).update({
      passwordHash,
      tokenVersion,
      refreshTokenHash: null,
      resetTokenHash: null,
      resetTokenExpires: null,
      passwordUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) {
    console.error('POST /auth/reset-password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
