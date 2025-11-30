import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL, clientPOS } from "../components/clientPOS";

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    role: '',
    branch: '',
    photo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await clientPOS.get('/api/user');
        console.log(response)
        setUser({
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
          branch: response.data.branch?.name || 'N/A',
          photo: response.data.photo
            ? `${API_BASE_URL}/storage/${response.data.photo}`
            : 'https://via.placeholder.com/150',
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle photo upload
  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setPhotoLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await clientPOS.post('/api/user/update-photo', formData);
      setUser((prev) => ({ ...prev, photo: `${API_BASE_URL}/storage/${response.data.photo}` }));
      setSuccess('Photo updated successfully');
    } catch (err) {
      setError('Failed to update photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    try {
      await clientPOS.put(
        '/api/user',
        { username: user.username, email: user.email },
      );
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Trigger file input click
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
         <Button
            onClick={() => window.history.back()}
            variant="text"
            sx={{ textTransform: 'none' }}
            >
            Back
        </Button>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#007AFF' }}>
          Your Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handlePhotoClick}
          >
            <Avatar
              src={user.photo}
              alt={user.username}
              sx={{ width: 100, height: 100, mb: 2, border: '2px solid #ffffff' }}
            />
            {photoLoading && (
              <CircularProgress
                size={24}
                sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }}
              />
            )}
          </motion.div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <Button
            variant="outlined"
            onClick={handlePhotoClick}
            sx={{ mb: 2 }}
            disabled={photoLoading}
          >
            Change Photo
          </Button>
        </Box>

        <TextField
          label="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Role"
          value={user.role}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Branch"
          value={user.branch}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
        />

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpdateProfile}
            sx={{ bgcolor: '#007AFF', color: '#fff', fontWeight: 600 }}
            fullWidth
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/forgot-password')}
            sx={{ color: '#007AFF', borderColor: '#007AFF' }}
            fullWidth
          >
            Change Password
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;