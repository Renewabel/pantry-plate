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
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
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
      setMessage('Item added!');
      fetchStockItems();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const { error } = await supabase.from('stock_items').delete().eq('id', id);
      if (error) throw error;
      fetchStockItems();
    } catch (err) {
      setMessage('Error deleting item: ' + err.message);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      const { error } = await supabase.from('stock_items').update(updates).eq('id', id);
      if (error) throw error;
      fetchStockItems();
    } catch (err) {
      setMessage('Error updating item: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Stock</h2>

      <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Add New Item</h3>

        <div style={{ marginBottom: '10px' }}>
          <label>Item Name:</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="e.g., Chicken breast"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
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
            />
            Staple (track exact quantity)
          </label>
        </div>

        {newItem.is_staple ? (
          <>
            <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div>
                <label>Unit:</label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
          <div style={{ marginBottom: '10px' }}>
            <label>Status:</label>
            <select
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="ok">OK</option>
              <option value="low">Low</option>
              <option value="out">Out</option>
            </select>
          </div>
        )}

        {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

        <button
          onClick={handleAddItem}
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </div>

      <div>
        <h3>Stock Items</h3>
        {items.length === 0 ? (
          <p>No items yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Value</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{item.name}</td>
                  <td style={{ padding: '10px' }}>{item.is_staple ? 'Staple' : 'Extra'}</td>
                  <td style={{ padding: '10px' }}>
                    {item.is_staple ? `${item.quantity} ${item.unit}` : item.status}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
