/**
 * Enhanced Document Analyzer
 * Unified API for VC-level multi-document analysis capabilities
 *
 * This service integrates all advanced document analysis features including:
 * - Vector-based semantic search
 * - Financial metrics extraction and comparison
 * - Cross-document analysis and comparison
 * - Document relationship tracking
 * - VC framework-based analysis
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SecureAIServiceClient, createSecureAIClient } from './secureAIService';
import { VectorEmbeddingsService, createVectorEmbeddingsService } from './VectorEmbeddingsService';
import {
  FinancialMetricsExtractor,
  createFinancialMetricsExtractor,
  FinancialSummary,
  MetricComparison,
} from './FinancialMetricsExtractor';
import {
  CrossDocumentAnalysisEngine,
  createCrossDocumentAnalysisEngine,
  CrossDocumentQuery,
  AnalysisResult,
} from './CrossDocumentAnalysisEngine';
import {
  DocumentRelationshipTracker,
  createDocumentRelationshipTracker,
  DocumentNetwork,
} from './DocumentRelationshipTracker';
import { VCAnalysisFramework, VCFramework } from './VCAnalysisFramework';

export interface EnhancedDocumentAnalyzerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  aiServiceConfig: any;
}

export interface ProcessAndAnalyzeResult {
  documentId: string;
  extractedMetrics: FinancialSummary;
  embeddingsStored: boolean;
  suggestedRelationships: string[];
}

export interface MultiDocumentAnalysisOptions {
  documentIds: string[];
  analysisType:
    | 'financial-comparison'
    | 'due-diligence'
    | 'competitive-analysis'
    | 'trend-analysis'
    | 'contradiction-check';
  framework?: string; // e.g., 'sequoia', 'a16z', 'yc'
  customQuery?: string;
}

/**
 * Main class providing unified access to all enhanced document analysis capabilities
 */
export class EnhancedDocumentAnalyzer {
  private supabase: SupabaseClient;
  private aiClient: SecureAIServiceClient;
  private vectorService: VectorEmbeddingsService;
  private financialExtractor: FinancialMetricsExtractor;
  private crossDocAnalyzer: CrossDocumentAnalysisEngine;
  private relationshipTracker: DocumentRelationshipTracker;

  constructor(config: EnhancedDocumentAnalyzerConfig) {
    // Initialize Supabase client
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Initialize AI client
    this.aiClient = createSecureAIClient(config.aiServiceConfig);

    // Initialize vector embeddings service
    this.vectorService = createVectorEmbeddingsService({
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      openaiApiKey: config.openaiApiKey,
    });

    // Initialize financial metrics extractor
    this.financialExtractor = createFinancialMetricsExtractor({
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      aiClient: this.aiClient,
    });

    // Initialize cross-document analysis engine
    this.crossDocAnalyzer = createCrossDocumentAnalysisEngine({
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      aiClient: this.aiClient,
      vectorService: this.vectorService,
      financialExtractor: this.financialExtractor,
    });

    // Initialize relationship tracker
    this.relationshipTracker = createDocumentRelationshipTracker({
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      aiClient: this.aiClient,
      vectorService: this.vectorService,
    });
  }

  /**
   * Process a new document with full analysis pipeline
   * - Generate vector embeddings
   * - Extract financial metrics
   * - Discover relationships with existing documents
   */
  async processAndAnalyzeDocument(
    documentId: string,
    documentText: string,
    chunks: string[]
  ): Promise<ProcessAndAnalyzeResult> {
    try {
      // 1. Generate and store vector embeddings
      await this.vectorService.storeDocumentEmbeddings(
        documentId,
        chunks.map((content, index) => ({
          chunkIndex: index,
          content,
          chunkType: 'text',
        }))
      );

      // 2. Extract financial metrics
      const extractedMetrics = await this.financialExtractor.extractMetrics(
        documentId,
        documentText
      );

      // 3. Discover relationships with other documents
      const { data: allDocs } = await this.supabase
        .from('documents')
        .select('id')
        .neq('id', documentId)
        .limit(50);

      const allDocIds = [documentId, ...(allDocs?.map(d => d.id) || [])];
      const relationships = await this.relationshipTracker.discoverRelationships(allDocIds);

      return {
        documentId,
        extractedMetrics,
        embeddingsStored: true,
        suggestedRelationships: relationships
          .filter(r => r.sourceDocumentId === documentId || r.targetDocumentId === documentId)
          .map(r => `${r.relationshipType}: ${r.notes || 'Related document'}`),
      };
    } catch (error) {
      console.error('Error in processAndAnalyzeDocument:', error);
      throw error;
    }
  }

