import { createTheme } from '@mui/material/styles';

export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#B71C1C', light: '#E53935', dark: '#7F0000', contrastText: '#fff' },
    secondary: { main: '#1C1C1C', light: '#333', dark: '#000', contrastText: '#F5F5F5' },
    background: { default: '#0E0E0E', paper: 'rgba(20,20,20,0.85)' },
    text: { primary: '#F5F5F5', secondary: '#BDBDBD' },
    gold: { main: '#FFD700' },
    error: { main: '#D32F2F' },
    success: { main: '#43A047' },
  },

  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700, color: '#fff' },
    h5: { fontWeight: 600, color: '#fff' },
    h6: { fontWeight: 500, color: '#FFD700' },
    body1: { color: '#E0E0E0', lineHeight: 1.6 },
    body2: { color: '#BDBDBD', lineHeight: 1.6 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(circle at top left, rgba(183,28,28,0.15), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255,215,0,0.08), transparent 40%),
            linear-gradient(180deg, #0B0B0B, #161616)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          minHeight: '100vh',
          color: '#fff',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #7F0000 0%, #B71C1C 40%, #FFD700 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,215,0,0.2)',
          backdropFilter: 'blur(10px)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(145deg, rgba(30,30,30,0.95), rgba(45,45,45,0.8))',
          border: '1px solid rgba(255,215,0,0.12)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.35s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            borderColor: 'rgba(255,215,0,0.3)',
            boxShadow: '0 20px 40px rgba(255,215,0,0.25)',
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 22px',
          textTransform: 'none',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #B71C1C, #E53935)',
          boxShadow: '0 0 12px rgba(183,28,28,0.6)',
          '&:hover': {
            background: 'linear-gradient(135deg, #C62828, #FF6659)',
            transform: 'translateY(-2px)',
            boxShadow: '0 0 20px rgba(255,215,0,0.3)',
          },
        },
        outlinedPrimary: {
          borderColor: '#FFD700',
          color: '#FFD700',
          '&:hover': { background: 'rgba(255,215,0,0.08)' },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 22,
          background: 'linear-gradient(145deg, rgba(30,30,30,0.95), rgba(50,50,50,0.9))',
          boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,215,0,0.2)',
          backdropFilter: 'blur(15px)',
          color: '#fff',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            '& fieldset': { borderColor: 'rgba(255,215,0,0.2)' },
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': {
              borderColor: '#FFD700',
              boxShadow: '0 0 10px rgba(255,215,0,0.3)',
            },
          },
          '& .MuiInputLabel-root': { color: '#FFD700' },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg, rgba(20,20,20,0.95), rgba(40,40,40,0.9))',
          color: '#fff',
          borderLeft: '1px solid rgba(255,215,0,0.2)',
          boxShadow: '0 0 25px rgba(255,215,0,0.15)',
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          background: '#FFD700',
          color: '#B71C1C',
          fontWeight: 700,
          border: '2px solid #7F0000',
          boxShadow: '0 0 8px rgba(255,215,0,0.4)',
        },
      },
    },
  },
});

export const highContrastTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
    primary: { main: '#A00000' },
    text: { primary: '#000', secondary: '#333' },
    background: { default: '#fff', paper: '#fafafa' },
  },
});

export const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};
