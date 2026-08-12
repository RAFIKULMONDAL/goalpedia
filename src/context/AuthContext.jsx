import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  getUserDoc,
} from '../firebase/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [userDoc,   setUserDoc]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [authOpen,  setAuthOpen]  = useState(false);
  const [authTab,   setAuthTab]   = useState('login');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Attach displayName safely — Firebase user uses displayName not name
        setUser(firebaseUser);
        try {
          const doc = await getUserDoc(firebaseUser.uid);
          setUserDoc(doc);
        } catch (e) {
          console.warn('Could not load user doc:', e.message);
          setUserDoc(null);
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const openAuth  = (tab = 'login') => { setAuthTab(tab); setAuthError(''); setAuthOpen(true); };
  const closeAuth = () => { setAuthOpen(false); setAuthError(''); };

  const login = async (email, password) => {
    try {
      setAuthError('');
      await loginUser(email, password);
      setAuthOpen(false);
      return true;
    } catch (err) {
      const msgs = {
        'auth/user-not-found':     'No account found with this email.',
        'auth/wrong-password':     'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/invalid-email':      'Enter a valid email address.',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
      };
      setAuthError(msgs[err.code] || 'Login failed. Please try again.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      setAuthError('');
      if (!name.trim())        { setAuthError('Name is required.'); return false; }
      if (password.length < 6) { setAuthError('Password must be at least 6 characters.'); return false; }
      await registerUser(name, email, password);
      setAuthOpen(false);
      return true;
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':        'Enter a valid email address.',
        'auth/weak-password':        'Password must be at least 6 characters.',
      };
      setAuthError(msgs[err.code] || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setUserDoc(null);
  };

  return (
    <AuthContext.Provider value={{
      user, userDoc, loading,
      authOpen, authTab, authError,
      setAuthTab, setAuthError,
      openAuth, closeAuth,
      login, register, logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
