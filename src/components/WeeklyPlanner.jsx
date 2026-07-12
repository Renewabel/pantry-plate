import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyPlanner({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [weekStart, setWeekStart] = useState(getMonday());

  function getMonday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchRecipes();
    fetchMealPlan();
  }, [userId, weekStart]);

  const fetchRecipes = async () => {
    try {
      const { data } = await supabase.from('recipes').select('*').eq('user_id', userId).order('name');
      setRecipes(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchMealPlan = async () => {
    try {
      const { data } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart);
      const plan = {};
      if (data) {
        data.forEach((meal) => {
          if (!plan[meal.day_of_week]) plan[meal.day_of_week] = [];
          plan[meal.day_of_week].push(meal.recipe_id);
        });
      }
      setMealPlan(plan);
    } catch (err) {
      console.error('Error:', err);
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
      await supabase.from('meal_plans').insert([{
        user_id: userId,
        recipe_id: recipeId,
        day_of_week: dayIndex,
        week_start_date: weekStart,
      }]);
      setMealPlan((prev) => ({
        ...prev,
        [dayIndex]: [...(prev[dayIndex] || []), recipeId],
      }));
    } catch (err) {
      console.error('Error:', err);
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
      console.error('Error:', err);
    }
  };

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  return (
    <div className="pb-24 px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Planner</h1>
      <p className="text-gray-600 mb-4">Week: {weekStart}</p>

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => changeWeek(-1)} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">← Prev</button>
        <button onClick={() => changeWeek(1)} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Next →</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {DAYS.map((day, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-lg border border-gray-200 min-h-40"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
          >
            <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
            <div className="space-y-2">
              {(mealPlan[idx] || []).map((recipeId) => {
                const recipe = recipes.find((r) => r.id === recipeId);
                return (
                  <div key={recipeId} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <span className="truncate text-gray-900">{recipe?.name}</span>
                    <button
                      onClick={() => handleRemoveRecipe(idx, recipeId)}
                      className="ml-2 text-danger hover:bg-red-100 px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-gray-900 mb-3">Recipes</h2>
      <div className="space-y-2">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            draggable
            onDragStart={(e) => handleDragStart(e, recipe.id)}
            className="p-4 bg-white rounded-lg border border-gray-200 cursor-move hover:bg-gray-50"
          >
            <p className="font-medium text-gray-900">{recipe.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
