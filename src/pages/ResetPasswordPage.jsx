import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";


export default function ResetPassword({ variant = "butchery" }) {
  // get token/email from query string
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirm,
      });

      setSuccess("Password reset successfully. You can now sign in.");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#f5f5f7,#ffffff)",
      }}
    >
      <Container maxWidth="xs" sx={{ py: 6 }}>
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
              textAlign: "center",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
            }}
          >
            <motion.img
              src="https://icons.veryicon.com/png/o/miscellaneous/test-2/reset-password-1.png"
              alt="Logo"
              style={{ width: 80, height: 80, marginBottom: 16 }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
            />
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, color: "text.primary", mb: 3 }}
            >
              Password Reset
            </Typography>

            <Stack spacing={2.4}>
              <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleReset}
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.4,
                    fontSize: "1rem",
                    borderRadius: 6,
                    textTransform: "none",
                    background: "linear-gradient(90deg,#000000,#555555)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#111111,#333333)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Reset Password"
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
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="success" variant="filled" sx={{ borderRadius: 4 }}>
                    {success}
                  </Alert>
                </motion.div>
              )}
            </Stack>
          </Paper>
        </motion.div>
      </Container>
      <Box
        component="footer"
        sx={{ textAlign: "center", py: 3, mt: "auto", width: "100%" }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} karanjadavid.com • All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
