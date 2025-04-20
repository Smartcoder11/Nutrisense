import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [dietType, setDietType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, [dietType]);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      // First get the current diet plan
      const dietResponse = await axios.get(
        `http://localhost:5000/api/diet/plan/${new Date().toISOString().split("T")[0]}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Then fetch recipes based on diet plan ingredients and diet type
      const response = await axios.get(
        `http://localhost:5000/api/recipe/recommended`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            dietType,
            ingredients: dietResponse.data.ingredients
          }
        }
      );
      setRecipes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" component="h2">
          Recipes
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Diet Type</InputLabel>
          <Select
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
            label="Diet Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="vegetarian">Vegetarian</MenuItem>
            <MenuItem value="non-vegetarian">Non-Vegetarian</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recipe.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Calories: {recipe.calories}Kcal
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={recipe.dietType}
                    color={
                      recipe.dietType === "vegetarian" ? "success" : "primary"
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Macros:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`Protein: ${recipe.macros.protein}g`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Carbs: ${recipe.macros.carbs}g`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`Fats: ${recipe.macros.fats}g`} size="small" />
                </Box>
                <Button variant="contained" color="primary" fullWidth>
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
