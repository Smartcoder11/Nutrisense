const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { dietType } = req.query;
    let query = {};
    
    if (dietType && dietType !== 'all') {
      query.dietType = dietType;
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
});

router.get('/recommended', auth, async (req, res) => {
  try {
    const { dietType, ingredients = [] } = req.query;
    let query = {};
    
    if (dietType && dietType !== 'all') {
      query.dietType = dietType;
    }

    if (ingredients.length > 0) {
      // Find recipes that use any of the ingredients from the diet plan
      query.ingredients = { $in: ingredients };
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// Seed some initial recipes
const seedRecipes = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      const recipes = [
        {
          name: 'Vegetable Stuffed Paratha with Curd',
          calories: 350,
          dietType: 'vegetarian',
          ingredients: ['whole wheat flour', 'mixed vegetables', 'spices', 'curd'],
          macros: {
            protein: 10,
            carbs: 50,
            fats: 12
          },
          instructions: [
            'Prepare the dough with whole wheat flour',
            'Make stuffing with mashed vegetables and spices',
            'Roll out the paratha with stuffing',
            'Cook on griddle with oil',
            'Serve hot with curd'
          ]
        },
        {
          name: 'Rajma (Kidney Bean Curry) with Brown Rice',
          calories: 550,
          dietType: 'vegetarian',
          ingredients: ['kidney beans', 'brown rice', 'onions', 'tomatoes', 'spices'],
          macros: {
            protein: 20,
            carbs: 75,
            fats: 15
          },
          instructions: [
            'Soak kidney beans overnight',
            'Pressure cook beans until soft',
            'Prepare onion-tomato gravy',
            'Add spices and cook',
            'Serve hot with brown rice'
          ]
        }
      ];

      await Recipe.insertMany(recipes);
      console.log('Initial recipes seeded');
    }
  } catch (error) {
    console.error('Error seeding recipes:', error);
  }
};

seedRecipes();

module.exports = router;
