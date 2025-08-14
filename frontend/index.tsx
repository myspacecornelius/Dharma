/**
 * SneakerSniper Frontend - Optimized for Internal Bot Architecture
 */

import { marked } from 'marked';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Helper to get elements from the DOM
function getElementById<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id '${id}' not found`);
  return el as T;
}

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

  async startMonitor(sku: string, retailer: string = 'shopify'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ sku, retailer, interval_ms: 200 })
    });
    return response.json();
  }

  async stopMonitor(monitorId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/monitors/${monitorId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }

  async createCheckoutTasks(taskCount: number, profileId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/checkout/tasks/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        count: taskCount,
        profile_id: profileId,
        mode: 'request', // or 'browser'
        retailer: 'shopify'
      })
    });
    return response.json();
  }

  async getMetrics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/metrics/dashboard`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}

// WebSocket Manager for real-time updates
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    this.ws = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(token);
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect() {
    this.ws?.close();
  }
}

// Monitor Component
class StockMonitor {
  private element: HTMLElement;
  private statusEl: HTMLElement;
  private metricsEl: HTMLElement;

  constructor(
    container: HTMLElement, 
    public monitorId: string,
    public sku: string,
    public retailer: string
  ) {
    this.element = document.createElement('div');
    this.element.className = 'monitor-card';
    this.element.innerHTML = `
      <div class="monitor-header">
        <h3>${sku}</h3>
        <button class="stop-btn" data-monitor-id="${monitorId}">⏹</button>
      </div>
      <div class="monitor-status">Initializing...</div>
      <div class="monitor-metrics">
        <span class="metric">Polls: <span class="poll-count">0</span></span>
        <span class="metric">Latency: <span class="latency">--</span>ms</span>
      </div>
    `;
    container.appendChild(this.element);
    this.statusEl = this.element.querySelector('.monitor-status')!;
    this.metricsEl = this.element.querySelector('.monitor-metrics')!;
  }

  updateStatus(status: string, inStock: boolean) {
    this.statusEl.textContent = status;
    this.statusEl.className = `monitor-status ${inStock ? 'in-stock' : 'oos'}`;
  }

  updateMetrics(polls: number, latency: number) {
    this.element.querySelector('.poll-count')!.textContent = polls.toString();
    this.element.querySelector('.latency')!.textContent = latency.toString();
  }

  remove() {
    this.element.remove();
  }
}

// Checkout Task Component
class CheckoutTask {
  private element: HTMLElement;
  private logEl: HTMLElement;
  private statusEl: HTMLElement;
  private progressEl: HTMLElement;
  
  constructor(
    container: HTMLElement,
    public taskId: string,
    public profileId: string,
    public retailer: string
  ) {
    this.element = document.createElement('div');
    this.element.className = 'task-card';
    this.element.innerHTML = `
      <div class="task-header">
        <span>Task #${taskId.slice(-6)}</span>
        <span class="task-retailer">${retailer}</span>
      </div>
      <div class="task-progress">
        <div class="progress-bar"></div>
      </div>
      <div class="task-log">Queued...</div>
      <div class="task-footer">
        <span class="task-profile">${profileId}</span>
        <span class="task-status">PENDING</span>
      </div>
    `;
    container.appendChild(this.element);
    this.logEl = this.element.querySelector('.task-log')!;
    this.statusEl = this.element.querySelector('.task-status')!;
    this.progressEl = this.element.querySelector('.progress-bar')!;
  }

  updateLog(message: string) {
    this.logEl.textContent = message;
  }

  updateProgress(percent: number) {
    this.progressEl.style.width = `${percent}%`;
  }

  setStatus(status: string, className: string) {
    this.statusEl.textContent = status;
    this.statusEl.className = `task-status ${className}`;
  }
}

// Main Application
class SneakerSniperApp {
  private api: SneakerSniperAPI;
  private ws: WebSocketManager;
  private monitors: Map<string, StockMonitor> = new Map();
  private tasks: Map<string, CheckoutTask> = new Map();
  
  // UI Elements
  private chatHistory: HTMLElement;
  private promptForm: HTMLFormElement;
  private promptInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private chatContainer: HTMLElement;
  private monitorsContainer: HTMLElement;
  private tasksContainer: HTMLElement;
  private metricsContainer: HTMLElement;

  constructor() {
    this.api = new SneakerSniperAPI();
    this.ws = new WebSocketManager();
    
    // Get UI elements
    this.chatContainer = getElementById('chat-container');
    this.chatHistory = getElementById('chat-history');
    this.promptForm = getElementById<HTMLFormElement>('prompt-form');
    this.promptInput = getElementById<HTMLInputElement>('prompt-input');
    this.submitButton = this.promptForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    this.monitorsContainer = getElementById('monitors-container');
    this.tasksContainer = getElementById('tasks-container');
    this.metricsContainer = getElementById('metrics-container');

    this.promptForm.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Set up WebSocket listeners
    this.setupWebSocketListeners();
    
    // Initialize
    this.initialize();
  }

  private async initialize() {
    try {
      await this.api.authenticate();
      this.ws.connect(this.api['token']!);
      this.addBotMessage('**SneakerSniper Bot Engine Online.** All systems operational. Ready for commands.');
      this.updateMetrics();
    } catch (error) {
      this.addBotMessage(`<span style="color:var(--error-color)">Failed to connect to backend. Running in offline mode.</span>`);
    }
  }

