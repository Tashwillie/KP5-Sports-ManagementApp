export default function SimpleTestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#0d6efd' }}>✅ Simple Test Page</h1>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginBottom: '20px'
      }}>
        <h3>🎉 Success!</h3>
        <p>The basic Next.js setup is working correctly!</p>
        <p>No internal server errors.</p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <h3>📊 Current Status:</h3>
        <ul>
          <li>✅ Next.js is running</li>
          <li>✅ Server is responding</li>
          <li>✅ Basic routing works</li>
          <li>✅ No internal server errors</li>
        </ul>
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
        <p>Now we can gradually add back the providers:</p>
        <ul>
          <li>Test Firebase provider</li>
          <li>Add Auth provider</li>
          <li>Add other providers as needed</li>
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
        <a href="/test-firebase" style={{ 
          color: '#fff', 
          backgroundColor: '#28a745',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Test Firebase
        </a>
      </div>
    </div>
  );
} 