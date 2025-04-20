import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dietType, setDietType] = useState('all');

  useEffect(() => {
    fetchRecipes();
  }, [dietType]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recipe?dietType=${dietType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDietTypeChange = (event, newDietType) => {
    if (newDietType !== null) {
      setDietType(newDietType);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recipe Recommendations
        </Typography>
        <ToggleButtonGroup
          value={dietType}
          exclusive
          onChange={handleDietTypeChange}
          aria-label="diet type"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="vegetarian">Vegetarian</ToggleButton>
          <ToggleButton value="non-vegetarian">Non-Vegetarian</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recipe.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {recipe.calories} calories | {recipe.dietType}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Macros:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Protein: {recipe.macros.protein}g
                  <br />
                  Carbs: {recipe.macros.carbs}g
                  <br />
                  Fats: {recipe.macros.fats}g
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                  Ingredients:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {recipe.ingredients.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RecipeList;
