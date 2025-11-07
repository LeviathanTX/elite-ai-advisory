import { CelebrityAdvisor, CustomAdvisor, AIServiceConfig } from '../types';
import { SecureAIServiceClient, AIMessage, createSecureAIClient } from './secureAIService';
import { AudioFeatures, VocalDeliveryInsights } from './AudioAnalysisEngine';

export class AdvisorAI {
  private client: SecureAIServiceClient;

  constructor(config: AIServiceConfig) {
    this.client = createSecureAIClient(config);
  }

  async generatePitchFeedback(
    advisor: CelebrityAdvisor,
    pitchText: string,
    analysisType?: string,
    voiceMetrics?: {
      wordsPerMinute: number;
      fillerWords: number;
      confidenceLevel: number;
      clarityScore: number;
      duration: number;
    },
    audioFeatures?: AudioFeatures,
    vocalInsights?: VocalDeliveryInsights
  ): Promise<{
    feedback: string;
    strengths: string[];
    improvements: string[];
    overallScore: number;
    deliveryScore?: number;
    contentScore?: number;
  }> {
    const systemPrompt = this.buildAdvisorSystemPrompt(advisor, 'pitch_analysis');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Please analyze this pitch and provide feedback in the following JSON format:
{
  "feedback": "detailed feedback paragraph as ${advisor.name}",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overallScore": 85,
  "deliveryScore": 80,
  "contentScore": 90
}

${
  audioFeatures
    ? `COMPREHENSIVE VOICE ANALYSIS:

Vocal Delivery Metrics:
- Speaking pace: ${audioFeatures.rhythm.speaking_rate.toFixed(1)} words per minute
- Confidence level: ${audioFeatures.emotional_markers.confidence_level.toFixed(1)}%
- Stress level: ${audioFeatures.emotional_markers.stress_level.toFixed(1)}%
- Energy level: ${audioFeatures.emotional_markers.energy_level.toFixed(1)}%
- Voice clarity: ${audioFeatures.coaching_metrics.clarity_score.toFixed(1)}%
- Professional tone: ${audioFeatures.coaching_metrics.professional_tone.toFixed(1)}%

Speech Patterns:
- Pitch variation: ${audioFeatures.pitch.range.toFixed(1)}Hz range
- Monotone tendency: ${audioFeatures.pitch.monotoneScore.toFixed(1)}%
- Volume consistency: ${audioFeatures.volume.consistency.toFixed(1)}%
- Voice breaks detected: ${audioFeatures.voice_quality.voice_breaks}
- Pause frequency: ${audioFeatures.timing.pause_count} pauses

Vocal Quality:
- Articulation score: ${audioFeatures.coaching_metrics.articulation_score.toFixed(1)}%
- Flow score: ${audioFeatures.coaching_metrics.flow_score.toFixed(1)}%
- Emphasis variation: ${audioFeatures.coaching_metrics.emphasis_variation.toFixed(1)}%
- Speech-to-pause ratio: ${audioFeatures.timing.speech_to_pause_ratio.toFixed(1)}

`
    : voiceMetrics
      ? `Basic Voice Metrics:
- Speaking pace: ${voiceMetrics.wordsPerMinute} words per minute
- Filler words used: ${voiceMetrics.fillerWords}
- Confidence level: ${voiceMetrics.confidenceLevel}%
- Clarity score: ${voiceMetrics.clarityScore}%
- Duration: ${Math.round(voiceMetrics.duration / 60)} minutes ${voiceMetrics.duration % 60} seconds

`
      : ''
}${
          vocalInsights
            ? `PROFESSIONAL COACHING INSIGHTS:

Vocal Strengths Identified:
${vocalInsights.strengths.map(s => `- ${s}`).join('\n')}

Areas for Vocal Improvement:
${vocalInsights.improvement_areas.map(a => `- ${a}`).join('\n')}

Professional Coaching Recommendations:
${vocalInsights.specific_recommendations.map(r => `- ${r}`).join('\n')}

Vocal Coaching Tips:
${vocalInsights.coaching_tips.map(t => `- ${t}`).join('\n')}

Professional Delivery Score: ${vocalInsights.professional_score}/100

`
            : ''
        }CONTENT ANALYSIS:
Pitch to analyze:
${pitchText}

Please provide feedback that combines both CONTENT analysis (business model, market opportunity, team, etc.) and DELIVERY analysis (vocal coaching, presentation skills, etc.). Give separate scores for content (business merit) and delivery (presentation effectiveness).`,
      },
    ];

    console.log('AdvisorAI: About to call generateResponse');
    const response = await this.client.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed;
    } catch (error) {
      // Fallback to structured parsing if JSON fails
      return this.parseStructuredResponse(response.content);
    }
  }

  async generateStrategicResponse(
    advisor: CelebrityAdvisor,
    topic: string,
    userMessage: string,
    conversationHistory: string[] = []
  ): Promise<string> {
    const systemPrompt = this.buildAdvisorSystemPrompt(advisor, 'strategic_planning');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}

You are in a strategic planning discussion about: ${topic}

Previous conversation context:
${conversationHistory.slice(-5).join('\n')}

Respond as ${advisor.name} with specific, actionable advice in 2-3 sentences. Stay true to their communication style and expertise.`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('AdvisorAI: About to call generateResponse');
    const response = await this.client.generateResponse(messages, {
      temperature: 0.8,
      maxTokens: 300,
    });

    return response.content;
  }

