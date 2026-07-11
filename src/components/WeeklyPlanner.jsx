import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlanner({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState({});
  const [recipesMacros, setRecipesMacros] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [weekStart, setWeekStart] = useState(getMonday());

  function getMonday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchRecipes();
    fetchProfile();
    fetchMealPlan();
  }, [userId, weekStart]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
      setRecipes(data || []);

      // Fetch macros for each recipe
      if (data && data.length > 0) {
        for (const recipe of data) {
          await fetchRecipeMacros(recipe.id);
        }
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  const fetchRecipeMacros = async (recipeId) => {
    try {
      const { data: ingredients, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId);
      if (error) throw error;

      let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      if (ingredients) {
        ingredients.forEach((ing) => {
          if (ing.quantity) {
            totalCals += ing.quantity * (ing.calories_per_unit || 0);
            totalProtein += ing.quantity * (ing.protein_per_unit || 0);
            totalCarbs += ing.quantity * (ing.carbs_per_unit || 0);
            totalFat += ing.quantity * (ing.fat_per_unit || 0);
          }
        });
      }

      setRecipesMacros((prev) => ({
        ...prev,
        [recipeId]: {
          calories: Math.round(totalCals),
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fat: Math.round(totalFat),
        },
      }));
    } catch (err) {
      console.error('Error fetching recipe macros:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    } catch (err) {
      console.log('No profile yet');
    }
  };

  const fetchMealPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart);
      if (error) throw error;

      const plan = {};
      if (data) {
        data.forEach((meal) => {
          if (!plan[meal.day_of_week]) plan[meal.day_of_week] = [];
          plan[meal.day_of_week].push(meal.recipe_id);
        });
      }
      setMealPlan(plan);
    } catch (err) {
      console.error('Error fetching meal plan:', err);
    }
  };

  const handleDragStart = (e, recipeId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('recipeId', recipeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dayIndex) => {
    e.preventDefault();
    const recipeId = e.dataTransfer.getData('recipeId');

    if (!recipeId) return;

    try {
      await supabase.from('meal_plans').insert([
        {
          user_id: userId,
          recipe_id: recipeId,
          day_of_week: dayIndex,
          week_start_date: weekStart,
        },
      ]);

      setMealPlan((prev) => ({
        ...prev,
        [dayIndex]: [...(prev[dayIndex] || []), recipeId],
      }));
      setMessage('Recipe added to day!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleRemoveRecipe = async (dayIndex, recipeId) => {
    try {
      await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .eq('day_of_week', dayIndex)
        .eq('week_start_date', weekStart);

      setMealPlan((prev) => ({
        ...prev,
        [dayIndex]: (prev[dayIndex] || []).filter((id) => id !== recipeId),
      }));
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const getDayMacros = (dayIndex) => {
    const dayRecipes = mealPlan[dayIndex] || [];
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    dayRecipes.forEach((recipeId) => {
      const macros = recipesMacros[recipeId] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      total.calories += macros.calories;
      total.protein += macros.protein;
      total.carbs += macros.carbs;
      total.fat += macros.fat;
    });

    return total;
  };

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Weekly Meal Planner</h2>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => changeWeek(-1)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}>
          ← Previous Week
        </button>
        <p style={{ margin: 0 }}>Week starting {weekStart}</p>
        <button onClick={() => changeWeek(1)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}>
          Next Week →
        </button>
      </div>

      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {DAYS.map((day, idx) => {
          const macros = getDayMacros(idx);
          const targetCals = profile?.target_calories || 2000;

          return (
            <div
              key={idx}
              style={{
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '10px',
                minHeight: '400px',
                backgroundColor: '#fafafa',
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <h4 style={{ margin: '0 0 10px 0' }}>{day}</h4>

              <div style={{ backgroundColor: '#e8f4f8', padding: '8px', borderRadius: '3px', marginBottom: '10px', fontSize: '12px' }}>
                <div>
                  <strong>{macros.calories}</strong> / {targetCals} kcal
                </div>
                <div>P: {macros.protein}g | C: {macros.carbs}g | F: {macros.fat}g</div>
              </div>

              <div style={{ minHeight: '250px', border: '2px dashed #ccc', borderRadius: '3px', padding: '8px', backgroundColor: '#fff' }}>
                {(mealPlan[idx] || []).length === 0 ? (
                  <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>Drag recipes here</p>
                ) : (
                  (mealPlan[idx] || []).map((recipeId) => {
                    const recipe = recipes.find((r) => r.id === recipeId);
                    return (
                      <div
                        key={recipeId}
                        style={{
                          backgroundColor: '#e3f2fd',
                          padding: '8px',
                          marginBottom: '5px',
                          borderRadius: '3px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                        }}
                      >
                        <span>{recipe?.name}</span>
                        <button
                          onClick={() => handleRemoveRecipe(idx, recipeId)}
                          style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Available Recipes</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>Drag any recipe to a day above</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {recipes.map((recipe) => {
            const macros = recipesMacros[recipe.id] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
            return (
              <div
                key={recipe.id}
                draggable
                onDragStart={(e) => handleDragStart(e, recipe.id)}
                style={{
                  padding: '10px',
                  border: '1px solid #007bff',
                  borderRadius: '5px',
                  backgroundColor: '#f0f8ff',
                  cursor: 'move',
                }}
              >
                <strong>{recipe.name}</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {macros.calories} kcal | P: {macros.protein}g
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
