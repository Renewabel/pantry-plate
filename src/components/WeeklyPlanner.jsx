import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyPlanner({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState({});
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(getMonday());

  function getMonday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  }

  useEffect(() => {
    fetchRecipes();
    fetchProfile();
    fetchMealPlan();
  }, [userId, weekStart]);

  const fetchRecipes = async () => {
    try {
      const { data } = await supabase.from("recipes").select("*").eq("user_id", userId).order("name");
      setRecipes(data || []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setProfile(data);
    } catch (err) {
      console.log("No profile yet");
    }
  };

  const fetchMealPlan = async () => {
    try {
      const { data } = await supabase.from("meal_plans").select("*").eq("user_id", userId).eq("week_start_date", weekStart);
      const plan = {};
      if (data) data.forEach((meal) => { if (!plan[meal.day_of_week]) plan[meal.day_of_week] = []; plan[meal.day_of_week].push(meal.recipe_id); });
      setMealPlan(plan);
    } catch (err) {
      console.error("Error fetching meal plan:", err);
    }
  };

  const handleDragStart = (e, recipeId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("recipeId", recipeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, dayIndex) => {
    e.preventDefault();
    const recipeId = e.dataTransfer.getData("recipeId");
    if (!recipeId) return;
    try {
      await supabase.from("meal_plans").insert([{ user_id: userId, recipe_id: recipeId, day_of_week: dayIndex, week_start_date: weekStart }]);
      setMealPlan((prev) => ({ ...prev, [dayIndex]: [...(prev[dayIndex] || []), recipeId] }));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleRemoveRecipe = async (dayIndex, recipeId) => {
    try {
      await supabase.from("meal_plans").delete().eq("user_id", userId).eq("recipe_id", recipeId).eq("day_of_week", dayIndex).eq("week_start_date", weekStart);
      setMealPlan((prev) => ({ ...prev, [dayIndex]: (prev[dayIndex] || []).filter((id) => id !== recipeId) }));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-heading font-bold text-olive-900 mb-8">📅 Weekly Planner</h2>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">← Prev</button>
        <p className="font-semibold">Week: {weekStart}</p>
        <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Next →</button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-8">
        {DAYS.map((day, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-3 border-t-4 border-olive-500 min-h-64" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx)}>
            <h3 className="font-heading font-bold text-olive-900 mb-2">{day}</h3>
            <div className="space-y-1 min-h-40">
              {(mealPlan[idx] || []).map((recipeId) => {
                const recipe = recipes.find((r) => r.id === recipeId);
                return (
                  <div key={recipeId} className="bg-olive-50 p-2 rounded text-sm flex justify-between items-center">
                    <span className="truncate font-medium text-olive-900">{recipe?.name}</span>
                    <button onClick={() => handleRemoveRecipe(idx, recipeId)} className="text-tomato-500 hover:text-tomato-700 text-lg">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xl font-heading font-bold text-olive-900 mb-3">Recipes to Add</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} draggable onDragStart={(e) => handleDragStart(e, recipe.id)} className="bg-mustard-50 p-3 rounded-lg cursor-move border border-mustard-300 hover:bg-mustard-100">
              <p className="font-medium text-olive-900">{recipe.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
