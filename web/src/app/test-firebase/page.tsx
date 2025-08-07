'use client';

import { useFirebase } from '@/contexts/FirebaseContext';

export default function FirebaseTestPage() {
  const { userData, loading, hasPermission, hasRole } = useFirebase();

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#0d6efd' }}>✅ Firebase Provider Test</h1>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginBottom: '20px'
      }}>
        <h3>🎉 Success!</h3>
        <p>The Firebase provider is now working correctly!</p>
        <p>No more "useFirebase must be used within a FirebaseProvider" errors.</p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <h3>📊 Firebase Context Data:</h3>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User Data:</strong> {userData ? 'Available' : 'Not available'}</p>
        {userData && (
          <div style={{ marginLeft: '20px' }}>
            <p><strong>Name:</strong> {userData.displayName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Can Create Match:</strong> {hasPermission('create_match') ? 'Yes' : 'No'}</p>
            <p><strong>Is Super Admin:</strong> {hasRole('super_admin') ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        color: '#856404', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        marginBottom: '20px'
      }}>
        <h3>⚠️ Next Steps</h3>
        <p>Now you can:</p>
        <ul>
          <li>Visit the dashboard at <a href="/dashboard" style={{ color: '#0d6efd' }}>/dashboard</a></li>
          <li>Test other pages that use Firebase context</li>
          <li>Continue developing your sports management platform</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ 
          color: '#fff', 
          backgroundColor: '#0d6efd',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block',
          marginRight: '10px'
        }}>
          ← Back to Home
        </a>
        <a href="/dashboard" style={{ 
          color: '#fff', 
          backgroundColor: '#28a745',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Test Dashboard
        </a>
      </div>
    </div>
  );
} 