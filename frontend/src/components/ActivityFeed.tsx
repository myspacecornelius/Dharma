import { useEffect, useState } from 'react';
import { connectWs } from '../lib/ws';

type ActivityEvent = {
  type: string;
  event: {
    event_id: string;
    type: string;
    lat: number;
    lng: number;
    sku: string;
    name: string;
    user_id: string;
    timestamp: string;
  };
};

export default function ActivityFeed() {
  const [feed, setFeed] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectInterval = 1000; // 1 second

    const connect = () => {
      ws = connectWs((message: ActivityEvent) => {
        if (message.type === 'new_event') {
          setFeed((prevFeed) => [message, ...prevFeed].slice(0, 20)); // Keep last 20 events
        }
      });

      ws.onclose = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, reconnectInterval * Math.pow(2, reconnectAttempts)); // Exponential backoff
        } else {
          console.error('Max reconnect attempts reached for WebSocket.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws?.close();
      };
    };

    connect();

    return () => {
      ws?.close();
    };
  }, []);

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <h2 className="text-lg font-semibold mb-3">Activity Feed</h2>
      <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
        {feed.length === 0 ? (
          <p className="text-gray-500">No recent activity.</p>
        ) : (
          feed.map((entry, index) => (
            <div key={entry.event.event_id || index} className="border-b border-gray-200 pb-2">
              <p>
                <span className="font-medium capitalize">{entry.event.type}</span> by{' '}
                <span className="font-medium">{entry.event.user_id}</span>: {entry.event.name} ({entry.event.sku}) at{' '}
                {new Date(entry.event.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
