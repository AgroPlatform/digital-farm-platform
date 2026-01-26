'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  database: string;
  service: string;
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/health`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealthStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStatus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <main className="flex w-full max-w-2xl flex-col gap-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🌾 Digital Farm Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome to the Digital Farm Platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Backend Health Status
          </h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                ❌ Error connecting to backend
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-2">
                {error}
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-2">
                Make sure the backend is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </p>
            </div>
          )}

          {healthStatus && !loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    API Status: {healthStatus.status}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {healthStatus.service}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {healthStatus.database === 'healthy' ? '✅' : '❌'}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Database: {healthStatus.database}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            📚 API Documentation
          </a>
          <a
            href="https://github.com/AgroPlatform/digital-farm-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            💻 GitHub Repository
          </a>
        </div>
      </main>
    </div>
  );
}
