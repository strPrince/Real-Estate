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
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const BRAND_NAME = 'Property Master';
const BRAND_LOGO_CID = 'brandlogo';
const BRAND_LOGO_PATH = fileURLToPath(new URL('../../frontend/src/property-master.png', import.meta.url));

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

const buildEmailLayout = ({ title, previewText, bodyHtml, footerHtml }) => `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Sofia Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#222222;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${escapeHtml(previewText || '')}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5; padding:0; margin:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:linear-gradient(100deg, #ff7a00 0%, #ffb84d 55%, #ffd9b0 100%); padding:32px 24px; text-align:center;">
                <img src="cid:${BRAND_LOGO_CID}" alt="${BRAND_NAME}" width="120" style="display:block; margin:0 auto 12px; background-color:#0f172a; padding:10px; border-radius:8px;" />
                <div style="color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.01em;">${BRAND_NAME}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px; font-size:16px; line-height:1.6; color:#222222;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background-color:#fffaf5; padding:20px 24px; text-align:center; border-top:1px solid #ece7df; font-size:13px; color:#6b6b6b;">
                <div>Copyright ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</div>
                ${footerHtml ? `<div style="margin-top:8px;">${footerHtml}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);
  const safePort = Number.isFinite(port) ? port : 587;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: safePort,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
  });
};

const buildMailOptions = ({ to, subject, html }) => ({
  from: `"${BRAND_NAME}" <${process.env.EMAIL_USER || 'noreply@propertymaster.com'}>`,
  to,
  subject,
  html,
  attachments: [{ filename: 'property-master.png', path: BRAND_LOGO_PATH, cid: BRAND_LOGO_CID }],
});

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
    const otp = generateOTP();
    const otpExpires = Date.now() + 600000; // 10 minutes
    const now = new Date().toISOString();
    const ref = db.collection('users').doc();
    
    await ref.set({
      email,
      name,
      displayName: name,
      passwordHash,
      role: 'user',
      isVerified: false,
      otp,
      otpExpires,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Send OTP Email
    const transporter = createTransporter();
    const safeName = escapeHtml(name || 'there');
    const otpEmailHtml = buildEmailLayout({
      title: 'Verify Your Email',
      previewText: `Your verification code is ${otp}`,
      bodyHtml: `
        <h2 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#222222;">Verify Your Email</h2>
        <p style="margin:0 0 12px;">Hello ${safeName},</p>
        <p style="margin:0 0 16px;">Thank you for signing up with ${BRAND_NAME}. Please use the following 6-digit code to verify your email address:</p>
        <div style="background:#fdf2e9; padding:18px; text-align:center; border-radius:8px; margin:20px 0;">
          <span style="font-size:28px; font-weight:700; letter-spacing:8px; color:#ff7a00; display:inline-block;">${otp}</span>
        </div>
        <p style="margin:0 0 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <p style="margin:0;">Best regards,<br>The ${BRAND_NAME} Team</p>
      `,
    });

    const mailOptions = buildMailOptions({
      to: email,
      subject: `Verify Your Email - ${BRAND_NAME}`,
      html: otpEmailHtml,
    });

    transporter.sendMail(mailOptions).catch(err => console.error('OTP Email Error:', err));

    res.status(201).json({ 
      requiresVerification: true, 
      email,
      message: 'OTP sent to your email. Please verify to continue.' 
    });
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
    if (data.isVerified === false) {
      return res.status(403).json({ 
        requiresVerification: true, 
        email, 
        error: 'Please verify your email to log in.' 
      });
    }

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
    const transporter = createTransporter();
    const safeEmail = escapeHtml(email);
    const safeResetUrl = escapeHtml(resetUrl);
    const emailHtml = buildEmailLayout({
      title: 'Reset Your Password',
      previewText: 'Use this link to reset your password.',
      bodyHtml: `
        <h2 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#222222;">Password Reset Request</h2>
        <p style="margin:0 0 12px;">Hello,</p>
        <p style="margin:0 0 20px;">We received a request to reset the password for the ${BRAND_NAME} account associated with ${safeEmail}. If you made this request, please click the button below to choose a new password.</p>
        <div style="text-align:center; margin:24px 0;">
          <a href="${safeResetUrl}" style="display:inline-block; background-color:#ff7a00; color:#ffffff; padding:12px 24px; border-radius:8px; font-size:16px; font-weight:600; text-decoration:none;">Reset Password</a>
        </div>
        <p style="margin:0 0 12px;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
        <p style="margin:0;">Thanks,<br>The ${BRAND_NAME} Team</p>
      `,
      footerHtml: `If you are having trouble clicking the button, copy and paste this URL into your web browser:<br><a href="${safeResetUrl}" style="color:#0077b6; text-decoration:none; word-break:break-all;">${safeResetUrl}</a>`,
    });

    const mailOptions = buildMailOptions({
      to: email,
      subject: `Reset Your Password - ${BRAND_NAME}`,
      html: emailHtml,
    });

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

router.post('/verify-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const data = userDoc.data() || {};
    if (data.otp !== otp || !data.otpExpires || Date.now() > data.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await db.collection('users').doc(userDoc.id).update({
      isVerified: true,
      otp: null,
      otpExpires: null,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await db.collection('users').doc(userDoc.id).get();
    const payload = await issueTokens(updatedDoc, res);
    res.json(payload);
  } catch (err) {
    console.error('POST /auth/verify-otp error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = userDoc.data() || {};
    if (data.isVerified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 600000; // 10 minutes

    await db.collection('users').doc(userDoc.id).update({
      otp,
      otpExpires,
      updatedAt: new Date().toISOString()
    });

    // Reuse transporter setup
    const transporter = createTransporter();
    const safeName = escapeHtml(data.name || 'there');
    const otpEmailHtml = buildEmailLayout({
      title: 'Your New Verification Code',
      previewText: `Your new verification code is ${otp}`,
      bodyHtml: `
        <h2 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#222222;">Your New Verification Code</h2>
        <p style="margin:0 0 12px;">Hello ${safeName},</p>
        <p style="margin:0 0 16px;">You requested a new verification code. Please use the following 6-digit code to verify your email address:</p>
        <div style="background:#fdf2e9; padding:18px; text-align:center; border-radius:8px; margin:20px 0;">
          <span style="font-size:28px; font-weight:700; letter-spacing:8px; color:#ff7a00; display:inline-block;">${otp}</span>
        </div>
        <p style="margin:0 0 12px;">This code will expire in 10 minutes.</p>
        <p style="margin:0;">Best regards,<br>The ${BRAND_NAME} Team</p>
      `,
    });

    const mailOptions = buildMailOptions({
      to: email,
      subject: `New Verification Code - ${BRAND_NAME}`,
      html: otpEmailHtml,
    });

    await transporter.sendMail(mailOptions);
    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    console.error('POST /auth/resend-otp error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

export default router;
