import React, { useState, useEffect } from 'react';
import { HeatMap } from './HeatMap';
import { LACESToken } from './LACESToken';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface Monitor {
  monitor_id: string;
  sku: string;
  retailer: string;
  status: string;
  interval_ms: number;
  created_at: string;
}

interface Task {
  task_id: string;
  status: string;
  profile_id: string;
  mode: string;
  created_at: string;
}

interface Metrics {
  active_monitors: number;
  running_tasks: number;
  completed_tasks: number;
  success_rate: number;
  avg_checkout_time_ms: number;
  proxy_health: {
    active: number;
    burned: number;
    health_score: number;
    cost_today: string;
  };
  top_products: Array<{
    sku: string;
    name: string;
    checkout_count: number;
  }>;
}

interface DashboardProps {
  apiToken: string;
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ apiToken, userId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'monitors' | 'analytics'>('overview');
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(WS_URL, {
      auth: {
        token: apiToken
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      toast.success('Connected to real-time updates');
    });

    socketInstance.on('monitor_update', (data) => {
      fetchMonitors();
      toast.info(`Monitor ${data.sku} updated: ${data.status}`);
    });

    socketInstance.on('task_update', (data) => {
      fetchTasks();
      if (data.status === 'completed') {
        toast.success(`Task ${data.task_id} completed!`);
      }
    });

    socketInstance.on('stock_alert', (data) => {
      toast.custom((t) => (
        <div className={`toast-alert ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <h4>Stock Alert!</h4>
            <p>{data.sku} available at {data.retailer}</p>
            <p>Sizes: {data.sizes.join(', ')}</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)}>×</button>
        </div>
      ), {
        duration: 10000
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [apiToken, WS_URL]);

  // Fetch monitors
  const fetchMonitors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/monitors`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMonitors(data.monitors);
      }
    } catch (error) {
      console.error('Failed to fetch monitors:', error);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/checkout/tasks`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metrics/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          timeframe: '24h',
          include_costs: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    fetchTasks();
    fetchMetrics();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [apiToken]);

  // Chart data
  const successRateData = metrics ? [
    { name: 'Success', value: metrics.success_rate, color: '#4ade80' },
    { name: 'Failed', value: 100 - metrics.success_rate, color: '#f87171' }
  ] : [];

  const proxyHealthData = metrics ? [
    { name: 'Active', value: metrics.proxy_health.active, color: '#4ade80' },
    { name: 'Burned', value: metrics.proxy_health.burned, color: '#f87171' }
  ] : [];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      
      <div className="dashboard-header">
        <h1>Sniped Control Center</h1>
        <div className="header-actions">
          <LACESToken apiToken={apiToken} userId={userId} />
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'heatmap' ? 'active' : ''}
          onClick={() => setActiveTab('heatmap')}
        >
          HeatMap
        </button>
        <button
          className={activeTab === 'monitors' ? 'active' : ''}
          onClick={() => setActiveTab('monitors')}
        >
          Monitors
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="metric-card">
              <h3>Active Monitors</h3>
              <div className="metric-value">{metrics?.active_monitors || 0}</div>
              <div className="metric-change">+12% from yesterday</div>
            </div>

            <div className="metric-card">
              <h3>Running Tasks</h3>
              <div className="metric-value">{metrics?.running_tasks || 0}</div>
              <div className="metric-progress">
                <div className="progress-bar" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="metric-card">
              <h3>Success Rate</h3>
              <div className="metric-value">{metrics?.success_rate || 0}%</div>
              <ResponsiveContainer width="100%" height={60}>
                <PieChart>
                  <Pie
                    data={successRateData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={25}
                  >
                    {successRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="metric-card">
              <h3>Avg Checkout Time</h3>
              <div className="metric-value">{metrics?.avg_checkout_time_ms || 0}ms</div>
              <div className="metric-subtitle">Lightning fast ⚡</div>
            </div>

            <div className="chart-card">
              <h3>Top Products</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics?.top_products || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Bar dataKey="checkout_count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Proxy Health</h3>
              <div className="proxy-stats">
                <div className="stat">
                  <span>Health Score</span>
                  <span className="value">{metrics?.proxy_health.health_score}%</span>
                </div>
                <div className="stat">
                  <span>Cost Today</span>
                  <span className="value">{metrics?.proxy_health.cost_today}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={proxyHealthData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                  >
                    {proxyHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="heatmap-view">
            <HeatMap apiToken={apiToken} />
          </div>
        )}

        {activeTab === 'monitors' && (
          <div className="monitors-view">
            <div className="monitors-header">
              <h2>Active Monitors ({monitors.length})</h2>
              <button className="add-monitor-btn">+ Add Monitor</button>
            </div>
            <div className="monitors-grid">
              {monitors.map(monitor => (
                <div key={monitor.monitor_id} className="monitor-card">
                  <div className="monitor-header">
                    <h4>{monitor.sku}</h4>
                    <span className={`status ${monitor.status}`}>{monitor.status}</span>
                  </div>
                  <div className="monitor-details">
                    <div className="detail">
                      <span>Retailer</span>
                      <span>{monitor.retailer}</span>
                    </div>
                    <div className="detail">
                      <span>Interval</span>
                      <span>{monitor.interval_ms}ms</span>
                    </div>
                    <div className="detail">
                      <span>Started</span>
                      <span>{format(new Date(monitor.created_at), 'HH:mm')}</span>
                    </div>
                  </div>
                  <div className="monitor-actions">
                    <button className="pause-btn">Pause</button>
                    <button className="stop-btn">Stop</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-view">
            <h2>Performance Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Success Rate Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-card">
                <h3>Checkout Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Area type="monotone" dataKey="volume" stroke="#4ade80" fill="#4ade80" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          width: 100%;
          height: 100%;
          background: #0a0a0a;
          color: #fff;
          overflow-y: auto;
        }

        .dashboard-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 10px;
          color: #888;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #333;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          border-bottom: 1px solid #222;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 28px;
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-tabs {
          display: flex;
          gap: 20px;
          padding: 0 40px;
          border-bottom: 1px solid #222;
        }

        .dashboard-tabs button {
          padding: 16px 24px;
          background: none;
          border: none;
          color: #888;
          font-size: 16px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        .dashboard-tabs button:hover {
          color: #fff;
        }

        .dashboard-tabs button.active {
          color: var(--primary-color);
        }

        .dashboard-tabs button.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-color);
        }

        .dashboard-content {
          padding: 40px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s;
        }

        .metric-card:hover {
          border-color: #555;
          transform: translateY(-2px);
        }

        .metric-card h3 {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .metric-change {
          font-size: 14px;
          color: #4ade80;
        }

        .metric-subtitle {
          font-size: 14px;
          color: #888;
        }

        .metric-progress {
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 12px;
        }

        .progress-bar {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s;
        }

        .chart-card {
          grid-column: span 2;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #fff;
        }

        .proxy-stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
        }

        .proxy-stats .stat {
          text-align: center;
        }

        .proxy-stats .stat span {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
        }

        .proxy-stats .stat .value {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
        }

        .heatmap-view {
          height: 600px;
          border-radius: 12px;
          overflow: hidden;
        }

        .monitors-view {
          max-width: 1200px;
        }

        .monitors-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .monitors-header h2 {
          margin: 0;
        }

        .add-monitor-btn {
          padding: 10px 20px;
          background: var(--primary-color);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-monitor-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        .monitors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .monitor-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s;
        }

        .monitor-card:hover {
          border-color: #555;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .monitor-header h4 {
          margin: 0;
          font-size: 16px;
        }

        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.active {
          background: rgba(74, 222, 128, 0.2);
          color: #4ade80;
        }

        .status.paused {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        .status.stopped {
          background: rgba(248, 113, 113, 0.2);
          color: #f87171;
        }

        .monitor-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .detail {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail span:first-child {
          color: #888;
        }

        .monitor-actions {
          display: flex;
          gap: 10px;
        }

        .monitor-actions button {
          flex: 1;
          padding: 8px;
          border: 1px solid #333;
          background: transparent;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pause-btn:hover {
          background: rgba(251, 191, 36, 0.2);
          border-color: #fbbf24;
        }

        .stop-btn:hover {
          background: rgba(248, 113, 113, 0.2);
          border-color: #f87171;
        }

        .analytics-view {
          max-width: 1400px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }

        .analytics-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
        }

        .analytics-card h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
        }

        .toast-alert {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 300px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .alert-icon {
          font-size: 32px;
        }

        .alert-content h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #fff;
        }

        .alert-content p {
          margin: 0;
          font-size: 14px;
          color: #888;
        }

        .toast-alert button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: #888;
          font-size: 20px;
          cursor: pointer;
        }

        @keyframes animate-enter {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes animate-leave {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
