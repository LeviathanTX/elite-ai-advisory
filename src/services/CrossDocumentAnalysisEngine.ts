/**
 * Cross-Document Analysis Engine
 * Enables VC-level multi-document analysis and comparison
 */

import { createClient } from '@supabase/supabase-js';
import { SecureAIServiceClient } from './secureAIService';
import { VectorEmbeddingsService } from './VectorEmbeddingsService';
import { FinancialMetricsExtractor } from './FinancialMetricsExtractor';

export interface CrossDocumentQuery {
  queryText: string;
  queryType: QueryType;
  documentIds: string[];
  collectionId?: string;
  filters?: {
    dateRange?: { start: Date; end: Date };
    categories?: string[];
    companies?: string[];
  };
}

export type QueryType =
  | 'cross-document-comparison'
  | 'trend-analysis'
  | 'financial-analysis'
  | 'competitive-analysis'
  | 'market-research'
  | 'due-diligence'
  | 'custom';

export interface AnalysisResult {
  queryId: string;
  summary: string;
  insights: Insight[];
  comparisons: Comparison[];
  citations: Citation[];
  recommendations: string[];
  riskFactors: string[];
  confidence: number;
}

export interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'trend' | 'anomaly';
  title: string;
  description: string;
  evidence: string[];
  documentIds: string[];
  confidence: number;
}

export interface Comparison {
  aspect: string;
  documents: Array<{
    documentId: string;
    documentName: string;
    value: string | number;
    assessment: string;
  }>;
  winner?: string;
  insights: string[];
}

export interface Citation {
  documentId: string;
  documentName: string;
  chunkId?: string;
  content: string;
  context: string;
  relevance: number;
}

