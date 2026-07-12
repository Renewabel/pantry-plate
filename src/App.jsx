import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Profile from './components/Profile';
import Stock from './components/Stock';
import Recipes from './components/Recipes';
import WeeklyPlanner from './components/WeeklyPlanner';
import ReceiptOCR from './components/ReceiptOCR';

const VERSION = '0.1.0-mvp';

function MainDashboard({ userId, onLogout }) {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <h2 className="text-4xl font-heading font-bold text-olive-900 mb-4">🍽️ Welcome to Pantry & Plate</h2>
      <p className="text-lg text-gray-600">Manage your nutrition, recipes, and weekly meal plans all in one place.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
        <Link to="/profile" className="p-6 bg-olive-50 rounded-lg hover:bg-olive-100 transition">
          <div className="text-3xl mb-2">👤</div>
          <p className="font-heading font-semibold text-olive-900">Profile</p>
        </Link>
        <Link to="/stock" className="p-6 bg-mustard-50 rounded-lg hover:bg-mustard-100 transition">
          <div className="text-3xl mb-2">📦</div>
          <p className="font-heading font-semibold text-olive-900">Stock</p>
        </Link>
        <Link to="/recipes" className="p-6 bg-tomato-50 rounded-lg hover:bg-tomato-100 transition">
          <div className="text-3xl mb-2">🍳</div>
          <p className="font-heading font-semibold text-olive-900">Recipes</p>
        </Link>
        <Link to="/planner" className="p-6 bg-olive-50 rounded-lg hover:bg-olive-100 transition">
          <div className="text-3xl mb-2">📅</div>
          <p className="font-heading font-semibold text-olive-900">Planner</p>
        </Link>
        <Link to="/scanner" className="p-6 bg-mustard-50 rounded-lg hover:bg-mustard-100 transition">
          <div className="text-3xl mb-2">📸</div>
          <p className="font-heading font-semibold text-olive-900">Scanner</p>
        </Link>
      </div>
    </div>
  );
}

function AppContent({ user, onLogout, loading }) {
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <h2 className="text-2xl font-heading font-bold text-olive-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Conectando a Supabase...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <Login />
        <div className="fixed bottom-3 right-3 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 z-50">
          v{VERSION}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed bottom-3 right-3 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 z-50">
        v{VERSION}
      </div>

      <nav className="bg-gradient-to-r from-olive-50 to-olive-100 border-b-2 border-olive-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="text-3xl">🌾</span>
              <h1 className="text-2xl font-heading font-bold text-olive-900">Pantry & Plate</h1>
            </Link>
            <div className="flex gap-1 items-center">
              <Link to="/" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Home</Link>
              <Link to="/profile" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Profile</Link>
              <Link to="/stock" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Stock</Link>
              <Link to="/recipes" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Recipes</Link>
              <Link to="/planner" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Planner</Link>
              <Link to="/scanner" className="px-3 py-2 text-olive-700 hover:bg-olive-200 rounded transition font-medium text-sm">Scanner</Link>
              <button
                onClick={onLogout}
                className="ml-2 px-4 py-2 bg-tomato-500 text-white rounded hover:bg-tomato-600 transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MainDashboard userId={user.id} onLogout={onLogout} />} />
          <Route path="/profile" element={<Profile userId={user.id} />} />
          <Route path="/stock" element={<Stock userId={user.id} />} />
          <Route path="/recipes" element={<Recipes userId={user.id} />} />
          <Route path="/planner" element={<WeeklyPlanner userId={user.id} />} />
          <Route path="/scanner" element={<ReceiptOCR userId={user.id} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <AppContent user={user} onLogout={handleLogout} loading={loading} />
    </BrowserRouter>
  );
}
