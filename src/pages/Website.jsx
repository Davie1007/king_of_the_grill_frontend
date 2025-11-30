import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Snackbar,
  IconButton,
  Container,
  useTheme,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { ShoppingCart, Room, Star, Brightness4, Brightness7 } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function Website() {
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(null);
  const theme = useTheme();

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#90caf9' : '#1976d2' },
      background: {
        default: darkMode ? '#0f1115' : '#f5f7fa',
        paper: darkMode ? '#181b20' : '#fff',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h4: { fontWeight: 600 },
      body1: { color: darkMode ? '#dcdcdc' : '#333' }
    }
  });

  const types = ['Butchery', 'Gas', 'Drinks'];

  useEffect(() => {
    fetch(`${API_BASE}/branches`)
      .then(res => res.json())
      .then(data => setBranches(data));

    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn('Location unavailable')
    );
  }, []);

  const handleTypeChange = (e, newVal) => {
    setTab(newVal);
    if (!branches.length) return;
    const selectedType = types[newVal].toLowerCase();

    const nearby = branches.filter(b => {
      if (!location) return true;
      const dist = getDistance(location.lat, location.lng, b.latitude, b.longitude);
      return dist <= b.service_radius && b.type.toLowerCase() === selectedType;
    });

    setBranches(nearby);
    if (nearby[0]) fetchInventory(nearby[0].id);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchInventory = async (branchId) => {
    const res = await fetch(`${API_BASE}/branches/${branchId}/inventory`);
    const data = await res.json();
    setInventory(data);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(180deg,#0d1117,#1a1f27)' : 'linear-gradient(180deg,#ffffff,#e8ebf1)' }}>
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(15px)', background: darkMode ? 'rgba(20,20,25,0.7)' : 'rgba(255,255,255,0.6)' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1, color: theme.palette.primary.main }}>
              FuturistShop
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton color="primary"><ShoppingCart /></IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 5 }}>
          <Paper elevation={4} sx={{ borderRadius: 5, overflow: 'hidden', mb: 5 }}>
            <Tabs
              value={tab}
              onChange={handleTypeChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ backdropFilter: 'blur(20px)', background: darkMode ? 'rgba(40,40,45,0.6)' : 'rgba(255,255,255,0.8)' }}
            >
              {types.map((t) => <Tab key={t} label={t} sx={{ fontWeight: 600, fontSize: '1rem' }} />)}
            </Tabs>
          </Paper>

          <Grid container spacing={4}>
            {inventory.map((item, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card elevation={6} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative', background: darkMode ? '#1b1f27' : '#fff' }}>
                    {item.image && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={`${API_BASE.replace('/api', '')}/storage/${item.image}`}
                        alt={item.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.unit}</Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${item.price}</Typography>
                      <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: 3 }} onClick={() => setSnackbar(`${item.name} added to cart`)}>Add to Cart</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Snackbar
          open={!!snackbar}
          autoHideDuration={2500}
          onClose={() => setSnackbar('')}
          message={snackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        <Box sx={{ textAlign: 'center', py: 4, opacity: 0.8 }}>
          <Typography variant="body2">© {new Date().getFullYear()} FuturistShop — Crafted with ❤️</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}