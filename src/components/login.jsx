const login = async () => {
    if (!username.trim() || !password.trim()) { showError('Please enter both username and password'); return; }
    setLoading(true);
    try {
      const res = await clientPOS.post('/api/auth/token', { username, password }, { withCredentials: true, headers: { 'Accept': 'application/json' } });
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }
      if (res.data.user.branch?.id) await fetchInventory(res.data.user.branch.id);
      else showError('Login successful, but no branch ID found for user. Please re-login or contact admin.');
    } catch (err) {
      const errorMsg = err.response
        ? `Login failed: ${err.response.data?.detail || 'Invalid credentials'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

export default function loginWindow(){

}