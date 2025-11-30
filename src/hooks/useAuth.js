import { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { client } from '../utils/api';

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOffline = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOffline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOffline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const onLogin = async () => {
    if (isOffline) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'Owner') {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setError('');
          return;
        }
      }
      setError('Offline: Please log in when online first');
      return;
    }
    setLoading(true);
    try {
      const res = await client.post(
        '/api/auth/token',
        { username, password },
        { withCredentials: true, headers: { Accept: 'application/json' } }
      );
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }
      setError('');
    } catch (err) {
      console.error('Login error:', err.response || err.message);
      setError(err.response?.data?.detail || 'Invalid credentials or CSRF error');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setError('');
    setUsername('');
    setPassword('');
    queryClient.clear();
  };

  return { isAuthenticated, user, username, setUsername, password, setPassword, onLogin, logout, loading, error, isOffline };
}