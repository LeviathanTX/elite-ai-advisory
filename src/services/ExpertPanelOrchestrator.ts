/**
 * Expert Panel Orchestrator
 * Coordinates multiple advisors for deep document analysis with cross-referencing and debate
 */

import { Message, CelebrityAdvisor, CustomAdvisor, DocumentReference } from '../types';
import { AdvisorAI } from './advisorAI';
import { CrossDocumentAnalysisEngine, AnalysisResult } from './CrossDocumentAnalysisEngine';
import { EnhancedDocumentAnalyzer } from './EnhancedDocumentAnalyzer';
import { DocumentStorage } from './DocumentStorage';

export interface ExpertPanelConfig {
  advisors: Array<CelebrityAdvisor | CustomAdvisor>;
  documents: Array<{
    id: string;
    filename: string;
    content: string;
    metadata?: any;
  }>;
  mode: 'pitch_practice' | 'strategic_planning' | 'due_diligence' | 'quick_consultation';
  enableDebate?: boolean;
  enableCrossReferencing?: boolean;
}

export interface PanelResponse {
  documentInsights: AnalysisResult | null;
  advisorResponses: Array<{
    advisor: CelebrityAdvisor | CustomAdvisor;
    response: string;
    documentReferences: string[];
    keyPoints: string[];
  }>;
  synthesis?: string;
  debates?: Array<{
    topic: string;
    participants: string[];
    points: string[];
  }>;
}

export class ExpertPanelOrchestrator {
  private advisorAI: AdvisorAI;
  private documentAnalyzer: EnhancedDocumentAnalyzer | null = null;
  private crossDocEngine: CrossDocumentAnalysisEngine | null = null;

  constructor(
    advisorAI: AdvisorAI,
    documentAnalyzer?: EnhancedDocumentAnalyzer,
    crossDocEngine?: CrossDocumentAnalysisEngine
  ) {
    this.advisorAI = advisorAI;
    this.documentAnalyzer = documentAnalyzer || null;
    this.crossDocEngine = crossDocEngine || null;
  }

