import { AIServiceConfig } from '../types';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIServiceClient {
  constructor(private config: AIServiceConfig) {}

  async generateResponse(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    const timestamp = new Date().toISOString();

    // COMPREHENSIVE DEBUG LOGGING
    console.log(`🔍 [${timestamp}] AI SERVICE CALL INITIATED`);
    console.log('📊 Service Configuration:', {
      serviceId: this.config.id,
      hasApiKey: !!this.config.apiKey,
      apiKeyPrefix: this.config.apiKey ? `${this.config.apiKey.substring(0, 15)}...` : 'NONE',
      keyLength: this.config.apiKey?.length || 0,
      model: this.config.model,
      environment: process.env.NODE_ENV,
    });

    console.log('💬 Request Details:', {
      messageCount: messages.length,
      lastUserMessage:
        messages
          .filter(m => m.role === 'user')
          .slice(-1)[0]
          ?.content?.substring(0, 100) + '...',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    // Always use proxy in production, or when API key is not configured
    const useProxy =
      process.env.NODE_ENV === 'production' ||
      !this.config.apiKey ||
      this.config.apiKey.trim().length === 0;

    if (useProxy) {
      console.log('🔄 USING VERCEL API PROXY for AI calls');
      try {
        return await this.callViaProxy(messages, options);
      } catch (error) {
        console.error(`🚨 PROXY API ERROR:`, error);
        // In production, throw the error instead of falling back to mock
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
        console.log('⚠️ FALLING BACK TO MOCK RESPONSE due to proxy error (development only)');
        return this.generateMockResponse(messages, options);
      }
    }

    console.log('🚀 CALLING AI API DIRECTLY for service:', this.config.id);

    try {
      switch (this.config.id) {
        case 'claude':
          return await this.callClaude(messages, options);
        case 'gemini':
          return await this.callGemini(messages, options);
        case 'chatgpt':
          return await this.callChatGPT(messages, options);
        case 'deepseek':
          return await this.callDeepSeek(messages, options);
        default:
          throw new Error(`Unsupported AI service: ${this.config.id}`);
      }
    } catch (error) {
      console.error(`🚨 AI SERVICE ERROR (${this.config.id}):`, error);
      console.log('⚠️ ERROR DETAILS:', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString(),
      });
      // In production, throw the error instead of falling back to mock
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      console.log('🔄 FALLING BACK TO MOCK RESPONSE due to API error (development only)');
      return this.generateMockResponse(messages, options);
    }
  }

  private async callViaProxy(messages: AIMessage[], options?: any): Promise<AIResponse> {
    console.log('📡 Calling Vercel API proxy endpoint');

    const proxyUrl = '/api/generate';

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: this.config.id,
        model: this.config.model,
        messages: messages,
        options: {
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ PROXY API ERROR:', error);
      throw new Error(
        `Proxy API Error ${response.status}: ${error.error || error.details || 'Request failed'}`
      );
    }

    const data = await response.json();
    console.log('✅ PROXY API SUCCESS:', {
      contentLength: data.content?.length || 0,
      hasUsage: !!data.usage,
    });

    return {
      content: data.content,
      usage: data.usage,
    };
  }

  private async generateMockResponse(messages: AIMessage[], options?: any): Promise<AIResponse> {
    console.log('🎭 GENERATING MOCK RESPONSE (NOT REAL AI)');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastMessage = messages[messages.length - 1]?.content || '';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    // Extract advisor name from system message
    const advisorMatch = systemMessage.match(/You are ([^,]+)/);
    const advisorName = advisorMatch ? advisorMatch[1] : 'AI Advisor';

    // Generate contextual responses based on advisor and content
    const response = this.generateContextualMockResponse(advisorName, lastMessage, systemMessage);

    return {
      content: response,
      usage: {
        prompt_tokens: Math.floor(Math.random() * 500) + 100,
        completion_tokens: Math.floor(Math.random() * 300) + 50,
        total_tokens: Math.floor(Math.random() * 800) + 150,
      },
    };
  }

  private generateContextualMockResponse(
    advisorName: string,
    userMessage: string,
    systemMessage: string
  ): string {
    // Different response styles based on advisor
    const advisorResponses: Record<string, string[]> = {
      'Mark Cuban': [
        "Look, the numbers don't lie. This is either a home run or a strikeout - there's no middle ground. I need to see real traction and paying customers before I get excited.",
        "Here's what I'm thinking - the market opportunity is huge, but execution is everything. Do they have the team and the runway to actually pull this off?",
        "The competition is fierce, but that's not necessarily bad. It means there's a proven market. The question is: what's their unfair advantage?",
      ],
      'Reid Hoffman': [
        'This has interesting network effects potential. The key question is whether they can achieve critical mass and create defensible moats through data and network density.',
        "I'm seeing some compelling platform dynamics here. The ability to scale and create ecosystem value could be significant if they execute properly.",
        "The strategic positioning looks solid, but I'd want to understand their path to becoming the default solution in their category.",
      ],
      'Barbara Corcoran': [
        'I love the passion of this team! But passion without a solid business model is just expensive hobby. Let me tell you what I think about the revenue projections...',
        "The sales strategy needs work. You can't just build it and hope they come. How are they actually going to get customers through the door?",
        'This reminds me of a deal I did five years ago. The fundamentals are similar, but the market timing might be different now.',
      ],
      'Jason Calacanis': [
        'This is exactly the kind of disruptive play that could return 100x if they nail the execution. The TAM is massive and the timing feels right.',
        "I've seen this space evolve over the past decade. The companies that win here will be the ones that move fast and break things - but smartly.",
        'The unit economics look promising, but I want to see them prove they can acquire customers profitably at scale.',
      ],
      'Daymond John': [
        "The brand positioning is crucial here. They need to own their category and become synonymous with the solution they're providing.",
        "I'm seeing good fundamentals, but the go-to-market strategy needs to be bulletproof. How are they going to compete with the established players?",
        "This business has legs if they can build the right partnerships and distribution channels. It's all about execution from here.",
      ],
      'Sheryl Sandberg': [
        'The growth metrics are encouraging, but sustainable growth requires strong operational foundations. How scalable are their current processes?',
        "I'm particularly interested in their approach to company culture and talent acquisition. The best products come from the best teams.",
        'The market opportunity is clear, but they need to think about long-term competitive positioning and potential platform expansion.',
      ],
    };

    // Get responses for this advisor or use generic ones
    const responses = advisorResponses[advisorName] || [
      'Based on my analysis, this presents both significant opportunities and notable risks that we need to carefully consider.',
      'The fundamentals look solid, but I have some concerns about the execution strategy and market timing.',
      'This is an interesting opportunity. The key will be whether they can execute on their vision and achieve sustainable growth.',
    ];

    // Add some context-specific elements
    if (
      userMessage.toLowerCase().includes('financial') ||
      userMessage.toLowerCase().includes('revenue')
    ) {
      return `From a financial perspective, ${responses[0]} The burn rate and runway projections need closer scrutiny, but the growth trajectory shows promise.`;
    }

    if (
      userMessage.toLowerCase().includes('risk') ||
      userMessage.toLowerCase().includes('concern')
    ) {
      return `${responses[1]} We should particularly focus on market risks and competitive threats in this evaluation.`;
    }

    if (
      userMessage.toLowerCase().includes('recommend') ||
      userMessage.toLowerCase().includes('decision')
    ) {
      return `${responses[2]} My recommendation would be to proceed with due diligence while addressing the key risk factors we've identified.`;
    }

    // Return a random response for general cases
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async callClaude(messages: AIMessage[], options?: any): Promise<AIResponse> {
    // Use direct API call in production, proxy in development
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://api.anthropic.com/v1/messages'
      : '/api/anthropic/v1/messages';

    console.log('🤖 CLAUDE API CALL DETAILS:', {
      url: apiUrl,
      isProduction,
      environment: process.env.NODE_ENV,
      model: this.config.model || 'claude-sonnet-4-20250514',
      messageCount: messages.length,
      hasSystemMessage: messages.some(m => m.role === 'system'),
    });

    const requestBody = {
      model: this.config.model || 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.7,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content,
    };

    console.log('📤 CLAUDE REQUEST PAYLOAD:', {
      model: requestBody.model,
      max_tokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      messageCount: requestBody.messages.length,
      hasSystem: !!requestBody.system,
      systemLength: requestBody.system?.length || 0,
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 CLAUDE API RESPONSE STATUS:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ CLAUDE API ERROR RESPONSE:', error);
      throw new Error(`Claude API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE API SUCCESS:', {
      contentLength: data.content?.[0]?.text?.length || 0,
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      model: data.model,
      hasContent: !!data.content?.[0]?.text,
    });

    const result = {
      content: data.content[0].text,
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };

    console.log('🎉 RETURNING REAL CLAUDE RESPONSE:', {
      responseLength: result.content.length,
      firstWords: result.content.substring(0, 50) + '...',
    });

    return result;
  }

  private async callGemini(messages: AIMessage[], options?: any): Promise<AIResponse> {
    const apiKey = this.config.apiKey;
    const model = this.config.model || 'gemini-1.5-pro';

    // Convert messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content;

    // Use direct API call in production, proxy in development
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      : `/api/gemini/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  private async callChatGPT(messages: AIMessage[], options?: any): Promise<AIResponse> {
    // Use direct API call in production, proxy in development
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://api.openai.com/v1/chat/completions'
      : '/api/openai/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-5.2',
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      },
    };
  }

  private async callDeepSeek(messages: AIMessage[], options?: any): Promise<AIResponse> {
    // Use direct API call in production, proxy in development
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://api.deepseek.com/v1/chat/completions'
      : '/api/deepseek/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      },
    };
  }
}

export const createAIClient = (config: AIServiceConfig): AIServiceClient => {
  return new AIServiceClient(config);
};
