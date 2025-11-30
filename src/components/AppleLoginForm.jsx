import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

const APP_CONFIGS = {
  gas: {
    logo: 'https://static.vecteezy.com/system/resources/thumbnails/005/495/191/small_2x/fire-flame-icon-in-a-shape-of-drop-oil-and-gas-industry-logo-design-concept-vector.jpg',
    title: 'Gas POS Login',
  },
  butchery: {
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbvzOLz-ptkXHMQ7cJ0gDFU88o2Mo9uAcLV4qWQuNvcUpRmWUbYWEcTj8&s',
    title: 'Butchery POS Login',
  },
  drinks: {
    logo: 'https://img.freepik.com/premium-vector/soft-drink-logo-vector-design_1277164-21072.jpg',
    title: 'Drinks POS Login',
  },
  owner_dashboard: {
    logo: 'data:image/png;base64,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',
    title: 'Owner Dashboard Login',
  },
};

const constantTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#000' },
    background: { default: '#f5f5f7' },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", sans-serif',
  },
});

export default function AppleLoginForm({
  username,
  password,
  setUsername,
  setPassword,
  onLogin,
  loading,
  error,
}) {
  const location = useLocation();
  const variant =
    location.pathname.includes('owner_dashboard')
      ? 'owner_dashboard'
      : location.pathname.includes('gas')
      ? 'gas'
      : location.pathname.includes('drinks')
      ? 'drinks'
      : 'butchery';
  const config = APP_CONFIGS[variant];

  return (
    <ThemeProvider theme={constantTheme}>
      <CssBaseline />
      {/* FULLSCREEN WRAPPER */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          m: 0,
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #e5e5e7, #ffffff)',
          overflow: 'auto',
        }}
      >
        <Container
          maxWidth="xs"
          disableGutters
          sx={{
            py: 6,
            px: 3,
            width: '100%',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Paper
              elevation={10}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 6,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
              }}
            >
              <motion.img
                src={config.logo}
                alt="Logo"
                style={{ width: 80, height: 80, marginBottom: 16 }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
              />
              <Typography variant="h5" fontWeight={700} mb={3}>
                {config.title}
              </Typography>
              <Stack spacing={2.4}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 6 } }}
                />
                <TextField
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 6 } }}
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onLogin}
                    disabled={loading}
                    fullWidth
                    sx={{
                      py: 1.4,
                      fontSize: '1rem',
                      borderRadius: 6,
                      textTransform: 'none',
                      background: 'linear-gradient(90deg,#000000,#555555)',
                      '&:hover': {
                        background: 'linear-gradient(90deg,#111111,#333333)',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 4 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Link>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

