import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Recipes({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [userId]);

  const fetchRecipes = async () => {
    try {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      setRecipes(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAddRecipe = async () => {
    if (!newRecipe.name.trim()) return;
    setLoading(true);
    try {
      await supabase.from('recipes').insert([{
        user_id: userId,
        name: newRecipe.name,
      }]);
      setNewRecipe({ name: '' });
      fetchRecipes();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('recipes').delete().eq('id', id);
      fetchRecipes();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="pb-24 px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Recipes</h1>
      <p className="text-gray-600 mb-6">Your recipes</p>

      <div className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Recipe name"
          value={newRecipe.name}
          onChange={(e) => setNewRecipe({ name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success"
        />
        <button
          onClick={handleAddRecipe}
          disabled={loading || !newRecipe.name.trim()}
          className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
        >
          {loading ? 'Adding...' : 'Create Recipe'}
        </button>
      </div>

      <div className="space-y-2">
        {recipes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recipes yet</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">{recipe.name}</p>
              </div>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="ml-2 px-3 py-2 text-danger text-sm font-medium hover:bg-red-50 rounded transition"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
