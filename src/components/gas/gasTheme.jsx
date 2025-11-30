// src/components/gas/gasTheme.jsx
import { createTheme } from '@mui/material';

export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#40C4FF', // Neon blue accent
      light: '#6FE8FF',
      dark: '#0092C7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C4DFF', // Purple glow
      light: '#B388FF',
      dark: '#512DA8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0A0A', // Deep dark base
      paper: '#111111', // Slightly lighter for cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: 'rgba(255,255,255,0.08)',
    success: { main: '#4CAF50' },
    info: { main: '#40C4FF' },
    error: { main: '#FF5252' },
    warning: { main: '#FFB400' },
  },
  typography: {
    fontFamily: '"Inter","Poppins","Roboto","Helvetica","Arial",sans-serif',
    h3: { fontWeight: 700, fontSize: '2.8rem', color: '#FFFFFF' },
    h4: { fontWeight: 700, fontSize: '2.2rem', color: '#FFFFFF' },
    h5: { fontWeight: 600, fontSize: '1.6rem', color: '#FFFFFF' },
    h6: { fontWeight: 600, fontSize: '1.25rem', color: '#FFFFFF' },
    subtitle1: { fontWeight: 500, fontSize: '1rem', color: '#B0B0B0' },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: '#E0E0E0' },
    body2: { fontSize: '0.9rem', color: '#AAAAAA', lineHeight: 1.6 },
    button: {
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'none',
      color: '#FFFFFF',
    },
  },
  shape: { borderRadius: 12 },
  shadows: Array(25).fill('none'),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: "smooth",
        },
        body: {
          backgroundColor: "#0A0A0A",
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(64,196,255,0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(124,77,255,0.05) 0%, transparent 50%)`,
          color: "#FFFFFF",
          minHeight: "100vh",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch", // makes scroll buttery on iOS
          scrollBehavior: "smooth",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(17,17,17,0.85)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(17,17,17,1) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 32px rgba(64,196,255,0.15)',
            borderColor: 'rgba(64,196,255,0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'scale(1.03)',
          },
        },
        containedPrimary: {
          background:
            'linear-gradient(90deg, #40C4FF 0%, #0092C7 100%)',
          color: '#0A0A0A',
          '&:hover': {
            background:
              'linear-gradient(90deg, #6FE8FF 0%, #00B8FF 100%)',
            boxShadow: '0 0 15px rgba(64,196,255,0.4)',
          },
        },
        containedSecondary: {
          background:
            'linear-gradient(90deg, #7C4DFF 0%, #512DA8 100%)',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 0 15px rgba(124,77,255,0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: '#40C4FF' },
            '&.Mui-focused fieldset': {
              borderColor: '#40C4FF',
              borderWidth: 2,
            },
            '& input': { color: '#FFF' },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(17,17,17,0.95)',
          borderRadius: 18,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15,15,15,0.9)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        },
      },
    },
  },
});

export const highContrastTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    background: {
      default: '#000000',
      paper: '#0A0A0A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
});




