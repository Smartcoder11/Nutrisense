import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { success, hasProfile } = await login(email, password);
      if (success) {
        // Navigate to diet plan if profile exists, otherwise to profile setup
        navigate(hasProfile ? "/diet" : "/profile");
      }
    } catch (err) {
      console.error("Login error details:", err.response || err);
      setError(err.response?.data?.message || err.toString());
    }
  };

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{ height: "100vh", display: "flex", alignItems: "center" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
              One of us?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
              Welcome back to Caloriet! Log in now to continue your journey.
            </Typography>
            <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  LOGIN
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
              New here?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
              Signing up is quick, easy, and free! Don't miss out — become a
              member now and start exploring all that Caloriet has to offer.
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              sx={{ mt: 2 }}
            >
              SIGN UP
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
