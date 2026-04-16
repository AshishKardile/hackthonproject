const http = require('http');

const data = JSON.stringify({
  email: 'test@eduwell.com',
  password: 'testpassword',
  name: 'Test Name',
  role: 'student'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response body:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
