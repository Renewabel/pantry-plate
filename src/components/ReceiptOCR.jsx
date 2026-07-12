import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ReceiptOCR({ userId }) {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [editedItems, setEditedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("upload");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (evt) => { setImagePreview(evt.target.result); };
      reader.readAsDataURL(file);
      setStep("upload");
    }
  };

  const handleAnalyze = async () => {
    if (!image) { setMessage("Select image first"); return; }
    setLoading(true);
    setMessage("Analyzing with AI...");
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target.result.split(",")[1];
        const mimeType = image.type;
        const response = await fetch("/api/analyze-receipt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, imageMimeType: mimeType }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        setExtractedItems(data.items || []);
        setEditedItems(data.items || []);
        setStep("review");
        setMessage("");
      };
      reader.readAsDataURL(image);
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (index, field, value) => {
    const updated = [...editedItems];
    updated[index][field] = field === "quantity" ? parseFloat(value) || 0 : value;
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleSaveToStock = async () => {
    if (editedItems.length === 0) { setMessage("No items"); return; }
    setLoading(true);
    try {
      const itemsToAdd = editedItems.map((item) => ({ user_id: userId, name: item.name, is_staple: true, quantity: item.quantity, unit: item.unit, status: null }));
      await supabase.from("stock_items").insert(itemsToAdd);
      await supabase.from("scanned_receipts").insert([{ user_id: userId, extracted_items: editedItems, status: "added" }]);
      setMessage("✅ Added to stock!");
      setStep("done");
      setExtractedItems([]);
      setEditedItems([]);
      setImage(null);
      setImagePreview(null);
      setTimeout(() => { setStep("upload"); setMessage(""); }, 2000);
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-heading font-bold text-olive-900 mb-8">📸 Receipt Scanner</h2>
      {step === "upload" && (
        <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-mustard-500">
          <h3 className="text-xl font-heading font-bold text-olive-900 mb-4">Upload Receipt</h3>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full px-6 py-3 bg-gradient-to-r from-mustard-500 to-mustard-600 text-white font-bold rounded-lg hover:from-mustard-600 hover:to-mustard-700">
            📷 Choose Photo
          </button>
          {imagePreview && (
            <div className="mt-6">
              <img src={imagePreview} alt="Preview" className="max-w-full max-h-64 rounded-lg mx-auto" />
              <div className="flex gap-3 mt-4">
                <button onClick={handleAnalyze} disabled={loading} className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
                  {loading ? "Analyzing..." : "✨ Analyze"}
                </button>
                <button onClick={() => { setImage(null); setImagePreview(null); }} className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {step === "review" && (
        <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-olive-500">
          <h3 className="text-xl font-heading font-bold text-olive-900 mb-4">Review Items</h3>
          {editedItems.length === 0 ? (
            <p className="text-gray-500">No items detected</p>
          ) : (
            <div className="space-y-3 mb-6">
              {editedItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <input type="text" value={item.name} onChange={(e) => handleEditItem(idx, "name", e.target.value)} className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm" />
                  <input type="number" value={item.quantity} onChange={(e) => handleEditItem(idx, "quantity", e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm" />
                  <button onClick={() => handleRemoveItem(idx)} className="px-2 py-2 text-tomato-600 hover:bg-tomato-50">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSaveToStock} disabled={loading || editedItems.length === 0} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50">
              {loading ? "Saving..." : "✅ Add to Stock"}
            </button>
            <button onClick={() => setStep("upload")} className="flex-1 px-4 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500">
              Back
            </button>
          </div>
        </div>
      )}
      {step === "done" && (
        <div className="bg-green-100 text-green-800 rounded-lg p-6 text-center border-t-4 border-green-500">
          <h3 className="text-2xl font-heading font-bold mb-2">✅ Receipt processed!</h3>
          <p>{editedItems.length} items added to stock</p>
        </div>
      )}
      {message && (
        <p className={`mt-6 p-4 rounded-lg text-sm font-medium ${message.includes("Error") ? "bg-tomato-100 text-tomato-800" : message.includes("✅") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
