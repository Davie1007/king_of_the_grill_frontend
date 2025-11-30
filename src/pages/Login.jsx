import { useState } from 'react';
import AppleLoginForm from '../components/AppleLoginForm';
import { loginUser } from '../services/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await loginUser(username, password);
      window.location.hash = '/owner_dashboard';
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppleLoginForm
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
}
