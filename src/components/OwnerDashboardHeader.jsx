import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor:'#fff', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
      <Toolbar sx={{ display:'flex', justifyContent:'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ color:'#007AFF', fontWeight:800 }}>KOTG — Owner</Typography>
          <Typography variant="caption" sx={{ color:'#66afff' }}>Fast • Smooth • Delightful</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
