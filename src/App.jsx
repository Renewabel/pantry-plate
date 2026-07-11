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
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Welcome to Pantry & Plate</h2>
      <p>Use the navigation above to manage your profile, macros, and stock.</p>
    </div>
  );
}

function AppContent({ user, onLogout, loading }) {
  if (loading) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>Loading...</h2>
        <p>Conectando a Supabase...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Login />
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          fontSize: '10px',
          color: '#999',
          fontFamily: 'monospace',
          backgroundColor: '#f5f5f5',
          padding: '4px 8px',
          borderRadius: '3px',
          border: '1px solid #ddd'
        }}>
          v{VERSION}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        fontSize: '10px',
        color: '#999',
        fontFamily: 'monospace',
        backgroundColor: '#f5f5f5',
        padding: '4px 8px',
        borderRadius: '3px',
        border: '1px solid #ddd',
        zIndex: 1000
      }}>
        v{VERSION}
      </div>
      <nav style={{ backgroundColor: '#f8f9fa', padding: '15px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Pantry & Plate</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>Home</Link>
            <Link to="/profile" style={{ textDecoration: 'none', color: '#007bff' }}>Profile</Link>
            <Link to="/stock" style={{ textDecoration: 'none', color: '#007bff' }}>Stock</Link>
            <Link to="/recipes" style={{ textDecoration: 'none', color: '#007bff' }}>Recipes</Link>
            <Link to="/planner" style={{ textDecoration: 'none', color: '#007bff' }}>Planner</Link>
            <Link to="/scanner" style={{ textDecoration: 'none', color: '#007bff' }}>Scanner</Link>
            <button
              onClick={onLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainDashboard userId={user.id} onLogout={onLogout} />} />
        <Route path="/profile" element={<Profile userId={user.id} />} />
        <Route path="/stock" element={<Stock userId={user.id} />} />
        <Route path="/recipes" element={<Recipes userId={user.id} />} />
        <Route path="/planner" element={<WeeklyPlanner userId={user.id} />} />
        <Route path="/scanner" element={<ReceiptOCR userId={user.id} />} />
      </Routes>
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
