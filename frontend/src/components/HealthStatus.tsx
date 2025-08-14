import { useState, useEffect } from 'react';

interface HealthData {
  status: 'healthy' | 'unhealthy';
  redis: 'connected' | 'disconnected';
  environment: string;
  timestamp: string;
  error?: string;
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="health-status loading">
        <span className="status-indicator"></span>
        <span>Checking system status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-status error">
        <span className="status-indicator"></span>
        <span>API Offline ({error})</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="health-status error">
        <span className="status-indicator"></span>
        <span>Unable to reach API</span>
      </div>
    );
  }

  const isHealthy = health.status === 'healthy' && health.redis === 'connected';

  return (
    <div className={`health-status ${isHealthy ? 'healthy' : 'unhealthy'}`}>
      <span className="status-indicator"></span>
      <span>
        {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
      </span>
      <div className="health-details">
        <small>
          API: {health.status} • Redis: {health.redis} • {health.environment}
        </small>
      </div>
    </div>
  );
}