  /**
   * Perform semantic search across all documents
   */
  async semanticSearch(
    query: string,
    options: {
      documentIds?: string[];
      limit?: number;
      threshold?: number;
    } = {}
  ) {
    return this.vectorService.semanticSearch(query, {
      filterDocumentIds: options.documentIds,
      matchCount: options.limit || 10,
      matchThreshold: options.threshold || 0.7,
    });
  }

  /**
   * Find documents similar to a given document
   */
  async findSimilarDocuments(documentId: string, limit: number = 5) {
    return this.vectorService.findSimilarDocuments(documentId, {
      matchCount: limit,
      matchThreshold: 0.65,
    });
  }

  /**
   * Compare financial metrics across multiple documents
   */
  async compareFinancialMetrics(
    documentIds: string[],
    metricTypes?: string[]
  ): Promise<MetricComparison[]> {
    return this.financialExtractor.compareMetrics(documentIds, metricTypes as any);
  }

  /**
   * Generate comprehensive financial analysis
   */
  async analyzeFinancials(documentIds: string[]) {
    return this.financialExtractor.generateFinancialAnalysis(documentIds);
  }

  /**
   * Perform multi-document analysis
   */
  async analyzeMultipleDocuments(options: MultiDocumentAnalysisOptions): Promise<AnalysisResult> {
    const queryTypeMap: Record<string, any> = {
      'financial-comparison': 'financial-analysis',
      'due-diligence': 'due-diligence',
      'competitive-analysis': 'competitive-analysis',
      'trend-analysis': 'trend-analysis',
      'contradiction-check': 'cross-document-comparison',
    };

    let query: CrossDocumentQuery = {
      queryText: options.customQuery || `Analyze these documents for ${options.analysisType}`,
      queryType: queryTypeMap[options.analysisType] || 'custom',
      documentIds: options.documentIds,
    };

    // Apply framework if specified
    if (options.framework) {
      const framework = VCAnalysisFramework.getFramework(options.framework);
      if (framework) {
        query.queryText = this.buildFrameworkQuery(framework, query.queryText);
      }
    }

    return this.crossDocAnalyzer.analyze(query);
  }

  /**
   * Compare documents across specific aspects
   */
  async compareDocuments(documentIds: string[], aspects: string[]) {
    return this.crossDocAnalyzer.compareDocuments(documentIds, aspects);
  }

  /**
   * Analyze trends across documents
   */
  async analyzeTrends(documentIds: string[], focusAreas: string[]) {
    return this.crossDocAnalyzer.analyzeTrends(documentIds, focusAreas);
  }

  /**
   * Conduct comprehensive due diligence
   */
  async conductDueDiligence(collectionId: string) {
    return this.crossDocAnalyzer.conductDueDiligence(collectionId);
  }

  /**
   * Find contradictions across documents
   */
  async findContradictions(documentIds: string[]) {
    return this.crossDocAnalyzer.findContradictions(documentIds);
  }

  /**
   * Get document relationship network
   */
  async getDocumentNetwork(rootDocumentId: string, maxDepth: number = 2): Promise<DocumentNetwork> {
    return this.relationshipTracker.getDocumentNetwork(rootDocumentId, maxDepth);
  }

  /**
   * Discover relationships between documents
   */
  async discoverRelationships(documentIds: string[]) {
    return this.relationshipTracker.discoverRelationships(documentIds);
  }

  /**
   * Get all available VC frameworks
   */
  getAvailableFrameworks(): VCFramework[] {
    return VCAnalysisFramework.getAllFrameworks();
  }

  /**
   * Analyze using specific VC framework
   */
  async analyzeWithFramework(
    frameworkName: string,
    documentIds: string[]
  ): Promise<{
    framework: VCFramework;
    analysis: any;
  }> {
    const framework = VCAnalysisFramework.getFramework(frameworkName);
    if (!framework) {
      throw new Error(`Framework '${frameworkName}' not found`);
    }

    // Get document content
    const { data: documents } = await this.supabase
      .from('documents')
      .select('*')
      .in('id', documentIds);

    const documentContext =
      documents
        ?.map(
          doc => `
### ${doc.filename}
${doc.content_text.substring(0, 3000)}...
`
        )
        .join('\n\n') || '';

    // Generate analysis using framework
    const prompt = VCAnalysisFramework.generateAnalysisPrompt(framework, documentContext);

    const response = await this.aiClient.generateResponse(
      [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Please provide the framework-based analysis.' },
      ],
      { temperature: 0.3, maxTokens: 3000 }
    );

    const analysis = JSON.parse(response.content);

    return {
      framework,
      analysis,
    };
  }