export class CrossDocumentAnalysisEngine {
  private supabaseUrl: string;
  private supabaseKey: string;
  private aiClient: SecureAIServiceClient;
  private vectorService: VectorEmbeddingsService;
  private financialExtractor: FinancialMetricsExtractor;

  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    aiClient: SecureAIServiceClient;
    vectorService: VectorEmbeddingsService;
    financialExtractor: FinancialMetricsExtractor;
  }) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.aiClient = config.aiClient;
    this.vectorService = config.vectorService;
    this.financialExtractor = config.financialExtractor;
  }

  /**
   * Perform cross-document analysis
   */
  async analyze(query: CrossDocumentQuery): Promise<AnalysisResult> {
    try {
      // Get document content and metadata
      const documents = await this.fetchDocuments(query.documentIds);

      // Perform semantic search across documents
      const relevantChunks = await this.vectorService.semanticSearch(query.queryText, {
        filterDocumentIds: query.documentIds,
        matchThreshold: 0.65,
        matchCount: 50,
      });

      // Extract and compare financial metrics if applicable
      let financialAnalysis = null;
      if (query.queryType === 'financial-analysis' || query.queryType === 'due-diligence') {
        financialAnalysis = await this.financialExtractor.generateFinancialAnalysis(
          query.documentIds
        );
      }

      // Build comprehensive analysis context
      const analysisContext = this.buildAnalysisContext(
        documents,
        relevantChunks,
        financialAnalysis
      );

      // Generate AI-powered analysis
      const analysis = await this.generateAnalysis(query, analysisContext);

      // Store query and results for caching
      const queryId = await this.storeAnalysisQuery(query, analysis);

      return {
        queryId,
        ...analysis,
      };
    } catch (error) {
      console.error('Error in cross-document analysis:', error);
      throw error;
    }
  }

  /**
   * Compare specific aspects across multiple documents
   */
  async compareDocuments(
    documentIds: string[],
    aspects: string[]
  ): Promise<{
    comparisons: Comparison[];
    overallAssessment: string;
    rankings: Array<{ documentId: string; score: number; reasoning: string }>;
  }> {
    try {
      const documents = await this.fetchDocuments(documentIds);

      const systemPrompt = `You are a senior VC partner conducting comparative analysis of multiple investment opportunities.

Compare the provided documents across the specified aspects and return analysis in this JSON format:

{
  "comparisons": [
    {
      "aspect": "Market Opportunity",
      "documents": [
        {
          "documentId": "doc-123",
          "documentName": "Company A Pitch",
          "value": "10B TAM",
          "assessment": "Large market with clear entry strategy"
        }
      ],
      "winner": "doc-123",
      "insights": ["Insight about this aspect"]
    }
  ],
  "overallAssessment": "Executive summary of comparative analysis",
  "rankings": [
    {
      "documentId": "doc-123",
      "score": 85,
      "reasoning": "Strong fundamentals across all dimensions"
    }
  ]
}

Be specific, data-driven, and provide actionable insights. Focus on differentiators and relative strengths/weaknesses.`;

      const documentsContext = documents
        .map(
          doc => `
### Document: ${doc.filename} (ID: ${doc.id})
Category: ${doc.category}
${doc.metadata?.companyName ? `Company: ${doc.metadata.companyName}` : ''}

Content:
${doc.content_text.substring(0, 5000)}...
`
        )
        .join('\n\n---\n\n');

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Compare these documents across the following aspects: ${aspects.join(', ')}

Documents to compare:
${documentsContext}`,
          },
        ],
        { temperature: 0.3, maxTokens: 3000 }
      );

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error comparing documents:', error);
      throw error;
    }
  }

  /**
   * Analyze trends across documents over time
   */
  async analyzeTrends(
    documentIds: string[],
    focusAreas: string[]
  ): Promise<{
    trends: Array<{
      area: string;
      direction: 'improving' | 'declining' | 'stable' | 'volatile';
      dataPoints: Array<{ period: string; value: string; source: string }>;
      insights: string[];
    }>;
    forecast: string;
    recommendations: string[];
  }> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Get documents with dates
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .in('id', documentIds)
        .order('document_date', { ascending: true });

      if (error) throw error;

      // Get financial metrics over time
      const metricComparisons = await this.financialExtractor.compareMetrics(documentIds);

      const systemPrompt = `You are a VC analyst specialized in trend analysis and forecasting.

Analyze trends across multiple documents/time periods and return analysis in this JSON format:

{
  "trends": [
    {
      "area": "Revenue Growth",
      "direction": "improving",
      "dataPoints": [
        {"period": "Q1 2023", "value": "$100K MRR", "source": "Q1 Pitch Deck"}
      ],
      "insights": ["Growth accelerating due to product-market fit"]
    }
  ],
  "forecast": "Forward-looking assessment based on trends",
  "recommendations": ["Strategic recommendation 1", "Strategic recommendation 2"]
}

Focus on: momentum, inflection points, leading indicators, and trajectory sustainability.`;

      const context = {
        documents: documents?.map(d => ({
          id: d.id,
          filename: d.filename,
          date: d.document_date,
          category: d.category,
        })),
        metrics: metricComparisons,
        focusAreas,
      };

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze trends in these focus areas: ${focusAreas.join(', ')}

Context:
${JSON.stringify(context, null, 2)}`,
          },
        ],
        { temperature: 0.4, maxTokens: 2500 }
      );

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive due diligence analysis
   */
  async conductDueDiligence(collectionId: string): Promise<{
    executiveSummary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    financialAssessment: any;
    teamAssessment: string;
    marketAssessment: string;
    productAssessment: string;
    competitivePosition: string;
    investmentRecommendation: {
      decision: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
      reasoning: string;
      conditions?: string[];
    };
    keyQuestions: string[];
    redFlags: string[];
  }> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Get all documents in collection
      const { data: collectionDocs, error } = await supabase
        .from('collection_documents')
        .select('document_id')
        .eq('collection_id', collectionId);

      if (error) throw error;

      const documentIds = collectionDocs.map(d => d.document_id);
      const documents = await this.fetchDocuments(documentIds);

      // Get financial analysis
      const financialAssessment =
        await this.financialExtractor.generateFinancialAnalysis(documentIds);

      // Build comprehensive due diligence context
      const ddContext = documents
        .map(
          doc => `
## ${doc.filename} (${doc.category})
${doc.content_text.substring(0, 3000)}...
`
        )
        .join('\n\n');

      const systemPrompt = `You are a top-tier VC partner conducting comprehensive due diligence.

Analyze ALL provided documents and return a thorough due diligence report in this JSON format:

{
  "executiveSummary": "3-paragraph executive summary",
  "strengths": ["Key strength 1", "Key strength 2"],
  "weaknesses": ["Key weakness 1", "Key weakness 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "teamAssessment": "Assessment of founding team and key hires",
  "marketAssessment": "TAM/SAM/SOM analysis and market dynamics",
  "productAssessment": "Product-market fit and differentiation",
  "competitivePosition": "Competitive landscape and defensibility",
  "investmentRecommendation": {
    "decision": "strong-yes|yes|maybe|no|strong-no",
    "reasoning": "Detailed reasoning for recommendation",
    "conditions": ["Condition 1 if maybe/yes"]
  },
  "keyQuestions": ["Diligence question 1", "Diligence question 2"],
  "redFlags": ["Red flag 1 if any"]
}

Apply rigorous VC evaluation frameworks. Be thorough, objective, and data-driven.`;

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Conduct comprehensive due diligence on this company.

