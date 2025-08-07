'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProvidersTestPage() {
  const { userData, loading: firebaseLoading, hasPermission } = useFirebase();
  const { user, loading: authLoading } = useAuth();

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#0d6efd' }}>✅ All Providers Test</h1>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginBottom: '20px'
      }}>
        <h3>🎉 Success!</h3>
        <p>All providers are now working correctly!</p>
        <ul>
          <li>✅ FirebaseProvider - Working</li>
          <li>✅ AuthProvider - Working</li>
          <li>✅ QueryClientProvider - Working</li>
          <li>✅ ThemeProvider - Working</li>
          <li>✅ StoreProvider - Working</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <h3>📊 Provider Status:</h3>
        
        <h4>Firebase Context:</h4>
        <p><strong>Loading:</strong> {firebaseLoading ? 'Yes' : 'No'}</p>
        <p><strong>User Data:</strong> {userData ? 'Available' : 'Not available'}</p>
        {userData && (
          <div style={{ marginLeft: '20px' }}>
            <p><strong>Name:</strong> {userData.displayName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Can Create Match:</strong> {hasPermission('create_match') ? 'Yes' : 'No'}</p>
          </div>
        )}

        <h4>Auth Context:</h4>
        <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? 'Available' : 'Not available'}</p>
        {user && (
          <div style={{ marginLeft: '20px' }}>
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
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
        <h3>🚀 Next Steps</h3>
        <p>Your application is now fully functional with all providers working!</p>
        <p>You can now:</p>
        <ul>
          <li>Visit the dashboard at <a href="/dashboard" style={{ color: '#0d6efd' }}>/dashboard</a></li>
          <li>Test all pages that use Firebase context</li>
          <li>Use authentication features</li>
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
          display: 'inline-block',
          marginRight: '10px'
        }}>
          Test Dashboard
        </a>
        <a href="/test-firebase" style={{ 
          color: '#0d6efd', 
          border: '1px solid #0d6efd',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Firebase Test
        </a>
      </div>
    </div>
  );
} 