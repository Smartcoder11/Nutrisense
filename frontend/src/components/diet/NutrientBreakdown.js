import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { PieChart } from 'react-minimal-charts';

export default function NutrientBreakdown() {
  const [nutrientData, setNutrientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNutrientData();
  }, []);

  const fetchNutrientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/diet/nutrients',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNutrientData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching nutrient data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!nutrientData) return null;

  const data = [
    { name: 'Protein', value: nutrientData.protein, color: '#FF6B6B' },
    { name: 'Fats', value: nutrientData.fats, color: '#4ECDC4' },
    { name: 'Carbs', value: nutrientData.carbs, color: '#45B7D1' },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Visualise Your Micronutrient Breakdown
        </Typography>
        <Typography variant="h5" align="center" sx={{ mb: 4 }}>
          Pie Chart
        </Typography>
        <Box sx={{ height: 400 }}>
          <PieChart
            data={data}
            style={{ height: '100%' }}
            label={({ dataEntry }) => `${dataEntry.name}: ${Math.round(dataEntry.percentage)}%`}
          />
        </Box>
      </Paper>
    </Box>
  );
}