Documents:
${ddContext}

Financial Analysis:
${JSON.stringify(financialAssessment, null, 2)}`,
          },
        ],
        { temperature: 0.2, maxTokens: 4000 }
      );

      const assessment = JSON.parse(response.content);

      return {
        ...assessment,
        financialAssessment,
      };
    } catch (error) {
      console.error('Error conducting due diligence:', error);
      throw error;
    }
  }

  /**
   * Find contradictions and inconsistencies across documents
   */
  async findContradictions(documentIds: string[]): Promise<{
    contradictions: Array<{
      aspect: string;
      conflictingClaims: Array<{
        documentId: string;
        documentName: string;
        claim: string;
        citation: string;
      }>;
      severity: 'critical' | 'high' | 'medium' | 'low';
      explanation: string;
    }>;
    consistencyScore: number;
  }> {
    try {
      const documents = await this.fetchDocuments(documentIds);

      const systemPrompt = `You are a due diligence analyst specialized in finding inconsistencies and contradictions.

Compare documents and identify any conflicting information. Return analysis in this JSON format:

{
  "contradictions": [
    {
      "aspect": "Revenue figures for Q4 2023",
      "conflictingClaims": [
        {
          "documentId": "doc-1",
          "documentName": "Pitch Deck",
          "claim": "$500K MRR",
          "citation": "Slide 8: Revenue Metrics"
        },
        {
          "documentId": "doc-2",
          "documentName": "Financial Statements",
          "claim": "$450K MRR",
          "citation": "Income Statement, Q4 2023"
        }
      ],
      "severity": "high",
      "explanation": "10% discrepancy in reported revenue requires clarification"
    }
  ],
  "consistencyScore": 85
}

Flag discrepancies in: financial metrics, timeline/dates, team composition, market size, customer counts, product features, etc.`;

      const context = documents
        .map(
          doc => `
