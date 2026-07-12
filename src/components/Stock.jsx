import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Stock({ userId }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    is_staple: false,
    quantity: '',
    unit: 'g',
    status: 'ok',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStockItems();
  }, [userId]);

  const fetchStockItems = async () => {
    try {
      const { data } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name) {
      setMessage('Item name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('stock_items').insert([
        {
          user_id: userId,
          name: newItem.name,
          is_staple: newItem.is_staple,
          quantity: newItem.is_staple ? newItem.quantity : null,
          unit: newItem.is_staple ? newItem.unit : null,
          status: newItem.is_staple ? null : newItem.status,
        },
      ]);
      if (error) throw error;
      setNewItem({ name: '', is_staple: false, quantity: '', unit: 'g', status: 'ok' });
      setMessage('✅ Item added!');
      fetchStockItems();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await supabase.from('stock_items').delete().eq('id', id);
      fetchStockItems();
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-heading font-bold text-olive-900 mb-8">📦 Pantry Stock</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-mustard-500">
          <h3 className="text-xl font-heading font-bold text-olive-900 mb-4">Add New Item</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mustard-500"
                placeholder="e.g., Chicken breast"
              />
            </div>

            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={newItem.is_staple}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    is_staple: e.target.checked,
                    quantity: '',
                    status: 'ok',
                  })
                }
                className="w-4 h-4 accent-mustard-500"
              />
              <span className="font-medium">Staple (exact quantity)</span>
            </label>

            {newItem.is_staple ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mustard-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mustard-500"
                    >
                      <option>g</option>
                      <option>kg</option>
                      <option>ml</option>
                      <option>l</option>
                      <option>unidad</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mustard-500"
                >
                  <option value="ok">✅ OK</option>
                  <option value="low">⚠️ Low</option>
                  <option value="out">❌ Out</option>
                </select>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-tomato-100 text-tomato-800'
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleAddItem}
              disabled={loading}
              className="w-full bg-gradient-to-r from-mustard-400 to-mustard-500 text-white font-medium py-2 rounded-lg hover:from-mustard-500 hover:to-mustard-600 transition disabled:opacity-50"
            >
              {loading ? '⏳ Adding...' : '➕ Add Item'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-heading font-bold text-olive-900 mb-4">Items ({items.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items yet</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.is_staple
                        ? `${item.quantity} ${item.unit}`
                        : `Status: ${item.status}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="ml-2 px-3 py-1 text-sm bg-tomato-100 text-tomato-600 rounded hover:bg-tomato-200 transition"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
