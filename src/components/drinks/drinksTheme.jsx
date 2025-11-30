import { createTheme } from "@mui/material";

export const baseTheme = createTheme({
  palette: {
    primary: {
      main: "#00a3e0",       // Aqua blue
      light: "#66d1ff",      // Gentle shimmer
      dark: "#006494",       // Deep ocean
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00838f",
      light: "#4fb3bf",
      dark: "#005662",
    },
    background: {
      default: "linear-gradient(180deg, #f7fbff 0%, #e3f6fd 100%)",
      paper: "rgba(255,255,255,0.72)",
    },
    text: {
      primary: "#0d1b2a",
      secondary: "#5f6c7b",
    },
    success: { main: "#4caf50" },
    info: { main: "#00bcd4" },
    error: { main: "#e91e63" },
  },

  typography: {
    fontFamily: '"Poppins","Inter","Helvetica","Arial",sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em", color: "#0d1b2a" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em" },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    body2: { fontSize: "0.9rem", color: "#5f6c7b", lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: "none" },
  },

  shape: { borderRadius: 16 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(180deg, #f7fbff 0%, #e3f6fd 100%)",
          transition: "background 0.6s ease, filter 0.5s ease",
          // 🔵 Dynamically sync with scene color
          '--scene-color': 'rgba(0,163,224,1)',
          '--scene-color-rgb': '0,163,224',
          '--scene-shimmer': '0.5',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          background: `
            linear-gradient(
              145deg,
              rgba(var(--scene-color-rgb, 0,163,224), calc(0.04 + var(--scene-shimmer,0.4)*0.2)),
              rgba(255,255,255,0.8)
            )
          `,
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
          transition: "all 0.4s ease",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: "10px 24px",
          background: `
            linear-gradient(
              90deg,
              rgba(var(--scene-color-rgb, 0,163,224), 1),
              rgba(var(--scene-color-rgb, 0,163,224), 0.6)
            )
          `,
          color: "#fff",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          "&:hover": {
            transform: "translateY(-2px)",
            background: `
              linear-gradient(
                90deg,
                rgba(var(--scene-color-rgb, 0,163,224), 0.9),
                rgba(102,209,255,1)
              )
            `,
            boxShadow: "0 8px 24px rgba(var(--scene-color-rgb, 0,163,224),0.35)",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(18px)",
          color: "#0d1b2a",
          boxShadow: "0 4px 20px rgba(var(--scene-color-rgb,0,163,224),0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          transition: "background 0.4s ease, box-shadow 0.4s ease",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: `
            linear-gradient(
              145deg,
              rgba(var(--scene-color-rgb, 0,163,224), calc(0.1 + var(--scene-shimmer,0.5)*0.2)),
              rgba(255,255,255,0.8)
            )
          `,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.25)",
          transition: "background 0.5s ease, box-shadow 0.4s ease",
          "&:hover": {
            boxShadow: "0 0 50px rgba(var(--scene-color-rgb,0,163,224),0.5)",
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            background: "rgba(255,255,255,0.7)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(var(--scene-color-rgb,0,163,224),1)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(var(--scene-color-rgb,0,163,224),1)",
              borderWidth: 2,
              boxShadow: "0 0 12px rgba(var(--scene-color-rgb,0,163,224),0.3)",
            },
          },
        },
      },
    },
  },
});

export const highContrastTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    primary: { main: "#005f9e" },
    text: { primary: "#000000", secondary: "#333333" },
    background: { default: "#f0faff", paper: "#ffffff" },
  },
});
