// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // iOS blue
      light: '#5AC8FA',
      dark: '#0047AB',
    },
    secondary: {
      main: '#34C759', // green
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FF9500',
    },
    background: {
      default: '#f8f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h6: { fontWeight: 600 },
    h5: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        },
      },
    },
  },
});

export default theme;
// MUI theme definition
