'use client';

import { useState } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export default function TestApiPage() {
  const { user, login, isAuthenticated } = useEnhancedAuthContext();
  const [email, setEmail] = useState('admin@kp5academy.com');
  const [password, setPassword] = useState('password123');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      setTestResult('Login successful!');
    } catch (error: any) {
      setTestResult(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`API connection successful! Teams: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        setTestResult(`API call failed: ${errorData.message}`);
      }
    } catch (error: any) {
      setTestResult(`API connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>API Connection Test</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Authentication Test</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary me-2"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Test Login'}
              </button>
              
              {isAuthenticated && (
                <button
                  className="btn btn-success"
                  onClick={testApiConnection}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test API Connection'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Test Results</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Authentication Status:</strong>
                <span className={`badge ms-2 ${isAuthenticated ? 'bg-success' : 'bg-secondary'}`}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              {user && (
                <div className="mb-3">
                  <strong>User:</strong>
                  <div>Email: {user.email}</div>
                  <div>Role: {user.role}</div>
                </div>
              )}
              
              {testResult && (
                <div className="mb-3">
                  <strong>Test Result:</strong>
                  <pre className="bg-light p-2 mt-2" style={{ fontSize: '12px' }}>
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
