// Vercel Serverless Function for AI API Proxy
// This handles CORS and securely calls AI APIs server-side

export default async function handler(req, res) {
  // Enable CORS with specific origin for security
  const allowedOrigins = [
    'https://ai-knplbtfme-jeff-levines-projects.vercel.app',
    'https://ai-ravb4eg8z-jeff-levines-projects.vercel.app',
    'https://ai-pc4tzo81c-jeff-levines-projects.vercel.app',
    'https://elite-ai-advisory-clean.vercel.app',
    'https://bearable-ai-advisors.vercel.app',
    'https://elite-ai-advisory.vercel.app',
    'https://ai-bod.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID, X-Client-Version, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Basic request validation
    const { service, model, messages, options } = req.body;

    // Debug logging
    console.log('API Request received:', {
      service,
      model,
      messagesCount: messages?.length,
      hasOptions: !!options,
      timestamp: new Date().toISOString()
    });

    if (!service || !model || !messages) {
      console.error('Missing required fields:', { service, model, hasMessages: !!messages });
      return res.status(400).json({ error: 'Missing required fields: service, model, messages' });
    }

    // Environment check for production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.CLAUDE_API_KEY && !process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'No AI service API keys configured' });
      }
    }

    let apiResponse;

    if (service === 'claude') {
      apiResponse = await callClaudeAPI(model, messages, options);
    } else if (service === 'chatgpt') {
      apiResponse = await callOpenAIAPI(model, messages, options);
    } else {
      return res.status(400).json({ error: `Unsupported AI service: ${service}` });
    }

    res.status(200).json(apiResponse);
  } catch (error) {
    console.error('AI API call failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      error: 'AI service temporarily unavailable',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function callClaudeAPI(model, messages, options = {}) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('Claude API key not found in environment');
    throw new Error('Claude API key not configured');
  }

  console.log('Calling Claude API with:', {
    model,
    messageCount: messages.length,
    maxTokens: options.maxTokens || 2000,
    temperature: options.temperature || 0.7
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      messages: messages.filter(m => m.role !== 'system').map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      system: messages.find(m => m.role === 'system')?.content
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error('Claude API error response:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    });
    throw new Error(`Claude API Error ${response.status}: ${error.error?.message || 'Request failed'}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens
    },
    metadata: {
      model: data.model,
      service: 'claude',
      timestamp: new Date().toISOString()
    }
  };
}

async function callOpenAIAPI(model, messages, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('OpenAI API Key check:', {
    exists: !!apiKey,
    type: typeof apiKey,
    length: apiKey?.length,
    prefix: apiKey?.substring(0, 7)
  });
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI API Error ${response.status}: ${error.error?.message || 'Request failed'}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      prompt_tokens: data.usage.prompt_tokens,
      completion_tokens: data.usage.completion_tokens,
      total_tokens: data.usage.total_tokens
    },
    metadata: {
      model: data.model,
      service: 'openai',
      timestamp: new Date().toISOString()
    }
  };
}