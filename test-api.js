// Quick test script to verify API connectivity
const testAPI = async () => {
  console.log('🧪 Testing AI API connectivity...\n');

  const testPayload = {
    service: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      {
        role: 'user',
        content: 'Test: Can you analyze this document context? Document Content: This is a test financial report showing revenue of $1M.\n\nWhat are the key financial metrics?'
      }
    ],
    options: {
      temperature: 0.7,
      maxTokens: 1000
    }
  };

  try {
    console.log('📡 Testing production API...');
    const response = await fetch('https://elite-ai-advisory-clean.vercel.app/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-123',
        'X-Client-Version': '1.0.0'
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received:');
    console.log('📝 Content length:', data.content?.length || 0);
    console.log('🎯 Service:', data.metadata?.service);
    console.log('🔄 Model:', data.metadata?.model);
    console.log('💬 Response preview:', data.content?.substring(0, 100) + '...');

    if (data.content?.toLowerCase().includes('revenue') || data.content?.toLowerCase().includes('financial')) {
      console.log('🎉 SUCCESS: API is processing document context correctly!');
    } else {
      console.log('⚠️  WARNING: Response may not be processing document context');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testAPI();