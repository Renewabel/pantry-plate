import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Stock({ userId }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'g' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    try {
      const { data } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      setItems(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    setLoading(true);
    try {
      await supabase.from('stock_items').insert([{
        user_id: userId,
        name: newItem.name,
        quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
        unit: newItem.unit,
      }]);
      setNewItem({ name: '', quantity: '', unit: 'g' });
      setMessage('✓ Added');
      fetchItems();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('stock_items').delete().eq('id', id);
      fetchItems();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="pb-24 px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Stock</h1>
      <p className="text-gray-600 mb-6">Manage your pantry</p>

      <div className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Qty"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success"
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-success"
          >
            <option>g</option>
            <option>kg</option>
            <option>ml</option>
            <option>l</option>
          </select>
        </div>
        <button
          onClick={handleAddItem}
          disabled={loading || !newItem.name.trim()}
          className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
        {message && <p className="text-sm text-gray-600 text-center">{message}</p>}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No items yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.quantity && <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
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