  /**
   * Create a document collection
   */
  async createDocumentCollection(
    name: string,
    documentIds: string[],
    collectionType: string,
    description?: string
  ) {
    const { data: collection, error: collError } = await this.supabase
      .from('document_collections')
      .insert({
        name,
        description,
        collection_type: collectionType,
      })
      .select()
      .single();

    if (collError) throw collError;

    // Add documents to collection
    const collectionDocs = documentIds.map((docId, index) => ({
      collection_id: collection.id,
      document_id: docId,
      display_order: index,
    }));

    const { error: docError } = await this.supabase
      .from('collection_documents')
      .insert(collectionDocs);

    if (docError) throw docError;

    return collection;
  }

  /**
   * Get cached analysis if available
   */
  async getCachedAnalysis(queryText: string, documentIds: string[]) {
    const { data } = await this.supabase
      .from('analysis_queries')
      .select('*')
      .eq('query_text', queryText)
      .contains('document_ids', documentIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  /**
   * Generate executive summary across multiple documents
   */
  async generateExecutiveSummary(documentIds: string[]): Promise<{
    summary: string;
    keyFindings: string[];
    criticalMetrics: any;
    recommendations: string[];
  }> {
    // Get financial analysis
    const financialAnalysis = await this.analyzeFinancials(documentIds);

    // Get document network insights
    const networkInsights = await Promise.all(
      documentIds.slice(0, 3).map(id => this.getDocumentNetwork(id, 1))
    );

    // Get documents
    const { data: documents } = await this.supabase
      .from('documents')
      .select('filename, category, company_name, document_date')
      .in('id', documentIds);

    const systemPrompt = `You are a senior VC partner preparing an executive summary for the investment committee.

Synthesize the provided information into a compelling executive summary.

Return in JSON format:
{
  "summary": "2-3 paragraph executive summary",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const context = {
      documents: documents?.map(d => ({
        filename: d.filename,
        category: d.category,
        company: d.company_name,
        date: d.document_date,
      })),
      financialAnalysis: {
        summary: financialAnalysis.summary,
        insights: financialAnalysis.keyInsights,
        risks: financialAnalysis.riskAssessment,
      },
      documentConnections: networkInsights.map(n => n.insights).flat(),
    };

    const response = await this.aiClient.generateResponse(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(context, null, 2) },
      ],
      { temperature: 0.4, maxTokens: 1500 }
    );

    const result = JSON.parse(response.content);

    return {
      summary: result.summary,
      keyFindings: result.keyFindings,
      criticalMetrics: financialAnalysis.metricComparisons,
      recommendations: result.recommendations,
    };
  }

  /**
   * Helper: Build framework-based query
   */
  private buildFrameworkQuery(framework: VCFramework, baseQuery: string): string {
    const criteria = framework.criteria.map(c => c.category).join(', ');
    return `${baseQuery}\n\nApply the ${framework.name} focusing on: ${criteria}`;
  }
}

/**
 * Create Enhanced Document Analyzer instance
 */
export const createEnhancedDocumentAnalyzer = (
  config: EnhancedDocumentAnalyzerConfig
): EnhancedDocumentAnalyzer => {
  return new EnhancedDocumentAnalyzer(config);
};

/**
 * Factory function for easy initialization
 */
export const initializeEnhancedAnalyzer = async (
  supabaseUrl?: string,
  supabaseKey?: string,
  openaiApiKey?: string
): Promise<EnhancedDocumentAnalyzer> => {
  // Use environment variables if not provided
  const config: EnhancedDocumentAnalyzerConfig = {
    supabaseUrl: supabaseUrl || process.env.REACT_APP_SUPABASE_URL || '',
    supabaseKey: supabaseKey || process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    openaiApiKey: openaiApiKey || process.env.REACT_APP_OPENAI_API_KEY || '',
    aiServiceConfig: {
      provider: 'openai',
      apiKey: openaiApiKey || process.env.REACT_APP_OPENAI_API_KEY || '',
      model: 'gpt-5.2',
      backendUrl: '/api/generate',
    },
  };

  return new EnhancedDocumentAnalyzer(config);
};
