import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Leaderboard from './components/Leaderboard';
import HeatSubmit from './components/HeatSubmit';
import ActivityFeed from './components/ActivityFeed';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for saved token
      const savedToken = localStorage.getItem('sniped_token');
      if (savedToken) {
        // Validate saved token
        const response = await fetch(`${API_BASE_URL}/health`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        });

        if (response.ok) {
          setApiToken(savedToken);
          setUserId(localStorage.getItem('sniped_user_id') || 'dev-user');
          setAuthenticated(true);
          setLoading(false);
          return;
        }
      }

      // Create new session
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: import.meta.env.VITE_API_KEY || 'dev-mode',
          device_id: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // Save token
      localStorage.setItem('sniped_token', data.token);
      localStorage.setItem('sniped_user_id', data.user_id);
      
      setApiToken(data.token);
      setUserId(data.user_id);
      setAuthenticated(true);
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to connect to Sniped API. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="logo-animation">
            <h1>SNIPED</h1>
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
          </div>
          <p>Initializing systems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <div className="error-content">
          <h1>Connection Error</h1>
          <p>{error}</p>
          <button onClick={authenticate}>Retry</button>
        </div>
      </div>
    );
  }

  if (!authenticated || !apiToken || !userId) {
    return (
      <div className="app-auth">
        <div className="auth-content">
          <h1>SNIPED</h1>
          <p>Authentication required</p>
          <button onClick={authenticate}>Connect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <AnalyticsDashboard />
        <Leaderboard />
        <HeatSubmit />
        <ActivityFeed />
      </div>
    </div>
  );
}