### ${doc.filename} (ID: ${doc.id})
${doc.content_text.substring(0, 4000)}...
`
        )
        .join('\n\n---\n\n');

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Find contradictions and inconsistencies across these documents:\n\n${context}`,
          },
        ],
        { temperature: 0.1, maxTokens: 3000 }
      );

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error finding contradictions:', error);
      throw error;
    }
  }

  /**
   * Fetch documents from database
   */
  private async fetchDocuments(documentIds: string[]): Promise<any[]> {
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);

    const { data, error } = await supabase.from('documents').select('*').in('id', documentIds);

    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Build analysis context from documents and chunks
   */
  private buildAnalysisContext(
    documents: any[],
    relevantChunks: any[],
    financialAnalysis: any
  ): string {
    let context = '# DOCUMENTS UNDER ANALYSIS\n\n';

    // Add document summaries
    for (const doc of documents) {
      context += `## ${doc.filename}\n`;
      context += `- Category: ${doc.category}\n`;
      if (doc.company_name) context += `- Company: ${doc.company_name}\n`;
      if (doc.document_date) context += `- Date: ${doc.document_date}\n`;
      context += '\n';
    }

    // Add relevant content chunks
    context += '\n# RELEVANT CONTENT\n\n';
    for (const chunk of relevantChunks.slice(0, 20)) {
      context += `### From: ${chunk.documentName} (Similarity: ${(chunk.similarity * 100).toFixed(1)}%)\n`;
      context += `${chunk.content}\n\n`;
    }

    // Add financial analysis if available
    if (financialAnalysis) {
      context += '\n# FINANCIAL ANALYSIS\n\n';
      context += `## Summary\n${financialAnalysis.summary}\n\n`;
      context += `## Key Insights\n${financialAnalysis.keyInsights.join('\n')}\n\n`;
      context += `## Risk Assessment\n${financialAnalysis.riskAssessment}\n\n`;
    }

    return context;
  }

  /**
   * Generate AI-powered analysis
   */
  private async generateAnalysis(
    query: CrossDocumentQuery,
    context: string
  ): Promise<Omit<AnalysisResult, 'queryId'>> {
    const systemPrompt = this.getAnalysisPrompt(query.queryType);

    const response = await this.aiClient.generateResponse(
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${query.queryText}\n\nContext:\n${context}`,
        },
      ],
      { temperature: 0.3, maxTokens: 3000 }
    );

    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: response.content,
        insights: [],
        comparisons: [],
        citations: [],
        recommendations: [],
        riskFactors: [],
        confidence: 0.7,
      };
    }
  }

  /**
   * Get analysis prompt based on query type
   */
  private getAnalysisPrompt(queryType: QueryType): string {
    const basePrompt = `You are an elite VC analyst with deep expertise in evaluating startups and investment opportunities.

Provide comprehensive analysis in the following JSON format:

{
  "summary": "Executive summary of analysis",
  "insights": [
    {
      "type": "strength|weakness|opportunity|threat|trend|anomaly",
      "title": "Brief title",
      "description": "Detailed description",
      "evidence": ["Evidence point 1", "Evidence point 2"],
      "documentIds": ["doc-id-1"],
      "confidence": 0.9
    }
  ],
  "comparisons": [
    {
      "aspect": "What is being compared",
      "documents": [
        {
          "documentId": "doc-1",
          "documentName": "Doc name",
          "value": "Comparable value",
          "assessment": "Assessment of this value"
        }
      ],
      "winner": "doc-id",
      "insights": ["Insight from comparison"]
    }
  ],
  "citations": [
    {
      "documentId": "doc-1",
      "documentName": "Doc name",
      "content": "Quoted text",
      "context": "Surrounding context",
      "relevance": 0.95
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "confidence": 0.85
}`;

    const typeSpecificPrompts: Record<QueryType, string> = {
      'cross-document-comparison': `${basePrompt}\n\nFocus on: comparing key metrics, strategies, and approaches across documents. Identify best practices and gaps.`,

      'trend-analysis': `${basePrompt}\n\nFocus on: identifying patterns over time, growth trajectories, momentum indicators, and forecasting future direction.`,

      'financial-analysis': `${basePrompt}\n\nFocus on: unit economics, burn rate, runway, revenue growth, profitability path, capital efficiency, and financial sustainability.`,

      'competitive-analysis': `${basePrompt}\n\nFocus on: competitive positioning, differentiation, market share, competitive advantages, and strategic moats.`,

      'market-research': `${basePrompt}\n\nFocus on: TAM/SAM/SOM, market dynamics, customer segments, market trends, entry barriers, and growth potential.`,

      'due-diligence': `${basePrompt}\n\nFocus on: comprehensive evaluation across team, market, product, traction, financials, and risks. Apply rigorous VC frameworks.`,

      custom: basePrompt,
    };

    return typeSpecificPrompts[queryType] || basePrompt;
  }

  /**
   * Store analysis query and results
   */
  private async storeAnalysisQuery(
    query: CrossDocumentQuery,
    results: Omit<AnalysisResult, 'queryId'>
  ): Promise<string> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const { data, error } = await supabase
        .from('analysis_queries')
        .insert({
          query_text: query.queryText,
          query_type: query.queryType,
          document_ids: query.documentIds,
          collection_id: query.collectionId,
          results: results,
          insights: results.insights,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error storing analysis query:', error);
      throw error;
    }
  }
}

/**
 * Create cross-document analysis engine instance
 */
export const createCrossDocumentAnalysisEngine = (config: {
  supabaseUrl: string;
  supabaseKey: string;
  aiClient: SecureAIServiceClient;
  vectorService: VectorEmbeddingsService;
  financialExtractor: FinancialMetricsExtractor;
}): CrossDocumentAnalysisEngine => {
  return new CrossDocumentAnalysisEngine(config);
};
