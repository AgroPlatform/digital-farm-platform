'use client';

import { useEffect, useState } from 'react';
import { login, register } from '@/api/auth';

interface HealthStatus {
  status: string;
  database: string;
  service: string;
}

type Tab = 'health' | 'login' | 'register';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('health');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setLoginLoading(true);
    
    try {
      const result = await login(loginEmail, loginPassword);
      setLoginSuccess(`Login successful! Welcome ${result.full_name || result.email}`);
      // Clear form
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);
    setRegisterLoading(true);
    
    try {
      const result = await register(registerEmail, registerPassword, registerFullName || undefined);
      setRegisterSuccess(`Registration successful! You can now login with ${result.email}`);
      // Clear form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterFullName('');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'health' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('health')}
          >
            Health Status
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'login' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'register' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Health Tab */}
        {activeTab === 'health' && (
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
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
              {loginError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">{loginError}</p>
                </div>
              )}
              {loginSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-green-800 dark:text-green-200 text-sm">{loginSuccess}</p>
                </div>
              )}
            </form>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                className="text-green-600 hover:underline"
                onClick={() => setActiveTab('register')}
              >
                Register here
              </button>
            </p>
          </div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Register
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="registerFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  id="registerFullName"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
              {registerError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">{registerError}</p>
                </div>
              )}
              {registerSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-green-800 dark:text-green-200 text-sm">{registerSuccess}</p>
                </div>
              )}
            </form>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                className="text-green-600 hover:underline"
                onClick={() => setActiveTab('login')}
              >
                Login here
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
