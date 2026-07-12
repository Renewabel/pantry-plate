import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recipes({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    servings: 1,
    ingredients: [{ name: "", quantity: "", unit: "g", calories_per_unit: "", protein_per_unit: "", carbs_per_unit: "", fat_per_unit: "" }],
  });

  useEffect(() => {
    fetchRecipes();
  }, [userId]);

  const fetchRecipes = async () => {
    try {
      const { data } = await supabase.from("recipes").select("*").eq("user_id", userId).order("name");
      setRecipes(data || []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  const calculateMacros = () => {
    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    formData.ingredients.forEach((ing) => {
      if (ing.quantity && ing.calories_per_unit) {
        totalCals += parseFloat(ing.quantity) * parseFloat(ing.calories_per_unit);
        totalProtein += parseFloat(ing.quantity) * (parseFloat(ing.protein_per_unit) || 0);
        totalCarbs += parseFloat(ing.quantity) * (parseFloat(ing.carbs_per_unit) || 0);
        totalFat += parseFloat(ing.quantity) * (parseFloat(ing.fat_per_unit) || 0);
      }
    });
    return { calories: Math.round(totalCals), protein: Math.round(totalProtein), carbs: Math.round(totalCarbs), fat: Math.round(totalFat) };
  };

  const handleSaveRecipe = async () => {
    if (!formData.name.trim()) { setMessage("Recipe name is required"); return; }
    setLoading(true);
    try {
      let recipeId = editingRecipe?.id;
      if (editingRecipe) {
        await supabase.from("recipes").update({ name: formData.name, instructions: formData.instructions, servings: formData.servings }).eq("id", editingRecipe.id);
        await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
      } else {
        const { data } = await supabase.from("recipes").insert([{ user_id: userId, name: formData.name, instructions: formData.instructions, servings: formData.servings }]).select();
        recipeId = data[0].id;
      }
      const ingredientsToInsert = formData.ingredients.filter((ing) => ing.name.trim()).map((ing) => ({ recipe_id: recipeId, name: ing.name, quantity: parseFloat(ing.quantity), unit: ing.unit, calories_per_unit: ing.calories_per_unit ? parseFloat(ing.calories_per_unit) : null, protein_per_unit: ing.protein_per_unit ? parseFloat(ing.protein_per_unit) : null, carbs_per_unit: ing.carbs_per_unit ? parseFloat(ing.carbs_per_unit) : null, fat_per_unit: ing.fat_per_unit ? parseFloat(ing.fat_per_unit) : null }));
      if (ingredientsToInsert.length > 0) await supabase.from("recipe_ingredients").insert(ingredientsToInsert);
      setMessage("✅ Recipe saved!");
      setShowForm(false);
      setEditingRecipe(null);
      setFormData({ name: "", instructions: "", servings: 1, ingredients: [{ name: "", quantity: "", unit: "g", calories_per_unit: "", protein_per_unit: "", carbs_per_unit: "", fat_per_unit: "" }] });
      fetchRecipes();
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      await supabase.from("recipes").delete().eq("id", id);
      fetchRecipes();
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const addIngredientRow = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { name: "", quantity: "", unit: "g", calories_per_unit: "", protein_per_unit: "", carbs_per_unit: "", fat_per_unit: "" }] });
  };

  const removeIngredientRow = (index) => {
    setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const macros = calculateMacros();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-heading font-bold text-olive-900 mb-8">🍳 Recipes</h2>
      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditingRecipe(null); setFormData({ name: "", instructions: "", servings: 1, ingredients: [{ name: "", quantity: "", unit: "g", calories_per_unit: "", protein_per_unit: "", carbs_per_unit: "", fat_per_unit: "" }] }); }} className="mb-8 px-6 py-3 bg-gradient-to-r from-tomato-500 to-tomato-600 text-white font-heading font-bold rounded-lg hover:from-tomato-600 hover:to-tomato-700 transition">
          ➕ New Recipe
        </button>
      )}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-tomato-500">
          <h3 className="text-2xl font-heading font-bold text-olive-900 mb-6">{editingRecipe ? "Edit Recipe" : "Create New Recipe"}</h3>
          <div className="space-y-4 mb-6">
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tomato-500" placeholder="Recipe name..." />
            <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tomato-500 min-h-20" placeholder="Instructions..." />
          </div>
          <div className="mb-8">
            <h4 className="font-heading font-bold text-olive-900 mb-3">Ingredients</h4>
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 mb-2">
                <input placeholder="Name" value={ing.name} onChange={(e) => updateIngredient(idx, "name", e.target.value)} className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm" />
                <input type="number" placeholder="Qty" value={ing.quantity} onChange={(e) => updateIngredient(idx, "quantity", e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm" />
                <select value={ing.unit} onChange={(e) => updateIngredient(idx, "unit", e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm"><option>g</option><option>kg</option><option>ml</option><option>l</option></select>
                <input type="number" placeholder="Cal" value={ing.calories_per_unit} onChange={(e) => updateIngredient(idx, "calories_per_unit", e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm" />
                <button onClick={() => removeIngredientRow(idx)} className="px-2 py-2 text-tomato-600 hover:bg-tomato-50">✕</button>
              </div>
            ))}
            <button onClick={addIngredientRow} className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm">+ Add</button>
          </div>
          <div className="bg-gradient-to-r from-tomato-50 to-olive-50 rounded-lg p-4 mb-6 border-l-4 border-tomato-500">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><div className="text-2xl font-mono font-bold text-tomato-600">{macros.calories}</div><p className="text-xs">kcal</p></div>
              <div><div className="text-2xl font-mono font-bold text-olive-600">{macros.protein}g</div><p className="text-xs">P</p></div>
              <div><div className="text-2xl font-mono font-bold text-mustard-600">{macros.carbs}g</div><p className="text-xs">C</p></div>
              <div><div className="text-2xl font-mono font-bold text-tomato-600">{macros.fat}g</div><p className="text-xs">F</p></div>
            </div>
          </div>
          {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-tomato-100 text-tomato-800"}`}>{message}</div>}
          <div className="flex gap-3"><button onClick={handleSaveRecipe} disabled={loading} className="flex-1 bg-gradient-to-r from-tomato-500 to-tomato-600 text-white font-medium py-3 rounded-lg hover:from-tomato-600 hover:to-tomato-700 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button><button onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-400">Cancel</button></div>
        </div>
      )}
      <h3 className="text-2xl font-heading font-bold text-olive-900 mb-4">Recipes ({recipes.length})</h3>
      {recipes.length === 0 ? <p className="text-gray-500 text-center py-8">No recipes</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{recipes.map((recipe) => (<div key={recipe.id} className="bg-white rounded-lg shadow-md p-4 border-t-4 border-tomato-400"><h4 className="font-heading font-bold text-olive-900">{recipe.name}</h4><p className="text-xs text-gray-500 my-2">Servings: {recipe.servings}</p><div className="flex gap-2"><button onClick={() => handleEditRecipe(recipe)} className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded">Edit</button><button onClick={() => handleDeleteRecipe(recipe.id)} className="flex-1 px-3 py-2 text-sm bg-tomato-100 text-tomato-600 rounded">Delete</button></div></div>))}</div>}
    </div>
  );
}
