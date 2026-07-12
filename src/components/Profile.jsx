import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ weight: '', height: '', macro_preset: 'Standard' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
        setFormData({
          weight: data.weight || '',
          height: data.height || '',
          macro_preset: data.macro_preset || 'Standard',
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        macro_preset: formData.macro_preset,
      });
      setMessage('✓ Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  const getMacroTargets = () => {
    const weight = parseFloat(formData.weight) || 0;
    const targets = {
      Standard: { protein: weight * 2, carbs: weight * 4, fat: weight * 1 },
      Performance: { protein: weight * 2.5, carbs: weight * 5, fat: weight * 1.2 },
      Deficit: { protein: weight * 2.2, carbs: weight * 2.5, fat: weight * 0.8 },
      Keto: { protein: weight * 2.2, carbs: weight * 0.5, fat: weight * 1.5 },
    };
    return targets[formData.macro_preset] || targets.Standard;
  };

  const macros = getMacroTargets();

  return (
    <div className="pb-24 px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-gray-600 mb-6">Your nutrition goals</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Macro Preset</label>
          <select
            value={formData.macro_preset}
            onChange={(e) => setFormData({ ...formData, macro_preset: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
          >
            <option>Standard</option>
            <option>Performance</option>
            <option>Deficit</option>
            <option>Keto</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Target</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Protein</span>
            <span className="font-semibold text-gray-900">{macros.protein.toFixed(0)}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Carbs</span>
            <span className="font-semibold text-gray-900">{macros.carbs.toFixed(0)}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Fat</span>
            <span className="font-semibold text-gray-900">{macros.fat.toFixed(0)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
