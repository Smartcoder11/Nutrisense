const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/profile', auth, async (req, res) => {
  try {
    const { age, weight, height, gender, dietaryPreference, allergies, activityLevel, sleepSchedule, region } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile = {
      age,
      weight,
      height,
      gender,
      dietaryPreference,
      allergies,
      activityLevel,
      sleepSchedule,
      region
    };

    await user.save();
    res.json({ message: 'Profile updated successfully', profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

router.post('/diet/track', auth, async (req, res) => {
  try {
    const { date, mealId, completed } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dietPlan = user.dietPlans.find(plan => 
      plan.date.toISOString().split('T')[0] === date.split('T')[0]
    );

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found for this date' });
    }

    const meal = dietPlan.meals.id(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    meal.completed = completed;
    await user.save();

    res.json({ message: 'Meal tracking updated', dietPlan });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking meal', error: error.message });
  }
});

module.exports = router;
