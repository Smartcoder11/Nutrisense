const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
      age: { type: Number, default: null },
      weight: { type: Number, default: null },
      height: { type: Number, default: null },
      gender: { type: String, default: null },
      dietaryPreference: {
        type: String,
        enum: ["vegetarian", "non-vegetarian"],
        default: "vegetarian",
      },
      allergies: { type: [String], default: [] },
      healthConditions: { type: [String], default: [] },
      sleepSchedule: {
        wakeUpTime: { type: String, default: null },
        sleepTime: { type: String, default: null },
      },
      region: { type: String, default: null },
    },
    dietPlans: [
      {
        date: { type: Date, default: Date.now },
        meals: [
          {
            name: String,
            time: String,
            calories: Number,
            macros: {
              protein: Number,
              fats: Number,
              carbs: Number,
            },
            completed: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
