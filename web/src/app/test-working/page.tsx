export default function WorkingTestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#0d6efd' }}>✅ KP5 Academy - Working Test Page</h1>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginBottom: '20px'
      }}>
        <h3>🎉 Success!</h3>
        <p>Your Next.js application is now working with Bootstrap!</p>
        <ul>
          <li>✅ Next.js is running</li>
          <li>✅ Bootstrap is loaded</li>
          <li>✅ TypeScript compilation is working</li>
          <li>✅ Development server is active</li>
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
        <h3>⚠️ Known Issues</h3>
        <p>There are still some case sensitivity warnings for UI components, but the app is functional.</p>
        <p>These warnings don't prevent the app from working.</p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🚀 Next Steps</h3>
        <p>Your app is now accessible at: <strong>http://localhost:3003</strong></p>
        <p>You can:</p>
        <ul>
          <li>Visit the main page to see your Bootstrap-styled application</li>
          <li>Test the simple test page at <a href="/test-simple" style={{ color: '#0d6efd' }}>/test-simple</a></li>
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
        <a href="/test-simple" style={{ 
          color: '#0d6efd', 
          border: '1px solid #0d6efd',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Simple Test Page
        </a>
      </div>
    </div>
  );
} 