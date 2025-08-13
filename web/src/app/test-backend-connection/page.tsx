'use client';

import { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import apiClient from '@/lib/apiClient';

export default function TestBackendConnectionPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connection
      addResult('Backend Connection', 'Testing...');
      const connectionTest = await apiClient.testConnection();
      addResult('Backend Connection', connectionTest);
      
      // Test 2: Auth endpoints availability
      addResult('Auth Endpoints Check', 'Testing...');
      const authEndpointsTest = await apiClient.checkAuthEndpoints();
      addResult('Auth Endpoints Check', authEndpointsTest);
      
      // Test 3: Health endpoint
      addResult('Health Endpoint', 'Testing...');
      try {
        const healthResponse = await fetch('http://localhost:3001/api/health');
        addResult('Health Endpoint', {
          status: healthResponse.status,
          ok: healthResponse.ok,
          statusText: healthResponse.statusText
        });
      } catch (error) {
        addResult('Health Endpoint', { error: error.message });
      }
      
      // Test 4: Auth endpoint (without token) - should return 401
      addResult('Auth Endpoint (No Token)', 'Testing...');
      try {
        const authResponse = await fetch('http://localhost:3001/api/auth/me');
        addResult('Auth Endpoint (No Token)', {
          status: authResponse.status,
          ok: authResponse.ok,
          statusText: authResponse.statusText,
          expected: 'Should return 401 (Unauthorized)',
          actual: authResponse.status === 401 ? '✅ Correct (401)' : `❌ Expected 401, got ${authResponse.status}`
        });
      } catch (error) {
        addResult('Auth Endpoint (No Token)', { error: error.message });
      }
      
      // Test 5: Detailed /auth/me endpoint test using apiClient
      addResult('Detailed /auth/me Test', 'Testing...');
      const authMeTest = await apiClient.testAuthMeEndpoint();
      addResult('Detailed /auth/me Test', authMeTest);
      
      // Test 4: Check if backend is running on different ports
      addResult('Port Check', 'Testing common ports...');
      const ports = [3001, 3000, 8000, 5000];
      const portResults = [];
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/api/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
          });
          portResults.push({ port, status: response.status, ok: response.ok });
        } catch (error) {
          portResults.push({ port, error: error.message });
        }
      }
      addResult('Port Check', portResults);
      
    } catch (error) {
      addResult('Test Error', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">🔧 Backend Connection Test</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Test Backend Connection</Card.Title>
          <Card.Text>
            This page helps you test if your backend server is running and accessible.
            Make sure your backend is running on the expected port.
          </Card.Text>
          
          <div className="d-flex gap-2">
            <Button 
              onClick={testBackendConnection} 
              disabled={loading}
              variant="primary"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Testing...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
            
            <Button onClick={clearResults} variant="outline-secondary">
              Clear Results
            </Button>
          </div>
        </Card.Body>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>Test Results</Card.Title>
            
            {testResults.map((result, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <h6 className="mb-2">{result.test}</h6>
                <pre className="bg-light p-2 rounded">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
                <small className="text-muted">{result.timestamp}</small>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>🔍 Troubleshooting Steps</Card.Title>
          <ol>
            <li><strong>Check if backend is running:</strong> Go to your backend directory and run <code>npm run dev</code></li>
            <li><strong>Check the port:</strong> Make sure your backend is running on port 3001 (or update the API URL)</li>
            <li><strong>Check environment variables:</strong> Verify <code>NEXT_PUBLIC_API_URL</code> is set correctly</li>
            <li><strong>Check backend logs:</strong> Look for any error messages in your backend terminal</li>
            <li><strong>Check firewall/antivirus:</strong> Make sure nothing is blocking localhost connections</li>
          </ol>
        </Card.Body>
      </Card>
    </div>
  );
}
