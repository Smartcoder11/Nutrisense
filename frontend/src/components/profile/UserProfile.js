import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

export default function UserProfile() {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "Male",
    dietaryPreference: "vegetarian",
    allergies: [],
    healthConditions: [],
    activityLevel: "moderate",
    sleepSchedule: {
      wakeUpTime: "",
      sleepTime: "",
    },
    region: "North",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const allergyOptions = [
    'Peanut Allergy',
    'Tree Nut Allergy (e.g., walnut, almond)',
    'Dairy Allergy',
    'Egg Allergy',
    'Soy Allergy',
    'Wheat/Gluten Allergy',
    'Fish Allergy',
    'Shellfish Allergy',
    'Sesame Allergy',
    'Corn Allergy',
  ];

  const healthConditionOptions = [
    'None',
    'Diabetes',
    'Hypertension (High Blood Pressure)',
    'Hypotension (Low Blood Pressure)',
    'Thyroid (Hypothyroidism / Hyperthyroidism)',
    'Obesity',
    'High Cholesterol',
    'PCOS / PCOD',
    'Anemia',
    'Heart Disease',
    'Kidney Disease',
    'Liver Disease (e.g., Fatty Liver)',
    'Digestive Issues (e.g., IBS, Acid Reflux)',
    'Lactose Intolerance',
    'Gluten Intolerance (Celiac Disease)',
    'Asthma',
    'Arthritis',
    'Osteoporosis',
    'Cancer (undergoing recovery or chemo)',
    'Skin Disorders (e.g., Eczema, Psoriasis)',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'allergies' || name === 'healthConditions') {
      setFormData({
        ...formData,
        [name]: typeof value === 'string' ? value.split(',') : value,
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // After profile update, go to diet plan
      navigate("/diet");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          User's Information
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age (years)"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Daily Activity
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Activity Level</InputLabel>
                <Select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  label="Activity Level"
                >
                  <MenuItem value="low">Little to no exercise</MenuItem>
                  <MenuItem value="moderate">Moderate exercise</MenuItem>
                  <MenuItem value="high">Heavy exercise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Wake Up Time"
                name="sleepSchedule.wakeUpTime"
                type="time"
                value={formData.sleepSchedule.wakeUpTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sleep Time"
                name="sleepSchedule.sleepTime"
                type="time"
                value={formData.sleepSchedule.sleepTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Lifestyle
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Diet Type</InputLabel>
                <Select
                  name="dietaryPreference"
                  value={formData.dietaryPreference}
                  onChange={handleChange}
                  label="Diet Type"
                >
                  <MenuItem value="vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="non-vegetarian">Non-Vegetarian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  label="Region"
                >
                  <MenuItem value="North">North</MenuItem>
                  <MenuItem value="South">South</MenuItem>
                  <MenuItem value="East">East</MenuItem>
                  <MenuItem value="West">West</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="health-conditions-label">Health Conditions</InputLabel>
                <Select
                  labelId="health-conditions-label"
                  id="health-conditions"
                  name="healthConditions"
                  multiple
                  value={formData.healthConditions || []}
                  onChange={handleChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {healthConditionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="allergies-label">Allergies</InputLabel>
                <Select
                  labelId="allergies-label"
                  id="allergies"
                  name="allergies"
                  multiple
                  value={formData.allergies || []}
                  onChange={handleChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {allergyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 4 }}>
            Create Account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
