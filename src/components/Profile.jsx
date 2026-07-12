import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PRESETS = {
  standard: { protein: 30, carbs: 40, fat: 30 },
  performance: { protein: 40, carbs: 40, fat: 20 },
  deficit: { protein: 35, carbs: 35, fat: 30 },
  keto: { protein: 30, carbs: 10, fat: 60 },
  high_protein: { protein: 50, carbs: 30, fat: 20 },
};

export default function Profile({ userId }) {
  const [profile, setProfile] = useState({
    weight_kg: '',
    height_cm: '',
    target_preset: 'standard',
    target_calories: '',
    target_protein_pct: 30,
    target_carbs_pct: 40,
    target_fat_pct: 30,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    } catch (err) {
      console.log('No profile yet');
    }
  };

  const handlePresetChange = (preset) => {
    const presetMacros = PRESETS[preset];
    setProfile({
      ...profile,
      target_preset: preset,
      target_protein_pct: presetMacros.protein,
      target_carbs_pct: presetMacros.carbs,
      target_fat_pct: presetMacros.fat,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        ...profile,
      });
      if (error) throw error;
      setMessage('✅ Profile saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-heading font-bold text-olive-900 mb-8">👤 Your Profile</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Daily Calories</label>
          <input
            type="number"
            value={profile.target_calories}
            onChange={(e) => setProfile({ ...profile, target_calories: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500"
            placeholder="e.g., 2000"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Macro Preset</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition ${
                  profile.target_preset === key
                    ? 'bg-olive-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-olive-50 to-mustard-50 rounded-lg p-6 mb-6 border-l-4 border-olive-500">
          <h3 className="font-heading font-bold text-olive-900 mb-4">Macro Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-olive-600">{profile.target_protein_pct}%</div>
              <p className="text-sm text-gray-600 mt-1">Protein</p>
              <input
                type="number"
                value={profile.target_protein_pct}
                onChange={(e) => setProfile({ ...profile, target_protein_pct: Number(e.target.value) })}
                className="w-full mt-2 px-2 py-1 text-center border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-mustard-600">{profile.target_carbs_pct}%</div>
              <p className="text-sm text-gray-600 mt-1">Carbs</p>
              <input
                type="number"
                value={profile.target_carbs_pct}
                onChange={(e) => setProfile({ ...profile, target_carbs_pct: Number(e.target.value) })}
                className="w-full mt-2 px-2 py-1 text-center border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-tomato-600">{profile.target_fat_pct}%</div>
              <p className="text-sm text-gray-600 mt-1">Fat</p>
              <input
                type="number"
                value={profile.target_fat_pct}
                onChange={(e) => setProfile({ ...profile, target_fat_pct: Number(e.target.value) })}
                className="w-full mt-2 px-2 py-1 text-center border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-tomato-100 text-tomato-800'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-olive-500 to-olive-600 text-white font-medium py-3 rounded-lg hover:from-olive-600 hover:to-olive-700 transition disabled:opacity-50"
        >
          {loading ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}
