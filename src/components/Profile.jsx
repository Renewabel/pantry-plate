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
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
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
      setMessage('Profile saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Profile & Macros</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>Weight (kg):</label>
        <input
          type="number"
          value={profile.weight_kg}
          onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Height (cm):</label>
        <input
          type="number"
          value={profile.height_cm}
          onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Target Calories:</label>
        <input
          type="number"
          value={profile.target_calories}
          onChange={(e) => setProfile({ ...profile, target_calories: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Preset:</label>
        <select
          value={profile.target_preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          {Object.keys(PRESETS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label>Protein %:</label>
          <input
            type="number"
            value={profile.target_protein_pct}
            onChange={(e) => setProfile({ ...profile, target_protein_pct: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Carbs %:</label>
          <input
            type="number"
            value={profile.target_carbs_pct}
            onChange={(e) => setProfile({ ...profile, target_carbs_pct: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Fat %:</label>
          <input
            type="number"
            value={profile.target_fat_pct}
            onChange={(e) => setProfile({ ...profile, target_fat_pct: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
