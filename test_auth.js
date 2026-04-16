async function testAuth() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Testy',
        email: 'testx@test.com',
        password: 'password',
        role: 'student'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Data:', data);
  } catch (err) {
    console.log('Connection Error:', err.message);
  }
}

testAuth();