  private setupWebSocketListeners() {
    // Monitor updates
    this.ws.on('monitor.update', (data: any) => {
      const monitor = this.monitors.get(data.monitor_id);
      if (monitor) {
        monitor.updateStatus(data.status, data.in_stock);
        monitor.updateMetrics(data.poll_count, data.latency_ms);
      }
    });

    // Task updates
    this.ws.on('task.update', (data: any) => {
      const task = this.tasks.get(data.task_id);
      if (task) {
        task.updateLog(data.message);
        task.updateProgress(data.progress);
        if (data.status) {
          task.setStatus(data.status, data.status.toLowerCase());
        }
      }
    });

    // System alerts
    this.ws.on('alert', (data: any) => {
      this.addBotMessage(`<span style="color:var(--warning-color)">⚠️ ${data.message}</span>`);
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const prompt = this.promptInput.value.trim();
    if (!prompt) return;
    this.promptInput.value = '';
    this.handlePrompt(prompt);
  }

  private async handlePrompt(prompt: string) {
    this.setLoading(true);
    this.addUserMessage(prompt);

    try {
      const result = await this.api.parseCommand(prompt);
      
      if (result.type === 'command') {
        await this.executeCommand(result.command);
      } else if (result.type === 'chat') {
        this.addBotMessage(result.response);
      } else if (result.type === 'error') {
        this.addBotMessage(`<span style="color:var(--error-color)">Error: ${result.message}</span>`);
      }
    } catch (error) {
      this.addBotMessage(`<span style="color:var(--error-color)">Connection error. Check if backend is running.</span>`);
    } finally {
      this.setLoading(false);
    }
  }
  
  private async executeCommand(command: any) {
    switch (command.action) {
      case 'start_monitor':
        const monitorResult = await this.api.startMonitor(
          command.parameters.sku,
          command.parameters.retailer || 'shopify'
        );
        
        if (monitorResult.success) {
          const monitor = new StockMonitor(
            this.monitorsContainer,
            monitorResult.monitor_id,
            command.parameters.sku,
            command.parameters.retailer || 'shopify'
          );
          this.monitors.set(monitorResult.monitor_id, monitor);
          
          // Add stop button listener
          monitor.element.querySelector('.stop-btn')?.addEventListener('click', async (e) => {
            const monitorId = (e.target as HTMLElement).dataset.monitorId!;
            await this.stopMonitor(monitorId);
          });
          
          this.addBotMessage(`Monitor deployed for **${command.parameters.sku}**. ID: ${monitorResult.monitor_id}`);
        } else {
          this.addBotMessage(`<span style="color:var(--error-color)">Failed to start monitor: ${monitorResult.error}</span>`);
        }
        break;

      case 'fire_checkout':
        const tasksResult = await this.api.createCheckoutTasks(
          command.parameters.task_count,
          command.parameters.profile_id
        );
        
        if (tasksResult.success) {
          this.tasksContainer.innerHTML = ''; // Clear previous
          this.tasks.clear();
          
          tasksResult.task_ids.forEach((taskId: string) => {
            const task = new CheckoutTask(
              this.tasksContainer,
              taskId,
              command.parameters.profile_id,
              command.parameters.retailer || 'shopify'
            );
            this.tasks.set(taskId, task);
          });
          
          this.addBotMessage(`Deployed **${tasksResult.task_ids.length}** checkout tasks. Engaging targets.`);
        } else {
          this.addBotMessage(`<span style="color:var(--error-color)">Failed to create tasks: ${tasksResult.error}</span>`);
        }
        break;

      case 'clear_dashboard':
        // Stop all monitors
        for (const [monitorId, monitor] of this.monitors) {
          await this.api.stopMonitor(monitorId);
          monitor.remove();
        }
        this.monitors.clear();
        
        // Clear tasks
        this.tasksContainer.innerHTML = '';
        this.tasks.clear();
        
        this.addBotMessage('All monitors and tasks terminated. Dashboard cleared.');
        break;

      default:
        this.addBotMessage(`Unknown command: ${command.action}`);
    }
    
    // Update metrics after any command
    this.updateMetrics();
  }

  private async stopMonitor(monitorId: string) {
    await this.api.stopMonitor(monitorId);
    const monitor = this.monitors.get(monitorId);
    if (monitor) {
      monitor.remove();
      this.monitors.delete(monitorId);
    }
  }

  private async updateMetrics() {
    try {
      const metrics = await this.api.getMetrics();
      this.metricsContainer.innerHTML = `
        <div class="metric-item">
          <span class="metric-label">Active Monitors</span>
          <span class="metric-value">${metrics.active_monitors}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Running Tasks</span>
          <span class="metric-value">${metrics.running_tasks}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Success Rate</span>
          <span class="metric-value">${metrics.success_rate}%</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Avg Latency</span>
          <span class="metric-value">${metrics.avg_latency_ms}ms</span>
        </div>
      `;
    } catch (error) {
      // Silently fail metric updates
    }
  }

  private addUserMessage(text: string) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.textContent = text;
    this.chatHistory.appendChild(messageElement);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
  
  private addBotMessage(htmlContent: string) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    messageElement.innerHTML = htmlContent;
    this.chatHistory.appendChild(messageElement);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  private setLoading(isLoading: boolean) {
    this.promptInput.disabled = isLoading;
    this.submitButton.disabled = isLoading;
  }
}

// Initialize app
function main() {
  try {
    new SneakerSniperApp();
  } catch (error) {
    console.error('Failed to initialize the app:', error);
    document.body.innerHTML = `
      <div style="color: var(--error-color); padding: 2rem; text-align: center;">
        <strong>Initialization Failed:</strong> ${error instanceof Error ? error.message : 'Unknown Error'}<br>
        Please check the console for details.
      </div>
    `;
  }
}

main();