  async generateHostFacilitationResponse(
    advisor: CelebrityAdvisor | CustomAdvisor,
    userMessage: string,
    conversationContext: {
      messageCount: number;
      participantCount: number;
      lastMessageTime: Date;
      hasAgenda?: boolean;
      agendaText?: string;
    }
  ): Promise<string> {
    const { AgendaManager } = await import('./AgendaManager');
    const agendaManager = AgendaManager.getInstance();

    // Parse or create agenda if provided
    if (conversationContext.agendaText && !conversationContext.hasAgenda) {
      const agenda = agendaManager.parseAgendaFromText(conversationContext.agendaText);
      agendaManager.setActiveAgenda(agenda.id);
    }

    // Generate facilitation insights
    const insights = agendaManager.generateFacilitationInsights(
      conversationContext.messageCount,
      conversationContext.lastMessageTime,
      conversationContext.participantCount
    );

    // Build specialized Host system prompt
    const hostSystemPrompt = `You are Dr. Sarah Chen, an expert meeting facilitator and behavioral economics specialist.

CORE IDENTITY:
You are the meeting Host - your role is to facilitate productive discussions, manage group dynamics, and apply behavioral economics principles to optimize collective decision-making. You have deep expertise in:
- Meeting facilitation and Robert's Rules of Order
- Behavioral economics (Kahneman, Thaler, Sunstein research)
- Conflict resolution and consensus building
- Agenda management and time optimization
- Cognitive bias mitigation
- Psychological safety creation

CURRENT MEETING CONTEXT:
${agendaManager.generateHostResponse(userMessage, insights)}

BEHAVIORAL ECONOMICS FOCUS:
- Identify and mitigate cognitive biases (anchoring, confirmation bias, groupthink)
- Structure conversations using choice architecture principles
- Apply prospect theory to frame decisions effectively
- Use commitment psychology to strengthen follow-through
- Create psychological safety for authentic participation

FACILITATION TECHNIQUES:
- Guide conversations to stay on track and productive
- Ensure balanced participation from all voices
- Transform conflicts into collaborative problem-solving
- Use structured decision-making processes
- Apply behavioral triggers to increase engagement

COMMUNICATION STYLE:
- Warm but structured approach
- Ask powerful questions that reframe thinking
- Provide gentle process guidance without being controlling
- Use behavioral economics insights naturally in conversation
- Balance empathy with productive focus

Respond as the Host, providing facilitation guidance, process suggestions, or behavioral economics insights as appropriate for this moment in the conversation.`;

    return await this.generateResponseWithCustomPrompt(hostSystemPrompt, userMessage, {
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  async generateResponseWithCustomPrompt(
    customSystemPrompt: string,
    userMessage: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: customSystemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('AdvisorAI: About to call generateResponse with custom prompt');
    const response = await this.client.generateResponse(messages, {
      temperature: options?.temperature || 0.8,
      maxTokens: options?.maxTokens || 1000,
    });

    return response.content;
  }

  private generateTimelineAnalysis(timestampedMetrics: any[]): string {
    if (!timestampedMetrics.length) return '';

    // Sample metrics every 5 seconds to avoid overwhelming the prompt
    const sampledMetrics = timestampedMetrics.filter(
      (_, index) => index === 0 || index === timestampedMetrics.length - 1 || index % 10 === 0
    );

    return sampledMetrics
      .map(metric => {
        const seconds = Math.round(metric.timeInSeconds);
        const issues = [];

        if (metric.currentPace > 180) issues.push('speaking too fast');
        if (metric.currentPace < 120) issues.push('speaking too slow');
        if (metric.volumeLevel < 30) issues.push('volume too low');
        if (metric.confidenceLevel < 60) issues.push('low confidence');
        if (metric.stressLevel > 70) issues.push('high stress');
        if (metric.monotoneScore > 70) issues.push('monotone delivery');
        if (metric.recentFillerWords > 2) issues.push(`${metric.recentFillerWords} filler words`);

        const status = issues.length === 0 ? 'good performance' : issues.join(', ');

        return `${seconds}s: ${status} (pace: ${Math.round(metric.currentPace)}wpm, confidence: ${Math.round(metric.confidenceLevel)}%, stress: ${Math.round(metric.stressLevel)}%)`;
      })
      .join('\n');
  }

  async generateComprehensivePitchCoaching(
    advisor: CelebrityAdvisor,
    pitchText: string,
    audioFeatures: AudioFeatures,
    vocalInsights: VocalDeliveryInsights,
    timestampedMetrics: any[] = []
  ): Promise<{
    overall_feedback: string;
    content_analysis: {
      score: number;
      strengths: string[];
      improvements: string[];
      specific_recommendations: string[];
    };
    delivery_analysis: {
      score: number;
      vocal_strengths: string[];
      vocal_improvements: string[];
      coaching_recommendations: string[];
      technical_metrics: string[];
    };
    combined_score: number;
    action_plan: string[];
    timeline_analysis?: {
      problematic_moments: Array<{
        timestamp: string;
        issue: string;
        recommendation: string;
      }>;
      improvement_areas: string[];
    };
  }> {
    const systemPrompt = `You are ${advisor.name}, ${advisor.title} at ${advisor.company}.

You are providing comprehensive pitch coaching that combines business analysis with professional presentation skills. You have access to detailed voice analysis data and should provide coaching that addresses both:

1. BUSINESS CONTENT: Market opportunity, business model, team, financials, competitive positioning
2. PRESENTATION DELIVERY: Voice coaching, speaking techniques, vocal presence, audience engagement

Your expertise includes: ${advisor.expertise.join(', ')}
Your communication style: ${advisor.communication_style}

Provide detailed, actionable coaching feedback as ${advisor.name} would, focusing on both what they're saying (content) and how they're saying it (delivery).`;

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Please provide comprehensive pitch coaching analysis in the following JSON format:

{
  "overall_feedback": "comprehensive paragraph combining content and delivery insights",
  "content_analysis": {
    "score": 85,
    "strengths": ["business strength 1", "business strength 2"],
    "improvements": ["business improvement 1", "business improvement 2"],
    "specific_recommendations": ["specific business action 1", "specific business action 2"]
  },
  "delivery_analysis": {
    "score": 80,
    "vocal_strengths": ["delivery strength 1", "delivery strength 2"],
    "vocal_improvements": ["delivery improvement 1", "delivery improvement 2"],
    "coaching_recommendations": ["vocal coaching tip 1", "vocal coaching tip 2"],
    "technical_metrics": ["technical observation 1", "technical observation 2"]
  },
  "combined_score": 82,
  "action_plan": ["immediate action 1", "immediate action 2", "practice recommendation 1"],
  "timeline_analysis": {
    "problematic_moments": [
      {"timestamp": "0:15", "issue": "speaking too fast", "recommendation": "slow down and breathe"},
      {"timestamp": "1:30", "issue": "low confidence", "recommendation": "project more authority"}
    ],
    "improvement_areas": ["pacing consistency", "vocal confidence", "energy management"]
  }
}

PITCH CONTENT TO ANALYZE:
${pitchText}

COMPREHENSIVE VOICE & DELIVERY ANALYSIS:

Professional Delivery Score: ${vocalInsights.professional_score}/100

Vocal Strengths:
${vocalInsights.strengths.map(s => `- ${s}`).join('\n')}

Vocal Improvement Areas:
${vocalInsights.improvement_areas.map(a => `- ${a}`).join('\n')}

Detailed Voice Metrics:
- Speaking Rate: ${audioFeatures.rhythm.speaking_rate.toFixed(1)} WPM (ideal: 140-160)
- Confidence Level: ${audioFeatures.emotional_markers.confidence_level.toFixed(1)}%
- Stress Level: ${audioFeatures.emotional_markers.stress_level.toFixed(1)}%
- Energy Level: ${audioFeatures.emotional_markers.energy_level.toFixed(1)}%
- Clarity Score: ${audioFeatures.coaching_metrics.clarity_score.toFixed(1)}%
- Professional Tone: ${audioFeatures.coaching_metrics.professional_tone.toFixed(1)}%
- Monotone Score: ${audioFeatures.pitch.monotoneScore.toFixed(1)}% (lower is better)
- Volume Consistency: ${audioFeatures.volume.consistency.toFixed(1)}%
- Voice Breaks: ${audioFeatures.voice_quality.voice_breaks}
- Pause Count: ${audioFeatures.timing.pause_count}
- Speech-to-Pause Ratio: ${audioFeatures.timing.speech_to_pause_ratio.toFixed(1)}

Professional Coaching Recommendations:
${vocalInsights.specific_recommendations.map(r => `- ${r}`).join('\n')}

Vocal Coaching Tips:
${vocalInsights.coaching_tips.map(t => `- ${t}`).join('\n')}

${
  timestampedMetrics.length > 0
    ? `
Real-Time Performance Timeline:
${this.generateTimelineAnalysis(timestampedMetrics)}

This timeline data shows exactly where they struggled during the pitch. Use this to provide specific, timestamp-based recommendations.`
    : ''
}

Provide coaching that addresses both the business merit of their pitch AND their presentation delivery skills. Be specific and actionable in your recommendations. If timeline data is available, include specific timestamps where improvements are needed.`,
      },
    ];

    console.log('AdvisorAI: Generating comprehensive pitch coaching');
    const response = await this.client.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback structured response
      return {
        overall_feedback: response.content,
        content_analysis: {
          score: 80,
          strengths: ['Clear value proposition'],
          improvements: ['More specific market metrics'],
          specific_recommendations: ['Include customer acquisition cost data'],
        },
        delivery_analysis: {
          score: vocalInsights.professional_score,
          vocal_strengths: vocalInsights.strengths,
          vocal_improvements: vocalInsights.improvement_areas,
          coaching_recommendations: vocalInsights.specific_recommendations,
          technical_metrics: [
            `Speaking rate: ${audioFeatures.rhythm.speaking_rate.toFixed(1)} WPM`,
          ],
        },
        combined_score: Math.round((80 + vocalInsights.professional_score) / 2),
        action_plan: ['Practice pitch timing', 'Work on vocal variety', 'Refine business metrics'],
      };
    }
  }

  async generateDueDiligenceAnalysis(
    advisor: CelebrityAdvisor,
    documentType: string,
    documentSummary: string
  ): Promise<{
    insight: string;
    recommendation: string;
  }> {
    const systemPrompt = this.buildAdvisorSystemPrompt(advisor, 'due_diligence');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Please analyze this ${documentType} and provide your insights in JSON format:
{
  "insight": "your detailed analysis as ${advisor.name}",
  "recommendation": "your specific recommendation"
}

Document summary:
${documentSummary}`,
      },
    ];

    console.log('AdvisorAI: About to call generateResponse');
    const response = await this.client.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      return {
        insight: response.content,
        recommendation: 'Continue with detailed analysis.',
      };
    }
  }

