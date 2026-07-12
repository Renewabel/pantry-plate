import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Profile from './components/Profile';
import Stock from './components/Stock';
import Recipes from './components/Recipes';
import WeeklyPlanner from './components/WeeklyPlanner';
import ReceiptOCR from './components/ReceiptOCR';

const VERSION = '0.1.0-mvp';

function MainDashboard() {
  return (
    <div className="pb-24 px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Pantry & Plate</h1>
      <p className="text-gray-600 mb-8">Manage nutrition & recipes</p>

      <div className="space-y-3">
        <Link to="/profile" className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold text-gray-900">Profile</p>
            <p className="text-sm text-gray-500">Macros & settings</p>
          </div>
        </Link>

        <Link to="/stock" className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-semibold text-gray-900">Stock</p>
            <p className="text-sm text-gray-500">Pantry inventory</p>
          </div>
        </Link>

        <Link to="/recipes" className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
          <span className="text-2xl">🍳</span>
          <div>
            <p className="font-semibold text-gray-900">Recipes</p>
            <p className="text-sm text-gray-500">Your recipes</p>
          </div>
        </Link>

        <Link to="/planner" className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-semibold text-gray-900">Planner</p>
            <p className="text-sm text-gray-500">Weekly meals</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20">
      <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-success' : 'text-gray-600'}`}>
        <span className="text-2xl">🏠</span>
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link to="/stock" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/stock') ? 'text-success' : 'text-gray-600'}`}>
        <span className="text-2xl">📦</span>
        <span className="text-xs font-medium">Stock</span>
      </Link>
      <Link to="/recipes" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/recipes') ? 'text-success' : 'text-gray-600'}`}>
        <span className="text-2xl">🍳</span>
        <span className="text-xs font-medium">Recipes</span>
      </Link>
      <Link to="/planner" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/planner') ? 'text-success' : 'text-gray-600'}`}>
        <span className="text-2xl">📅</span>
        <span className="text-xs font-medium">Planner</span>
      </Link>
      <Link to="/scanner" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/scanner') ? 'text-success' : 'text-gray-600'}`}>
        <span className="text-2xl">📸</span>
        <span className="text-xs font-medium">Scan</span>
      </Link>
    </nav>
  );
}

function AppContent({ user, onLogout, loading }) {
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Pantry & Plate</h1>
          <button
            onClick={onLogout}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="pt-16">
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/profile" element={<Profile userId={user.id} />} />
          <Route path="/stock" element={<Stock userId={user.id} />} />
          <Route path="/recipes" element={<Recipes userId={user.id} />} />
          <Route path="/planner" element={<WeeklyPlanner userId={user.id} />} />
          <Route path="/scanner" element={<ReceiptOCR userId={user.id} />} />
        </Routes>
      </main>

      <BottomNav />

      <div className="fixed bottom-24 right-4 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
        v{VERSION}
      </div>
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
