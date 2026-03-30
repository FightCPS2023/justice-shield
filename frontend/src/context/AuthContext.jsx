/**
 * CPS Punisher - Auth Context
 * Authentication state management and API helper
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// API Helper
export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('cps_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },
  
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    handleOAuthCallback();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('cps_token');
    if (token) {
      try {
        const userData = await api.get('/api/auth/me');
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('cps_token');
      }
    }
    setLoading(false);
  };

  const handleOAuthCallback = async () => {
    const hash = window.location.hash;
    if (hash && hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1]?.split('&')[0];
      if (sessionId) {
        try {
          const response = await api.post('/api/auth/google/session', { session_id: sessionId });
          if (response.access_token) {
            localStorage.setItem('cps_token', response.access_token);
            setUser(response);
            window.history.replaceState(null, '', window.location.pathname);
            toast.success('Welcome back!');
          }
        } catch (error) {
          toast.error('Google login failed');
        }
      }
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('cps_token', data.access_token);
    setUser(data);
    return data;
  };

  const signup = async (name, email, password, policyData = {}) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, ...policyData })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
      throw new Error(error.detail || 'Signup failed');
    }
    const data = await response.json();
    localStorage.setItem('cps_token', data.access_token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cps_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
    api,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
