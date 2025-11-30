import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, CircularProgress, Alert, Stack, Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { clientPOS } from '../components/clientPOS'; // adjust path

export default function ForgotPassword({ variant = 'butchery' }) {

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const submit = async () => {
    setError(null);
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await clientPOS.post('/forgot-password', { email }, { headers: { Accept: 'application/json' } });
      setSnack({ open: true, msg: 'Reset link sent — check your email', sev: 'success' });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to request reset link';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f5f5f7,#ffffff)' }}>
      <Container maxWidth="xs" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          <Paper elevation={10} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 6, textAlign: 'center', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.img src="data:image/png;base64,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" alt="logo" style={{ width: 80, height: 80, marginBottom: 16 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Forgot Password?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Enter your account email and we’ll send password reset instructions.</Typography>

            <Stack spacing={2}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
                error={Boolean(error)}
                helperText={error || ''}
                InputProps={{ sx: { borderRadius: 6 } }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={submit}
                disabled={loading}
                sx={{ py: 1.2, borderRadius: 6, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
              </Button>

              <Button
                onClick={() => window.history.back()}
                variant="text"
                sx={{ textTransform: 'none' }}
              >
                Back to sign in
              </Button>

            </Stack>
          </Paper>
        </motion.div>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
