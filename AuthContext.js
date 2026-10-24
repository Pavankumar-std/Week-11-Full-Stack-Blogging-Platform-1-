import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const restoreSession = useCallback(async () => {
    try {
      const refreshed = await api.post('/auth/refresh');
      setAccessToken(refreshed.data.accessToken);
      setUser(refreshed.data.user);
    } catch (_) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = async (email, password) => {
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) { /* Clear local session either way. */ }
    setAccessToken(null);
    setUser(null);
  };

  const updateProfile = async (changes) => {
    const response = await api.patch('/auth/me', changes);
    setUser(response.data.user);
    return response.data.user;
  };

  const value = useMemo(() => ({
    user, loading, error, login, register, logout, updateProfile,
    clearError: () => setError(''),
    isAuthenticated: Boolean(user)
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
