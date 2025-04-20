import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Caloriet
          </Typography>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/")}
            sx={{ mx: 1 }}
          >
            Meal Plan
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/diet-track")}
            sx={{ mx: 1 }}
          >
            Diet Track
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/recipes")}
            sx={{ mx: 1 }}
          >
            Recipe
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/profile")}
            sx={{ mx: 1 }}
          >
            Profile
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            sx={{ mx: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
