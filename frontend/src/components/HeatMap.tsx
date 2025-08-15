import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token';

interface HeatMapEvent {
  event_id: string;
  type: 'drop' | 'restock' | 'find';
  title: string;
  description?: string;
  store_id: string;
  lat: number;
  lng: number;
  user_id: string;
  verified_count: number;
  timestamp: string;
  distance_km?: number;
}

interface HeatMapProps {
  apiToken: string;
  onEventClick?: (event: HeatMapEvent) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({ apiToken, onEventClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [events, setEvents] = useState<HeatMapEvent[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to NYC
          setUserLocation([-73.9855, 40.7580]);
        }
      );
    } else {
      // Default to NYC
      setUserLocation([-73.9855, 40.7580]);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation,
      zoom: 13,
      pitch: 45,
      bearing: -17.6
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocateControl, 'top-right');

    // Add 3D buildings
    map.current.on('load', () => {
      const layers = map.current!.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout!['text-field']
      )?.id;

      map.current!.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    return () => {
      map.current?.remove();
    };
  }, [userLocation]);

  // Fetch nearby events
  const fetchNearbyEvents = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const [lng, lat] = userLocation;
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_km: '10',
        ...(selectedEventType !== 'all' && { event_type: selectedEventType })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/heatmap/events/nearby?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchNearbyEvents();
    }
  }, [userLocation, selectedEventType, apiToken]);

  // Update markers when events change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    events.forEach(event => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = `heatmap-marker ${event.type}`;
      el.innerHTML = `
        <div class="marker-content">
          <div class="marker-icon">${getEventIcon(event.type)}</div>
          <div class="marker-count">${event.verified_count}</div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="heatmap-popup">
          <h3>${event.title}</h3>
          ${event.description ? `<p>${event.description}</p>` : ''}
          <div class="popup-meta">
            <span class="verified-count">✓ ${event.verified_count} verified</span>
            ${event.distance_km ? `<span class="distance">${event.distance_km.toFixed(1)}km away</span>` : ''}
          </div>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.lng, event.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        if (onEventClick) {
          onEventClick(event);
        }
      });

      markersRef.current.push(marker);
    });

    // Add heat layer for event density
    if (map.current.getSource('events')) {
      (map.current.getSource('events') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: events.map(event => ({
          type: 'Feature',
          properties: {
            mag: event.verified_count
          },
          geometry: {
            type: 'Point',
            coordinates: [event.lng, event.lat]
          }
        }))
      });
    } else {
      map.current.addSource('events', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: events.map(event => ({
            type: 'Feature',
            properties: {
              mag: event.verified_count
            },
            geometry: {
              type: 'Point',
              coordinates: [event.lng, event.lat]
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'events-heat',
        type: 'heatmap',
        source: 'events',
        maxzoom: 15,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0, 0,
            6, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
          ],
          'heatmap-opacity': 0.7
        }
      });
    }
  }, [events, onEventClick]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'drop':
        return '🔥';
      case 'restock':
        return '📦';
      case 'find':
        return '👀';
      default:
        return '📍';
    }
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-controls">
        <div className="event-type-filter">
          <button
            className={selectedEventType === 'all' ? 'active' : ''}
            onClick={() => setSelectedEventType('all')}
          >
            All Events
          </button>
          <button
            className={selectedEventType === 'drop' ? 'active' : ''}
            onClick={() => setSelectedEventType('drop')}
          >
            🔥 Drops
          </button>
          <button
            className={selectedEventType === 'restock' ? 'active' : ''}
            onClick={() => setSelectedEventType('restock')}
          >
            📦 Restocks
          </button>
          <button
            className={selectedEventType === 'find' ? 'active' : ''}
            onClick={() => setSelectedEventType('find')}
          >
            👀 Finds
          </button>
        </div>
        {loading && <div className="loading-indicator">Loading events...</div>}
      </div>
      <div ref={mapContainer} className="map-container" />
      <style jsx>{`
        .heatmap-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .map-container {
          width: 100%;
          height: 100%;
        }

        .heatmap-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .event-type-filter {
          display: flex;
          gap: 10px;
        }

        .event-type-filter button {
          padding: 8px 16px;
          border: 1px solid #333;
          background: transparent;
          color: #fff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .event-type-filter button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .event-type-filter button.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }

        .loading-indicator {
          margin-top: 10px;
          color: #888;
          font-size: 14px;
        }

        :global(.heatmap-marker) {
          width: 40px;
          height: 40px;
          cursor: pointer;
        }

        :global(.heatmap-marker.drop) {
          filter: hue-rotate(0deg);
        }

        :global(.heatmap-marker.restock) {
          filter: hue-rotate(240deg);
        }

        :global(.heatmap-marker.find) {
          filter: hue-rotate(120deg);
        }

        :global(.marker-content) {
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        :global(.marker-icon) {
          font-size: 20px;
        }

        :global(.marker-count) {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: #fff;
          color: #000;
          font-size: 12px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        :global(.heatmap-popup) {
          padding: 10px;
          max-width: 250px;
        }

        :global(.heatmap-popup h3) {
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        :global(.heatmap-popup p) {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
        }

        :global(.popup-meta) {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #888;
        }

        :global(.verified-count) {
          color: var(--success-color);
        }
      `}</style>
    </div>
  );
};
