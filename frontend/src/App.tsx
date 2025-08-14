import { useState, useEffect, useRef } from 'react';
import { HealthStatus } from './components/HealthStatus';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// API Client
class SneakerSniperAPI {
  private token: string | null = null;

  async authenticate(apiKey?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey || 'dev-mode' })
    });
    const data = await response.json();
    this.token = data.token;
  }

  async parseCommand(prompt: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/commands/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ prompt })
    });
    return response.json();
  }

  async getMetrics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/metrics/dashboard`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  getToken() {
    return this.token;
  }
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  isHtml?: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  
  const api = useRef(new SneakerSniperAPI());
  const ws = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initialize = async () => {
    try {
      await api.current.authenticate();
      setConnected(true);
      addBotMessage('**SneakerSniper Bot Engine Online.** All systems operational. Ready for commands.');
      updateMetrics();
      connectWebSocket();
    } catch (error) {
      addBotMessage('<span style="color:var(--error-color)">Failed to connect to backend. Running in offline mode.</span>', true);
    }
  };

  const connectWebSocket = () => {
    const token = api.current.getToken();
    if (!token) return;

    ws.current = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle WebSocket messages for real-time updates
      console.log('WebSocket message:', data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic if needed
    };
  };

  const addBotMessage = (content: string, isHtml = false) => {
    setMessages(prev => [...prev, { type: 'bot', content, isHtml }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { type: 'user', content }]);
  };

  const updateMetrics = async () => {
    try {
      const metricsData = await api.current.getMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputValue.trim();
    if (!prompt) return;
    
    setInputValue('');
    setLoading(true);
    addUserMessage(prompt);

    try {
      const result = await api.current.parseCommand(prompt);
      
      if (result.type === 'command') {
        addBotMessage(`Executing command: ${result.command.action}`);
        // Here you would implement command execution
      } else if (result.type === 'chat') {
        addBotMessage(result.response);
      } else if (result.type === 'error') {
        addBotMessage(`<span style="color:var(--error-color)">Error: ${result.message}</span>`, true);
      }
    } catch (error) {
      addBotMessage('<span style="color:var(--error-color)">Connection error. Check if backend is running.</span>', true);
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SneakerSniper Control Panel</h1>
        <HealthStatus />
      </header>

      <div className="main-container">
        <div className="chat-section">
          <div className="chat-container" ref={chatContainerRef}>
            <div className="chat-history">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.type}-message`}>
                  {message.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                  ) : (
                    <div>{message.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="prompt-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter command (e.g., 'monitor Jordan 4' or 'run 50 checkouts')"
              disabled={loading}
              className="prompt-input"
            />
            <button type="submit" disabled={loading || !connected}>
              {loading ? '...' : '▶'}
            </button>
          </form>
        </div>

        <div className="dashboard-section">
          {metrics && (
            <div className="metrics-container">
              <h3>System Metrics</h3>
              <div className="metric-grid">
                <div className="metric-item">
                  <span className="metric-label">Active Monitors</span>
                  <span className="metric-value">{metrics.active_monitors}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Running Tasks</span>
                  <span className="metric-value">{metrics.running_tasks}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Success Rate</span>
                  <span className="metric-value">{metrics.success_rate}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Avg Latency</span>
                  <span className="metric-value">{metrics.avg_latency_ms}ms</span>
                </div>
              </div>
            </div>
          )}

          <div className="monitors-container">
            <h3>Active Monitors</h3>
            <div id="monitors-list">
              {/* Monitor components will be rendered here */}
            </div>
          </div>

          <div className="tasks-container">
            <h3>Checkout Tasks</h3>
            <div id="tasks-list">
              {/* Task components will be rendered here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;