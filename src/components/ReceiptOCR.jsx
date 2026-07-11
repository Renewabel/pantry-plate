import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ReceiptOCR({ userId }) {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [editedItems, setEditedItems] = useState([]);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('upload'); // upload, review, done

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreview(evt.target.result);
      };
      reader.readAsDataURL(file);
      setStep('upload');
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setMessage('Please select an image first');
      return;
    }

    setLoading(true);
    setMessage('Analyzing receipt with AI...');

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target.result.split(',')[1];
        const mimeType = image.type;

        const response = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            imageMimeType: mimeType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze receipt');
        }

        setExtractedItems(data.items || []);
        setEditedItems(data.items || []);
        setStep('review');
        setMessage('');
      };
      reader.readAsDataURL(image);
    } catch (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (index, field, value) => {
    const updated = [...editedItems];
    updated[index][field] = field === 'quantity' ? parseFloat(value) || 0 : value;
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleSaveToStock = async () => {
    if (editedItems.length === 0) {
      setMessage('No items to add');
      return;
    }

    setLoading(true);
    try {
      // Add items to stock
      const itemsToAdd = editedItems.map((item) => ({
        user_id: userId,
        name: item.name,
        is_staple: true,
        quantity: item.quantity,
        unit: item.unit,
        status: null,
      }));

      const { error: stockError } = await supabase
        .from('stock_items')
        .insert(itemsToAdd);

      if (stockError) throw stockError;

      // Save receipt record
      await supabase.from('scanned_receipts').insert([
        {
          user_id: userId,
          extracted_items: editedItems,
          status: 'added',
        },
      ]);

      setMessage('✅ Items added to stock!');
      setStep('done');
      setExtractedItems([]);
      setEditedItems([]);
      setImage(null);
      setImagePreview(null);

      setTimeout(() => {
        setStep('upload');
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>📸 Receipt Scanner</h2>

      {step === 'upload' && (
        <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
          <h3>Upload Receipt Photo</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Take a photo of your receipt and we'll extract items automatically</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            📷 Choose Photo
          </button>

          {imagePreview && (
            <div style={{ marginTop: '20px' }}>
              <img src={imagePreview} alt="Receipt preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '5px' }} />
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Analyzing...' : '✨ Analyze Receipt'}
                </button>
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'review' && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
          <h3>Review Extracted Items</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Edit items before adding to stock</p>

          {editedItems.length === 0 ? (
            <p style={{ color: '#999' }}>No items detected. Try a clearer photo.</p>
          ) : (
            <div>
              {editedItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                    gap: '10px',
                    marginBottom: '10px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px',
                  }}
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleEditItem(idx, 'name', e.target.value)}
                    placeholder="Item name"
                    style={{ padding: '8px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleEditItem(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    style={{ padding: '8px', border: '1px solid #ccc' }}
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => handleEditItem(idx, 'unit', e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc' }}
                  >
                    <option>g</option>
                    <option>kg</option>
                    <option>ml</option>
                    <option>l</option>
                    <option>unidad</option>
                  </select>
                  <input
                    type="number"
                    value={item.estimated_price}
                    onChange={(e) => handleEditItem(idx, 'estimated_price', e.target.value)}
                    placeholder="Price"
                    step="0.01"
                    style={{ padding: '8px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveToStock}
              disabled={loading || editedItems.length === 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Saving...' : '✅ Add to Stock'}
            </button>
            <button
              onClick={() => setStep('upload')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
          <h3>✅ Receipt processed!</h3>
          <p>{editedItems.length} items added to your stock</p>
        </div>
      )}

      {message && (
        <p style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '5px',
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
