
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface Release {
  release_id: string;
  sneaker_name: string;
  brand: string;
  release_date: string;
  retail_price: number;
  store_links: any;
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await apiClient.get('/releases/upcoming');
        setReleases(response.data);
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      }
    };

    fetchReleases();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Releases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {releases.map((release) => (
          <div key={release.release_id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{release.sneaker_name}</h2>
            <p className="text-gray-600">{release.brand}</p>
            <p className="text-gray-800">${release.retail_price}</p>
            <p className="text-sm text-gray-500">{new Date(release.release_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