  /**
   * Orchestrate a panel discussion with deep document analysis
   */
  async orchestratePanel(
    userMessage: string,
    config: ExpertPanelConfig,
    conversationHistory: Message[]
  ): Promise<PanelResponse> {
    try {
      // Step 1: Perform comprehensive document analysis first
      const documentInsights = await this.performDocumentAnalysis(
        userMessage,
        config.documents,
        config.mode
      );

      // Step 2: Prepare enriched context for each advisor
      const enrichedContext = this.prepareEnrichedContext(
        userMessage,
        documentInsights,
        config.documents,
        conversationHistory
      );

      // Step 3: Get responses from each advisor with document insights
      const advisorResponses = await this.collectAdvisorResponses(
        enrichedContext,
        config.advisors,
        config.mode,
        conversationHistory
      );

      // Step 4: If debate enabled, facilitate cross-advisor discussion
      let debates: PanelResponse['debates'] = undefined;
      if (config.enableDebate && advisorResponses.length > 1) {
        debates = await this.facilitateDebate(
          userMessage,
          advisorResponses,
          documentInsights,
          config.advisors
        );
      }

      // Step 5: Generate synthesis if multiple advisors
      let synthesis: string | undefined;
      if (config.advisors.length > 1) {
        synthesis = await this.generateSynthesis(advisorResponses, documentInsights, debates);
      }

      return {
        documentInsights,
        advisorResponses,
        synthesis,
        debates,
      };
    } catch (error) {
      console.error('Expert panel orchestration error:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive document analysis using available tools
   */
  private async performDocumentAnalysis(
    query: string,
    documents: ExpertPanelConfig['documents'],
    mode: ExpertPanelConfig['mode']
  ): Promise<AnalysisResult | null> {
    try {
      // If no documents, skip analysis
      if (!documents || documents.length === 0) {
        return null;
      }

      // If CrossDocumentAnalysisEngine is available, use it
      if (this.crossDocEngine && documents.length > 1) {
        const documentIds = documents.map(d => d.id);

        // Determine query type based on mode
        let queryType: 'due-diligence' | 'financial-analysis' | 'competitive-analysis' | 'custom';
        switch (mode) {
          case 'due_diligence':
            queryType = 'due-diligence';
            break;
          case 'strategic_planning':
            queryType = 'competitive-analysis';
            break;
          case 'pitch_practice':
            queryType = 'financial-analysis';
            break;
          default:
            queryType = 'custom';
        }

        const result = await this.crossDocEngine.analyze({
          queryText: query,
          queryType,
          documentIds,
        });

        return result;
      }

      // Fallback: Use EnhancedDocumentAnalyzer for basic analysis
      if (this.documentAnalyzer) {
        const insights = await this.documentAnalyzer.analyzeMultipleDocuments({
          documentIds: documents.map(d => d.id),
          analysisType: 'due-diligence',
        });

        // Convert to AnalysisResult format
        return {
          queryId: `analysis-${Date.now()}`,
          summary: insights.summary || 'Document analysis completed',
          insights: [],
          comparisons: [],
          citations: [],
          recommendations: insights.recommendations || [],
          riskFactors: [],
          confidence: 0.8,
        };
      }

      // No analysis tools available
      return null;
    } catch (error) {
      console.error('Document analysis error:', error);
      return null;
    }
  }

  /**
   * Prepare enriched context with document insights for advisors
   */
  private prepareEnrichedContext(
    userMessage: string,
    documentInsights: AnalysisResult | null,
    documents: ExpertPanelConfig['documents'],
    conversationHistory: Message[]
  ): string {
    let context = `USER QUESTION: ${userMessage}\n\n`;

    // Add document analysis insights
    if (documentInsights) {
      context += `COMPREHENSIVE DOCUMENT ANALYSIS:\n\n`;
      context += `Summary: ${documentInsights.summary}\n\n`;

      if (documentInsights.insights && documentInsights.insights.length > 0) {
        context += `Key Insights:\n`;
        documentInsights.insights.forEach((insight, i) => {
          context += `${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}\n`;
          context += `   ${insight.description}\n`;
          if (insight.evidence && insight.evidence.length > 0) {
            context += `   Evidence: ${insight.evidence.join('; ')}\n`;
          }
        });
        context += `\n`;
      }

      if (documentInsights.comparisons && documentInsights.comparisons.length > 0) {
        context += `Cross-Document Comparisons:\n`;
        documentInsights.comparisons.forEach((comp, i) => {
          context += `${i + 1}. ${comp.aspect}:\n`;
          comp.documents.forEach(doc => {
            context += `   - ${doc.documentName}: ${doc.value} (${doc.assessment})\n`;
          });
          if (comp.insights && comp.insights.length > 0) {
            context += `   Insights: ${comp.insights.join('; ')}\n`;
          }
        });
        context += `\n`;
      }

      if (documentInsights.recommendations && documentInsights.recommendations.length > 0) {
        context += `Recommendations:\n`;
        documentInsights.recommendations.forEach((rec, i) => {
          context += `${i + 1}. ${rec}\n`;
        });
        context += `\n`;
      }

      if (documentInsights.riskFactors && documentInsights.riskFactors.length > 0) {
        context += `Risk Factors:\n`;
        documentInsights.riskFactors.forEach((risk, i) => {
          context += `${i + 1}. ${risk}\n`;
        });
        context += `\n`;
      }
    }

    // Add document summaries
    if (documents && documents.length > 0) {
      context += `AVAILABLE DOCUMENTS (${documents.length}):\n`;
      documents.forEach((doc, i) => {
        context += `${i + 1}. ${doc.filename}\n`;
        // Include first 500 chars as preview
        const preview = doc.content.substring(0, 500);
        context += `   Preview: ${preview}${doc.content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    context += `\nBased on the comprehensive analysis above, provide your expert perspective on the user's question. Reference specific insights, comparisons, and documents in your response.`;

    return context;
  }

  /**
   * Collect responses from all advisors with enriched context
   */
  private async collectAdvisorResponses(
    enrichedContext: string,
    advisors: Array<CelebrityAdvisor | CustomAdvisor>,
    mode: ExpertPanelConfig['mode'],
    conversationHistory: Message[]
  ): Promise<PanelResponse['advisorResponses']> {
    const responses: PanelResponse['advisorResponses'] = [];

    // Collect responses in parallel for efficiency
    const responsePromises = advisors.map(async advisor => {
      try {
        // Build system prompt for the advisor
        const systemPrompt =
          advisor.system_prompt ||
          `You are ${advisor.name}, ${(advisor as any).title || 'advisor'}${(advisor as any).company ? ` at ${(advisor as any).company}` : ''}.
Expertise: ${advisor.expertise.join(', ')}
Communication style: ${(advisor as any).communication_style || 'professional'}

Provide expert insights based on your background and expertise.`;

        // Convert Message[] to conversationHistory format expected by generateResponseWithCustomPrompt
        const historyForAI = conversationHistory.map(msg => ({
          role: (msg.role === 'advisor' ? 'assistant' : msg.role) as 'user' | 'assistant',
          content: msg.content,
        }));

        const response = await this.advisorAI.generateResponseWithCustomPrompt(
          systemPrompt,
          enrichedContext,
          {
            conversationHistory: historyForAI,
            temperature: 0.8,
            maxTokens: 2000,
          }
        );

        // Extract document references (simple heuristic: look for document names)
        const documentReferences: string[] = [];

        // Extract key points (first sentence of each paragraph)
        const keyPoints = response
          .split('\n\n')
          .filter(p => p.trim().length > 0)
          .map(p => p.split('.')[0])
          .filter(p => p.length > 20 && p.length < 200)
          .slice(0, 5);

        return {
          advisor,
          response,
          documentReferences,
          keyPoints,
        };
      } catch (error) {
        console.error(`Error getting response from ${advisor.name}:`, error);
        return {
          advisor,
          response: `I apologize, but I'm having trouble formulating my response at the moment.`,
          documentReferences: [],
          keyPoints: [],
        };
      }
    });

    const results = await Promise.all(responsePromises);
    responses.push(...results);

    return responses;
  }

  /**
   * Facilitate debate between advisors on key points
   */
  private async facilitateDebate(
    userMessage: string,
    advisorResponses: PanelResponse['advisorResponses'],
    documentInsights: AnalysisResult | null,
    advisors: Array<CelebrityAdvisor | CustomAdvisor>
  ): Promise<PanelResponse['debates']> {
    try {
      // Identify points of disagreement or different perspectives
      const debates: PanelResponse['debates'] = [];

      // Extract key themes from responses
      const themes = this.extractDebateThemes(advisorResponses);

      // For each theme, facilitate a brief debate round
      for (const theme of themes.slice(0, 2)) {
        // Limit to 2 debates to avoid token overload
        const debatePrompt = this.buildDebatePrompt(
          theme,
          advisorResponses,
          userMessage,
          documentInsights
        );

        // Get counter-points from other advisors
        const counterPoints: string[] = [];
        for (const advisor of advisors.slice(0, 3)) {
          // Limit to 3 advisors
          try {
            // Build system prompt for the advisor
            const systemPrompt =
              advisor.system_prompt ||
              `You are ${advisor.name}, ${(advisor as any).title || 'advisor'}${(advisor as any).company ? ` at ${(advisor as any).company}` : ''}.
Expertise: ${advisor.expertise.join(', ')}

Provide your perspective on this debate topic.`;

            const counterPoint = await this.advisorAI.generateResponseWithCustomPrompt(
              systemPrompt,
              debatePrompt,
              {
                temperature: 0.8,
                maxTokens: 500,
              }
            );
            counterPoints.push(`${advisor.name}: ${counterPoint.substring(0, 300)}`);
          } catch (error) {
            console.error(`Debate error for ${advisor.name}:`, error);
          }
        }

        if (counterPoints.length > 0) {
          debates.push({
            topic: theme,
            participants: advisors.slice(0, 3).map(a => a.name),
            points: counterPoints,
          });
        }
      }

      return debates.length > 0 ? debates : undefined;
    } catch (error) {
      console.error('Debate facilitation error:', error);
      return undefined;
    }
  }

  /**
   * Extract key debate themes from advisor responses
   */
  private extractDebateThemes(responses: PanelResponse['advisorResponses']): string[] {
    const themes: string[] = [];

    // Simple heuristic: Look for contrasting keywords/phrases
    const keywords = ['however', 'but', 'disagree', 'alternatively', 'different perspective'];

    for (const response of responses) {
      for (const keyword of keywords) {
        if (response.response.toLowerCase().includes(keyword)) {
          // Extract the sentence containing the keyword
          const sentences = response.response.split(/[.!?]/);
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyword)) {
              themes.push(sentence.trim().substring(0, 100));
              break;
            }
          }
        }
      }
    }

    // Deduplicate and return top themes
    return Array.from(new Set(themes)).slice(0, 3);
  }

  /**
   * Build debate prompt for advisors
   */
  private buildDebatePrompt(
    theme: string,
    responses: PanelResponse['advisorResponses'],
    userMessage: string,
    documentInsights: AnalysisResult | null
  ): string {
    let prompt = `DEBATE TOPIC: ${theme}\n\n`;
    prompt += `ORIGINAL QUESTION: ${userMessage}\n\n`;

    if (documentInsights) {
      prompt += `KEY EVIDENCE FROM DOCUMENTS:\n${documentInsights.summary}\n\n`;
    }

    prompt += `OTHER ADVISORS' PERSPECTIVES:\n`;
    responses.forEach((r, i) => {
      prompt += `${i + 1}. ${r.advisor.name}: ${r.keyPoints[0] || r.response.substring(0, 200)}\n`;
    });

    prompt += `\nProvide your counter-argument or supporting perspective on this theme. Be specific and cite document evidence where applicable. Keep your response concise (2-3 sentences).`;

    return prompt;
  }

  /**
   * Generate synthesis of all advisor perspectives
   */
  private async generateSynthesis(
    advisorResponses: PanelResponse['advisorResponses'],
    documentInsights: AnalysisResult | null,
    debates: PanelResponse['debates']
  ): Promise<string> {
    try {
      let synthesis = '## Panel Summary\n\n';

      // Summarize document insights
      if (documentInsights) {
        synthesis += `**Document Analysis:** ${documentInsights.summary}\n\n`;
      }

      // Summarize advisor perspectives
      synthesis += `**Expert Perspectives:**\n\n`;
      advisorResponses.forEach(response => {
        const shortSummary = response.keyPoints[0] || response.response.substring(0, 200);
        synthesis += `- **${response.advisor.name}:** ${shortSummary}\n`;
      });

      // Summarize debates
      if (debates && debates.length > 0) {
        synthesis += `\n**Key Debates:**\n\n`;
        debates.forEach(debate => {
          synthesis += `- **${debate.topic}**\n`;
          debate.points.forEach(point => {
            synthesis += `  - ${point}\n`;
          });
        });
      }

      // Add consensus/conclusion
      synthesis += `\n**Consensus:** `;

      // Find common themes across responses
      const commonThemes = this.findCommonThemes(advisorResponses);
      if (commonThemes.length > 0) {
        synthesis += `The panel generally agrees on: ${commonThemes.join(', ')}.`;
      } else {
        synthesis += `The panel offers diverse perspectives worth considering.`;
      }

      return synthesis;
    } catch (error) {
      console.error('Synthesis generation error:', error);
      return "## Panel Summary\n\nThe expert panel has provided diverse perspectives on your question. Please review each advisor's detailed response above.";
    }
  }

  /**
   * Find common themes across advisor responses
   */
  private findCommonThemes(responses: PanelResponse['advisorResponses']): string[] {
    // Simple heuristic: Find common keywords/phrases
    const allWords = responses.flatMap(r =>
      r.response
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 5)
    );

    const wordCounts = new Map<string, number>();
    for (const word of allWords) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    // Find words that appear in multiple responses
    const commonWords = Array.from(wordCounts.entries())
      .filter(([word, count]) => count >= Math.min(responses.length, 3))
      .map(([word]) => word)
      .slice(0, 5);

    return commonWords;
  }
}
