import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";

export default function DietPlan() {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDietPlan();
  }, []);

  const fetchDietPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/diet/plan/${currentDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDietPlan(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // If no diet plan exists, generate a new one
        generateDietPlan();
      } else {
        setError(err.response?.data?.message || "Error fetching diet plan");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateDietPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/diet/recommend",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDietPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error generating diet plan");
      setLoading(false);
    }
  };

  const handleMealComplete = async (mealId, completed) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/user/diet/track",
        {
          date: currentDate,
          mealId,
          completed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDietPlan(); // Refresh the diet plan
    } catch (err) {
      setError(err.response?.data?.message || "Error updating meal status");
    }
  };

  const calculateProgress = () => {
    if (!dietPlan?.meals) return 0;
    const completedMeals = dietPlan.meals.filter(
      (meal) => meal.completed
    ).length;
    return (completedMeals / dietPlan.meals.length) * 100;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h5" component="h2">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/recipes")}
            startIcon={<RestaurantIcon />}
          >
            View Recipes
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Calories Needed:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={50}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#4caf50",
              },
            }}
          />
          <Typography variant="body1" sx={{ mt: 1 }}>
            {dietPlan?.recommended_calories || 0} kcal
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Meal Recommendation
        </Typography>

        <Grid container spacing={3}>
          {dietPlan?.meals?.map((meal, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {meal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.time}
                      </Typography>
                      <Typography variant="body1">
                        {meal.calories} kcal
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`Protein: ${meal.macros.protein}g`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`Carbs: ${meal.macros.carbs}g`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`Fats: ${meal.macros.fats}g`}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() =>
                        handleMealComplete(meal._id, !meal.completed)
                      }
                      color={meal.completed ? "primary" : "default"}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Box>
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Daily Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#2196f3",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate("/nutrient-breakdown")}
          >
            Done Logging
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
