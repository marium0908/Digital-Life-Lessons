/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import GoogleAuthModal from '../components/GoogleAuthModal';


const AuthContext = createContext(undefined);

// Safe localStorage helpers to handle sandboxed iframe environments where access might be blocked
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("Storage access denied:", e);
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage access denied:", e);
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Storage access denied:", e);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const googleResolveRef = useRef(null);

  // Read stored session on load
  useEffect(() => {
    const storedUser = safeGetItem('dll_user');
    const storedToken = safeGetItem('dll_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        safeRemoveItem('dll_user');
        safeRemoveItem('dll_token');
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        safeSetItem('dll_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Error fetching current profile", err);
    }
  };

  const register = async (name, email, password, photoURL) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, photoURL })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      safeSetItem('dll_user', JSON.stringify(data.user));
      safeSetItem('dll_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'An error occurred during registration' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      safeSetItem('dll_user', JSON.stringify(data.user));
      safeSetItem('dll_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    return new Promise((resolve) => {
      googleResolveRef.current = resolve;
      setGoogleModalOpen(true);
    });
  };

  const handleGoogleAccountSelect = async (selectedAccount) => {
    setGoogleModalOpen(false);
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedAccount.name,
          email: selectedAccount.email,
          photoURL: selectedAccount.photoURL
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (googleResolveRef.current) {
          googleResolveRef.current({ success: false, error: data.error || 'Google login failed' });
        }
        return;
      }
      
      setUser(data.user);
      setToken(data.token);
      safeSetItem('dll_user', JSON.stringify(data.user));
      safeSetItem('dll_token', data.token);
      if (googleResolveRef.current) {
        googleResolveRef.current({ success: true });
      }
    } catch (err) {
      if (googleResolveRef.current) {
        googleResolveRef.current({ success: false, error: err.message || 'Google Auth Error' });
      }
    } finally {
      setLoading(false);
      googleResolveRef.current = null;
    }
  };

  const handleGoogleAccountCancel = () => {
    setGoogleModalOpen(false);
    if (googleResolveRef.current) {
      googleResolveRef.current({ success: false, error: 'Authentication cancelled' });
    }
    googleResolveRef.current = null;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeRemoveItem('dll_user');
    safeRemoveItem('dll_token');
  };

  const updateProfile = async (newName, newPhoto) => {
    if (!token) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, photoURL: newPhoto })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Profile update failed' };
      }
      setUser(data.user);
      safeSetItem('dll_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const setIsPremiumInState = (isPremium) => {
    if (user) {
      const updated = { ...user, isPremium };
      setUser(updated);
      safeSetItem('dll_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, googleLogin, logout, updateProfile, fetchProfile, setIsPremiumInState }}>
      {children}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={handleGoogleAccountCancel}
        onSelect={handleGoogleAccountSelect}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
