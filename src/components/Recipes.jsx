import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Recipes({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    servings: 1,
    ingredients: [{ name: '', quantity: '', unit: 'g', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: '' }],
  });

  useEffect(() => {
    fetchRecipes();
    fetchStockItems();
  }, [userId]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
      setStockItems(data || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const calculateMacros = () => {
    let totalCals = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    formData.ingredients.forEach((ing) => {
      if (ing.quantity && ing.calories_per_unit) {
        totalCals += parseFloat(ing.quantity) * parseFloat(ing.calories_per_unit);
        totalProtein += parseFloat(ing.quantity) * (parseFloat(ing.protein_per_unit) || 0);
        totalCarbs += parseFloat(ing.quantity) * (parseFloat(ing.carbs_per_unit) || 0);
        totalFat += parseFloat(ing.quantity) * (parseFloat(ing.fat_per_unit) || 0);
      }
    });

    return {
      calories: Math.round(totalCals),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    };
  };

  const handleSaveRecipe = async () => {
    if (!formData.name.trim()) {
      setMessage('Recipe name is required');
      return;
    }

    setLoading(true);
    try {
      let recipeId = editingRecipe?.id;

      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update({
            name: formData.name,
            instructions: formData.instructions,
            servings: formData.servings,
          })
          .eq('id', editingRecipe.id);
        if (error) throw error;

        // Delete old ingredients and add new ones
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert([
            {
              user_id: userId,
              name: formData.name,
              instructions: formData.instructions,
              servings: formData.servings,
            },
          ])
          .select();
        if (error) throw error;
        recipeId = data[0].id;
      }

      // Insert ingredients
      const ingredientsToInsert = formData.ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          recipe_id: recipeId,
          name: ing.name,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
          calories_per_unit: ing.calories_per_unit ? parseFloat(ing.calories_per_unit) : null,
          protein_per_unit: ing.protein_per_unit ? parseFloat(ing.protein_per_unit) : null,
          carbs_per_unit: ing.carbs_per_unit ? parseFloat(ing.carbs_per_unit) : null,
          fat_per_unit: ing.fat_per_unit ? parseFloat(ing.fat_per_unit) : null,
        }));

      if (ingredientsToInsert.length > 0) {
        const { error } = await supabase.from('recipe_ingredients').insert(ingredientsToInsert);
        if (error) throw error;
      }

      setMessage('Recipe saved!');
      setShowForm(false);
      setEditingRecipe(null);
      setFormData({
        name: '',
        instructions: '',
        servings: 1,
        ingredients: [{ name: '', quantity: '', unit: 'g', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: '' }],
      });
      fetchRecipes();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      fetchRecipes();
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleEditRecipe = async (recipe) => {
    try {
      const { data: ingredients } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipe.id);

      setEditingRecipe(recipe);
      setFormData({
        name: recipe.name,
        instructions: recipe.instructions || '',
        servings: recipe.servings || 1,
        ingredients: ingredients && ingredients.length > 0
          ? ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity.toString(),
              unit: ing.unit,
              calories_per_unit: ing.calories_per_unit?.toString() || '',
              protein_per_unit: ing.protein_per_unit?.toString() || '',
              carbs_per_unit: ing.carbs_per_unit?.toString() || '',
              fat_per_unit: ing.fat_per_unit?.toString() || '',
            }))
          : [{ name: '', quantity: '', unit: 'g', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: '' }],
      });
      setShowForm(true);
    } catch (err) {
      setMessage('Error loading recipe: ' + err.message);
    }
  };

  const addIngredientRow = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: 'g', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: '' }],
    });
  };

  const removeIngredientRow = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const macros = calculateMacros();

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Recipes</h2>

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRecipe(null);
            setFormData({
              name: '',
              instructions: '',
              servings: 1,
              ingredients: [{ name: '', quantity: '', unit: 'g', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: '' }],
            });
          }}
          style={{
            marginBottom: '20px',
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '3px',
          }}
        >
          + New Recipe
        </button>
      )}

      {showForm && (
        <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
          <h3>{editingRecipe ? 'Edit Recipe' : 'New Recipe'}</h3>

          <div style={{ marginBottom: '10px' }}>
            <label>Recipe Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Servings:</label>
            <input
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Instructions:</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>Ingredients</h4>
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '10px', alignItems: 'end' }}>
                <input
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  style={{ padding: '8px' }}
                >
                  <option>g</option>
                  <option>kg</option>
                  <option>ml</option>
                  <option>l</option>
                  <option>unit</option>
                </select>
                <input
                  type="number"
                  placeholder="Cal"
                  value={ing.calories_per_unit}
                  onChange={(e) => updateIngredient(idx, 'calories_per_unit', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Prot"
                  value={ing.protein_per_unit}
                  onChange={(e) => updateIngredient(idx, 'protein_per_unit', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Carbs"
                  value={ing.carbs_per_unit}
                  onChange={(e) => updateIngredient(idx, 'carbs_per_unit', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Fat"
                  value={ing.fat_per_unit}
                  onChange={(e) => updateIngredient(idx, 'fat_per_unit', e.target.value)}
                  style={{ padding: '8px' }}
                />
                <button
                  onClick={() => removeIngredientRow(idx)}
                  style={{ padding: '8px 5px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addIngredientRow}
              style={{
                padding: '8px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              + Add Ingredient
            </button>
          </div>

          <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Total Macros (per recipe)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <strong>{macros.calories}</strong> kcal
              </div>
              <div>
                <strong>{macros.protein}g</strong> protein
              </div>
              <div>
                <strong>{macros.carbs}g</strong> carbs
              </div>
              <div>
                <strong>{macros.fat}g</strong> fat
              </div>
            </div>
          </div>

          {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveRecipe}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              {loading ? 'Saving...' : 'Save Recipe'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingRecipe(null);
              }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h3>Your Recipes</h3>
        {recipes.length === 0 ? (
          <p>No recipes yet</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {recipes.map((recipe) => (
              <div key={recipe.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{recipe.name}</h4>
                    {recipe.instructions && <p style={{ color: '#666', fontSize: '14px' }}>{recipe.instructions}</p>}
                    <p style={{ fontSize: '12px', color: '#999' }}>Servings: {recipe.servings}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleEditRecipe(recipe)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