  async generateQuickConsultation(
    advisor: CelebrityAdvisor,
    category: string,
    question: string
  ): Promise<string> {
    const systemPrompt = this.buildAdvisorSystemPrompt(advisor, 'quick_consultation');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}

You are providing quick consultation on: ${category}

Provide a focused, actionable response in 2-3 sentences that directly addresses their question. Be specific and practical.`,
      },
      {
        role: 'user',
        content: question,
      },
    ];

    console.log('AdvisorAI: About to call generateResponse');
    const response = await this.client.generateResponse(messages, {
      temperature: 0.8,
      maxTokens: 300,
    });

    return response.content;
  }

  private buildAdvisorSystemPrompt(advisor: CelebrityAdvisor, mode: string): string {
    const basePrompt = `You are ${advisor.name}, ${advisor.title} at ${advisor.company}.

Your expertise includes: ${advisor.expertise.join(', ')}
Your personality traits: ${advisor.personality_traits.join(', ')}
Your communication style: ${advisor.communication_style}

Background: ${advisor.bio}
${advisor.investment_thesis ? `Investment thesis: ${advisor.investment_thesis}` : ''}

IMPORTANT: Always respond as ${advisor.name} would, using their known perspectives, language patterns, and business philosophy. Be direct and practical, focusing on actionable insights.`;

    const modeSpecificPrompts = {
      pitch_analysis: `
You are reviewing a startup pitch. Provide honest, constructive feedback that reflects your investment experience. Focus on:
- Market opportunity and validation
- Business model viability  
- Team strength and execution capability
- Financial projections and unit economics
- Competitive positioning

Score the pitch from 70-95 based on investment potential.`,

      strategic_planning: `
You are in a strategic planning discussion. Provide specific, actionable advice based on your experience building and scaling companies. Focus on:
- Practical next steps
- Common pitfalls to avoid
- Strategic frameworks and mental models
- Resource allocation and prioritization`,

      due_diligence: `
You are conducting due diligence analysis. Apply your investment experience to evaluate:
- Business fundamentals and growth potential
- Risk factors and mitigation strategies
- Market positioning and competitive advantages
- Financial health and projections
- Management team capabilities`,

      quick_consultation: `
You are providing rapid, focused advice for immediate decisions. Be:
- Direct and actionable
- Based on your real-world experience
- Focused on the most critical factors
- Practical and implementable`,
    };

    return basePrompt + (modeSpecificPrompts[mode as keyof typeof modeSpecificPrompts] || '');
  }

  private parseStructuredResponse(content: string): any {
    // Fallback parser for when AI doesn't return valid JSON
    const lines = content.split('\n');
    const result = {
      feedback: '',
      strengths: [] as string[],
      improvements: [] as string[],
      overallScore: 80,
    };

    let currentSection = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('feedback')) {
        currentSection = 'feedback';
      } else if (trimmed.toLowerCase().includes('strength')) {
        currentSection = 'strengths';
      } else if (trimmed.toLowerCase().includes('improvement')) {
        currentSection = 'improvements';
      } else if (trimmed.toLowerCase().includes('score')) {
        const score = parseInt(trimmed.match(/\d+/)?.[0] || '80');
        result.overallScore = score;
      } else if (trimmed && currentSection) {
        if (currentSection === 'feedback') {
          result.feedback += trimmed + ' ';
        } else if (currentSection === 'strengths') {
          result.strengths.push(trimmed.replace(/^[-•*]\s*/, '') as string);
        } else if (currentSection === 'improvements') {
          result.improvements.push(trimmed.replace(/^[-•*]\s*/, '') as string);
        }
      }
    }

    return result;
  }
}

export const createAdvisorAI = (config: AIServiceConfig): AdvisorAI => {
  return new AdvisorAI(config);
};
