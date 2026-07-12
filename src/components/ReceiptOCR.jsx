import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ReceiptOCR({ userId }) {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target.result.split(',')[1];
        const response = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, imageMimeType: image.type }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed');

        const itemsToAdd = (data.items || []).map((item) => ({
          user_id: userId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || 'g',
        }));

        if (itemsToAdd.length > 0) {
          await supabase.from('stock_items').insert(itemsToAdd);
          await supabase.from('scanned_receipts').insert([{
            user_id: userId,
            extracted_items: itemsToAdd,
          }]);
        }

        setMessage('✓ Added to stock');
        setImage(null);
        setTimeout(() => setMessage(''), 2000);
      };
      reader.readAsDataURL(image);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Scanner</h1>
      <p className="text-gray-600 mb-6">Scan receipt to add items</p>

      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-4 bg-white rounded-lg border-2 border-dashed border-gray-300 text-gray-900 font-medium hover:border-gray-400 transition"
        >
          📷 Choose Photo
        </button>

        {image && (
          <>
            <p className="text-sm text-gray-600">✓ Photo selected: {image.name}</p>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Photo'}
            </button>
          </>
        )}

        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
