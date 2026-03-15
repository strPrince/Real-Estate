import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - missing token' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Unauthorized - invalid token type' });
    }
    const userId = payload.userId || payload.uid || payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - missing user id' });
    }
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return res.status(401).json({ error: 'Unauthorized - user not found' });
    }
    const data = doc.data() || {};
    const tokenVersion = data.tokenVersion || 0;
    if ((payload.tokenVersion || 0) !== tokenVersion) {
      return res.status(401).json({ error: 'Unauthorized - token revoked' });
    }
    const name = data.name || data.displayName || '';
    req.user = {
      id: doc.id,
      uid: doc.id,
      email: data.email || '',
      name,
      displayName: name,
      role: data.role || 'user',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized - invalid token' });
  }
}

export function requireRole(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const role = req.user?.role || 'user';
    if (!allowed.length || allowed.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden - insufficient role' });
  };
}
