// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  Divider,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardLayout({
  title = 'Dashboard',
  drawerContent,
  children,
  onLogout,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* --- Top Bar --- */}
      <AppBar
        position="fixed"
        elevation={0}
        color="primary"
        sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,122,255,0.9)' }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {title}
          </Typography>
          {onLogout && (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{ fontWeight: 500 }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* --- Sidebar Drawer --- */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ mt: 2 }}>{drawerContent}</Box>
        <Divider sx={{ my: 2 }} />
      </Drawer>

      {/* --- Main Content --- */}
      <Toolbar /> {/* Spacer below fixed AppBar */}
      <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        {children}
      </Box>

      {/* --- Footer --- */}
      <Divider />
      <Box sx={{ textAlign: 'center', py: 1, color: 'text.secondary', fontSize: 12 }}>
        &copy; {new Date().getFullYear()} Your Company — All rights reserved.
      </Box>
    </Box>
  );
}
// Shared dashboard layout with AppBar & Drawer
