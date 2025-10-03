// Test the AI API endpoint
const https = require('https');

const API_URL = 'https://elite-ai-advisory.vercel.app/api/generate';

async function testAPI() {
  console.log('🧪 Testing AI API endpoint...\n');

  const testPayload = {
    service: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
    options: { temperature: 0.7, maxTokens: 100 }
  };

  return new Promise((resolve) => {
    const url = new URL(API_URL);
    const payload = JSON.stringify(testPayload);

    console.log('📤 Request:', JSON.stringify(testPayload, null, 2));

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      console.log(`\n📊 Status: ${res.statusCode} (${Date.now() - startTime}ms)`);

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📥 Response:', data.substring(0, 500));

        if (res.statusCode !== 200) {
          console.log('❌ FAILED');
          resolve(false);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          console.log('✅ SUCCESS:', parsed.content || parsed);
          resolve(true);
        } catch (e) {
          console.log('⚠️ Not JSON');
          resolve(false);
        }
      });
    });

    req.on('error', err => {
      console.log('❌ Error:', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

testAPI().then(success => process.exit(success ? 0 : 1));
