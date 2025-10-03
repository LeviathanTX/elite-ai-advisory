// Debug script to test API endpoint connectivity
// Run with: node debug-api.js

const https = require('https');

const API_BASE_URL = 'https://elite-ai-advisory-clean.vercel.app';

async function testEndpoint() {
  console.log('🔍 Testing API endpoint connectivity...');
  console.log(`📍 Base URL: ${API_BASE_URL}`);

  const testPayload = {
    service: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      { role: 'user', content: 'Hello, this is a connectivity test.' }
    ],
    options: {
      temperature: 0.7,
      maxTokens: 100
    }
  };

  const options = {
    hostname: 'elite-ai-advisory-clean.vercel.app',
    port: 443,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': 'debug-test-' + Date.now(),
      'X-Client-Version': '1.0.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Response received:', response);
          resolve(response);
        } catch (error) {
          console.log('📄 Raw response:', data);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(testPayload));
    req.end();
  });
}

testEndpoint()
  .then(() => console.log('🎉 Test completed'))
  .catch((error) => console.error('💥 Test failed:', error));