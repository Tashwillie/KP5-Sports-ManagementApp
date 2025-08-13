'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, loading, error, login, register, logout } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [displayName, setDisplayName] = useState('Test User');

  const handleLogin = async () => {
    try {
      await login(email, password);
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        email,
        password,
        displayName,
        firstName: 'Test',
        lastName: 'User',
      });
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Authentication Test</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h5>Current Status:</h5>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Authenticated: {user ? 'Yes' : 'No'}</p>
                {user && (
                  <div>
                    <p>User: {user.displayName} ({user.email})</p>
                    <p>Role: {user.role}</p>
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">
                    Error: {error}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <h5>Test Registration:</h5>
                <div className="mb-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    Register
                  </button>
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="btn btn-success"
                  >
                    Login
                  </button>
                  {user && (
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="btn btn-danger"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-secondary"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 