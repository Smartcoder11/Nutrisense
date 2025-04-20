const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  dietType: { type: String, required: true }, // vegetarian, non-vegetarian
  ingredients: [String],
  macros: {
    protein: Number,
    carbs: Number,
    fats: Number
  },
  instructions: [String],
  imageUrl: String
});

module.exports = mongoose.model('Recipe', recipeSchema);
