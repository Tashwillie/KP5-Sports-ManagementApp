async function testLoginEndpoint() {
  try {
    console.log('🧪 Testing /auth/login endpoint...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📡 Response text:', responseText);

    if (responseText) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('📡 Parsed JSON:', JSON.stringify(jsonResponse, null, 2));
      } catch (parseError) {
        console.log('❌ Could not parse response as JSON:', parseError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginEndpoint();

