const express = require("express");
const { PythonShell } = require("python-shell");
const path = require("path");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/recommend", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profile) {
      return res.status(400).json({ message: "User profile not found" });
    }

    const options = {
      pythonPath: "python3",
      scriptPath: path.join(__dirname, "../../ml_model"),
      args: [JSON.stringify(user.profile)],
    };

    PythonShell.run("diet_recommender.py", options)
      .then(async (results) => {
        try {
          const recommendation = JSON.parse(results[0]);

          if (recommendation.error) {
            console.error("Python script error:", recommendation.error);
            return res
              .status(500)
              .json({
                message: "Error generating diet plan",
                error: recommendation.error,
              });
          }

          // Save diet plan to user's profile
          const dietPlan = {
            date: new Date(),
            meals: recommendation.meals,
          };

          user.dietPlans.push(dietPlan);
          await user.save();

          res.json(recommendation);
        } catch (parseError) {
          console.error("Error parsing Python output:", parseError, results);
          res.status(500).json({ message: "Error processing diet plan" });
        }
      })
      .catch((err) => {
        console.error("Python shell error:", err);
        res
          .status(500)
          .json({ message: "Error running diet recommendation script" });
      });
  } catch (error) {
    console.error("Route error:", error);
    res
      .status(500)
      .json({ message: "Error generating diet plan", error: error.message });
  }
});

router.get("/plan/:date", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const date = new Date(req.params.date);
    const dietPlan = user.dietPlans.find(
      (plan) =>
        plan.date.toISOString().split("T")[0] ===
        date.toISOString().split("T")[0]
    );

    if (!dietPlan) {
      return res
        .status(404)
        .json({ message: "Diet plan not found for this date" });
    }

    res.json(dietPlan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching diet plan", error: error.message });
  }
});

router.get("/nutrients", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const dietPlan = user.dietPlans.find(
      (plan) =>
        plan.date.toISOString().split("T")[0] === today
    );

    if (!dietPlan) {
      return res
        .status(404)
        .json({ message: "No diet plan found for today" });
    }

    // Calculate total macros from completed meals
    const completedMeals = dietPlan.meals.filter(meal => meal.completed);
    const totalNutrients = completedMeals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fats: acc.fats + meal.macros.fats
      }),
      { protein: 0, carbs: 0, fats: 0 }
    );

    res.json(totalNutrients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching nutrient data", error: error.message });
  }
});

router.post("/track", auth, async (req, res) => {
  try {
    const { date, mealId, completed } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dietPlan = user.dietPlans.find(
      (plan) => plan.date.toISOString().split("T")[0] === date
    );

    if (!dietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }

    // Find and update the meal status
    const meal = dietPlan.meals.find(m => m._id.toString() === mealId);
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    meal.completed = completed;
    await user.save();

    res.json({ message: "Meal status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating meal status", error: error.message });
  }
});

module.exports = router;
