import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import pickle
import json
import sys
import google.generativeai as genai
from os import getenv

# Configure Gemini API
genai.configure(api_key=getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

class DietRecommender:
    def __init__(self):
        # Generate synthetic dataset
        self.generate_dataset()
        self.train_model()
        # Load extended dataset with allergy/condition tags if available
        try:
            self.extended_dataset = pd.read_csv('diet_dataset.csv')
        except Exception:
            self.extended_dataset = None

    def generate_dataset(self):
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic user profiles
        ages = np.random.randint(18, 70, n_samples)
        weights = np.random.normal(70, 15, n_samples)
        heights = np.random.normal(170, 10, n_samples)
        bmis = weights / ((heights/100) ** 2)
        activity_levels = np.random.choice(['low', 'moderate', 'high'], n_samples)
        diet_types = np.random.choice(['vegetarian', 'non-vegetarian'], n_samples)
        
        # Calculate recommended calories based on factors
        base_calories = (10 * weights + 6.25 * heights - 5 * ages)
        activity_multipliers = {'low': 1.2, 'moderate': 1.5, 'high': 1.8}
        calories = [base_cal * activity_multipliers[act] for base_cal, act in zip(base_calories, activity_levels)]
        
        # Create dataset
        self.dataset = pd.DataFrame({
            'age': ages,
            'weight': weights,
            'height': heights,
            'bmi': bmis,
            'activity_level': activity_levels,
            'diet_type': diet_types,
            'recommended_calories': calories
        })
        
        # Save dataset
        self.dataset.to_csv('diet_dataset.csv', index=False)
    
    def train_model(self):
        # Prepare features for training
        features = ['age', 'bmi', 'recommended_calories']
        X = self.dataset[features]
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train KNN model
        self.model = NearestNeighbors(n_neighbors=5, algorithm='ball_tree')
        self.model.fit(X_scaled)
        
        # Save model
        with open('diet_model.pkl', 'wb') as f:
            pickle.dump((self.model, self.scaler), f)
    
    def get_meal_suggestions(self, meal_type, calories, health_conditions, diet_type):
        prompt = f"""
        Suggest a detailed {meal_type} meal that is:
        - Around {calories} calories
        - Suitable for {diet_type} diet
        - Safe for someone with {', '.join(health_conditions)} health conditions
        
        Format the response as JSON with:
        - name: meal name
        - ingredients: list of ingredients with quantities
        - nutritional_info: calories, protein, carbs, fats
        - cooking_instructions: step by step instructions
        - health_benefits: specific benefits related to the health conditions
        """
        
        try:
            response = model.generate_content(prompt)
            meal_data = json.loads(response.text)
            return meal_data
        except Exception as e:
            print(f"Error generating meal suggestion: {str(e)}")
            return None
    
    def filter_meals_by_allergy_and_condition(self, user_allergies, user_conditions):
        if self.extended_dataset is None:
            return None
        df = self.extended_dataset
        # Filter out meals with any of the user's allergies
        if user_allergies:
            df = df[~df['allergy_tags'].fillna('').apply(lambda tags: any(a in tags for a in user_allergies))]
        # Keep only meals suitable for all user's health conditions (unless 'None')
        if user_conditions:
            df = df[df['health_condition_tags'].fillna('').apply(lambda tags: all(c == 'None' or c in tags or tags == '' for c in user_conditions))]
        return df

    def get_recommendation(self, user_data):
        # Extract user features
        age = float(user_data['age'])
        weight = float(user_data['weight'])
        height = float(user_data['height'])
        activity_level = user_data['activityLevel']
        diet_type = user_data['dietaryPreference']
        health_conditions = user_data.get('healthConditions', [])
        allergies = user_data.get('allergies', [])

        # Calculate BMI
        bmi = weight / ((height/100) ** 2)
        # Calculate base calories
        base_calories = (10 * weight + 6.25 * height - 5 * age)
        activity_multipliers = {'low': 1.2, 'moderate': 1.5, 'high': 1.8}
        recommended_calories = base_calories * activity_multipliers[activity_level.lower()]
        # Scale features
        features = np.array([[age, bmi, recommended_calories]])
        features_scaled = self.scaler.transform(features)
        # Find similar profiles
        distances, indices = self.model.kneighbors(features_scaled)
        # Get recommendations based on similar profiles
        similar_profiles = self.dataset.iloc[indices[0]]

        # --- FILTER MEALS BY ALLERGY/CONDITION ---
        filtered_meals_df = self.filter_meals_by_allergy_and_condition(allergies, health_conditions)
        if filtered_meals_df is not None and not filtered_meals_df.empty:
            meal_names = filtered_meals_df['meal_name'].sample(n=3, replace=True).tolist()
        else:
            # fallback: generate synthetic meal plan
            meal_names = [f'{m.capitalize()}' for m in ['breakfast', 'lunch', 'dinner']]

        # --- GEMINI API: Personalized meal plan ---
        gemini_prompt = (
            f"Suggest a personalized meal plan for a user with the following profile:\n"
            f"Age: {age}, Weight: {weight}, Height: {height},\n"
            f"Dietary Preference: {diet_type},\n"
            f"Allergies: {', '.join(allergies)},\n"
            f"Health Conditions: {', '.join(health_conditions)}.\n"
            f"Here are some suitable meals: {', '.join(meal_names)}.\n"
            f"Recommend a meal plan for today, explaining why each meal fits the user's needs."
        )
        try:
            gemini_response = model.generate_content(gemini_prompt)
            gemini_plan = gemini_response.text
        except Exception as e:
            gemini_plan = f"Error generating Gemini meal plan: {str(e)}"

        # --- Build response ---
        return {
            'recommended_calories': int(recommended_calories),
            'meals': meal_names,
            'gemini_plan': gemini_plan
        }
    
    def generate_meal_plan(self, total_calories, diet_type):
        # Define meal distribution
        meal_distribution = {
            'breakfast': 0.3,
            'lunch': 0.4,
            'dinner': 0.3
        }
        
        meals = []
        for meal_type, calorie_ratio in meal_distribution.items():
            meal_calories = int(total_calories * calorie_ratio)
            
            # Generate meal macros
            protein_cals = meal_calories * 0.25
            carbs_cals = meal_calories * 0.55
            fats_cals = meal_calories * 0.20
            
            meals.append({
                'name': f'{meal_type.capitalize()}',
                'time': self.get_meal_time(meal_type),
                'calories': meal_calories,
                'macros': {
                    'protein': int(protein_cals / 4),  # 4 calories per gram of protein
                    'carbs': int(carbs_cals / 4),     # 4 calories per gram of carbs
                    'fats': int(fats_cals / 9)        # 9 calories per gram of fat
                }
            })
        
        return meals
    
    def get_meal_time(self, meal_type):
        meal_times = {
            'breakfast': '08:00',
            'lunch': '13:00',
            'dinner': '19:00'
        }
        return meal_times[meal_type]

if __name__ == '__main__':
    recommender = DietRecommender()
    
    # Get user data from command line argument
    try:
        user_data = json.loads(sys.argv[1])
        recommendation = recommender.get_recommendation(user_data)
        print(json.dumps(recommendation))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
