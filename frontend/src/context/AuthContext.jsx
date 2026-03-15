import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const authFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`/api/auth${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
};

const normalizeUser = (user) => {
  if (!user) return null;
  const name = user.displayName || user.name || '';
  return {
    ...user,
    id: user.id || user.uid,
    uid: user.uid || user.id,
    name,
    displayName: name,
  };
};

const isTokenFresh = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    if (!payload?.exp) return true;
    const expiresAt = payload.exp * 1000;
    return Date.now() < expiresAt - 30_000;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const bootstrap = async () => {
      try {
        const data = await authFetch('/refresh', { method: 'POST' });
        if (!alive) return;
        setAccessToken(data.accessToken || null);
        setCurrentUser(normalizeUser(data.user));
      } catch {
        if (!alive) return;
        setAccessToken(null);
        setCurrentUser(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  async function login(email, password) {
    const data = await authFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken || null);
    setCurrentUser(normalizeUser(data.user));
    return data;
  }

  async function signup(email, password, name) {
    const data = await authFetch('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setAccessToken(data.accessToken || null);
    setCurrentUser(normalizeUser(data.user));
    return data;
  }

  async function logout() {
    try {
      await authFetch('/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      setCurrentUser(null);
    }
  }

  async function changePassword(oldPassword, newPassword) {
    if (!accessToken) throw new Error('Not authenticated');
    const data = await authFetch('/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    setAccessToken(data.accessToken || null);
    setCurrentUser(normalizeUser(data.user));
    return data;
  }

  async function updateProfile(name) {
    if (!accessToken) throw new Error('Not authenticated');
    const data = await authFetch('/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ name }),
    });
    setCurrentUser(normalizeUser(data.user));
    return data;
  }

  async function getToken() {
    if (accessToken && isTokenFresh(accessToken)) return accessToken;
    try {
      const data = await authFetch('/refresh', { method: 'POST' });
      setAccessToken(data.accessToken || null);
      setCurrentUser(normalizeUser(data.user));
      return data.accessToken || null;
    } catch {
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, login, signup, logout, changePassword, updateProfile, getToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
