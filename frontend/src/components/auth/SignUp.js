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

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { success, needsProfile } = await signup(
        formData.username,
        formData.email,
        formData.password
      );
      if (success) {
        navigate(needsProfile ? "/profile" : "/");
      }
    } catch (err) {
      setError(err.toString());
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
              New here?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
              Signing up is quick, easy, and free! Don't miss out — become a
              member now and start exploring all that Caloriet has to offer.
            </Typography>
            <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  SIGN UP
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
              One of us?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
              Welcome back to Caloriet! Log in now to continue your journey.
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{ mt: 2 }}
            >
              LOGIN
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
