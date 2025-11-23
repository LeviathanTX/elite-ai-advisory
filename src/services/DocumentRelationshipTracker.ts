/**
 * Document Relationship Tracker
 * Manages relationships and connections between documents
 */

import { createClient } from '@supabase/supabase-js';
import { SecureAIServiceClient } from './secureAIService';
import { VectorEmbeddingsService } from './VectorEmbeddingsService';

export type RelationshipType =
  | 'references'
  | 'supplements'
  | 'contradicts'
  | 'updates'
  | 'supports'
  | 'part-of-series'
  | 'alternative-version'
  | 'related-company'
  | 'related-market';

export interface DocumentRelationship {
  id: string;
  sourceDocumentId: string;
  targetDocumentId: string;
  relationshipType: RelationshipType;
  confidenceScore: number;
  notes?: string;
  createdAt: Date;
}

export interface DocumentNetwork {
  rootDocument: {
    id: string;
    filename: string;
  };
  relationships: Array<{
    document: {
      id: string;
      filename: string;
    };
    relationshipPath: string[];
    depth: number;
    relationshipType: RelationshipType;
  }>;
  insights: string[];
}

export class DocumentRelationshipTracker {
  private supabaseUrl: string;
  private supabaseKey: string;
  private aiClient: SecureAIServiceClient;
  private vectorService: VectorEmbeddingsService;

  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    aiClient: SecureAIServiceClient;
    vectorService: VectorEmbeddingsService;
  }) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.aiClient = config.aiClient;
    this.vectorService = config.vectorService;
  }

  /**
   * Automatically discover relationships between documents
   */
  async discoverRelationships(documentIds: string[]): Promise<DocumentRelationship[]> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Get documents
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .in('id', documentIds);

      if (error) throw error;

      const relationships: DocumentRelationship[] = [];

      // Check for semantic similarity
      for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
          const doc1 = documents[i];
          const doc2 = documents[j];

          // Find similarity using vector embeddings
          const similarDocs = await this.vectorService.findSimilarDocuments(doc1.id, {
            matchThreshold: 0.7,
            matchCount: 10,
          });

          const similarity = similarDocs.find(s => s.documentId === doc2.id);

          if (similarity && similarity.avgSimilarity > 0.7) {
            // Determine relationship type using AI
            const relationshipType = await this.determineRelationshipType(doc1, doc2);

            relationships.push({
              id: crypto.randomUUID(),
              sourceDocumentId: doc1.id,
              targetDocumentId: doc2.id,
              relationshipType,
              confidenceScore: similarity.avgSimilarity,
              createdAt: new Date(),
            });
          }

          // Check for references in content
          if (doc1.content_text.toLowerCase().includes(doc2.filename.toLowerCase())) {
            relationships.push({
              id: crypto.randomUUID(),
              sourceDocumentId: doc1.id,
              targetDocumentId: doc2.id,
              relationshipType: 'references',
              confidenceScore: 0.9,
              notes: 'Document explicitly references the other',
              createdAt: new Date(),
            });
          }

          // Check for same company
          if (doc1.company_name && doc2.company_name && doc1.company_name === doc2.company_name) {
            relationships.push({
              id: crypto.randomUUID(),
              sourceDocumentId: doc1.id,
              targetDocumentId: doc2.id,
              relationshipType: 'related-company',
              confidenceScore: 1.0,
              notes: `Both documents about ${doc1.company_name}`,
              createdAt: new Date(),
            });
          }

          // Check for version relationships (date-based)
          if (
            doc1.category === doc2.category &&
            doc1.company_name === doc2.company_name &&
            doc1.document_date &&
            doc2.document_date
          ) {
            const date1 = new Date(doc1.document_date);
            const date2 = new Date(doc2.document_date);

            if (date1 < date2) {
              relationships.push({
                id: crypto.randomUUID(),
                sourceDocumentId: doc1.id,
                targetDocumentId: doc2.id,
                relationshipType: 'updates',
                confidenceScore: 0.85,
                notes: `${doc2.filename} is a newer version`,
                createdAt: new Date(),
              });
            }
          }
        }
      }

      // Store relationships in database
      if (relationships.length > 0) {
        await this.storeRelationships(relationships);
      }

      return relationships;
    } catch (error) {
      console.error('Error discovering relationships:', error);
      throw error;
    }
  }

  /**
   * Determine relationship type between two documents using AI
   */
  private async determineRelationshipType(doc1: any, doc2: any): Promise<RelationshipType> {
    try {
      const systemPrompt = `You are a document analysis expert. Determine the relationship between two documents.

Return ONLY one of these relationship types:
- "references": One document cites or mentions the other
- "supplements": Documents complement each other with additional information
- "contradicts": Documents contain conflicting information
- "updates": One document is an updated version of the other
- "supports": Documents provide supporting evidence for each other
- "part-of-series": Documents are part of a series (e.g., quarterly reports)
- "alternative-version": Documents present alternative versions of the same content
- "related-company": Documents about the same company but different aspects
- "related-market": Documents about the same market/industry

Return ONLY the relationship type keyword.`;

      const context = `
Document 1: ${doc1.filename} (${doc1.category})
Date: ${doc1.document_date || 'unknown'}
Company: ${doc1.company_name || 'unknown'}
Preview: ${doc1.content_text.substring(0, 500)}

Document 2: ${doc2.filename} (${doc2.category})
Date: ${doc2.document_date || 'unknown'}
Company: ${doc2.company_name || 'unknown'}
Preview: ${doc2.content_text.substring(0, 500)}
`;

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        { temperature: 0.1, maxTokens: 50 }
      );

      const type = response.content.trim().toLowerCase() as RelationshipType;

      // Validate and return
      const validTypes: RelationshipType[] = [
        'references',
        'supplements',
        'contradicts',
        'updates',
        'supports',
        'part-of-series',
        'alternative-version',
        'related-company',
        'related-market',
      ];

      return validTypes.includes(type) ? type : 'supplements';
    } catch (error) {
      console.error('Error determining relationship type:', error);
      return 'supplements';
    }
  }

  /**
   * Store relationships in database
   */
  private async storeRelationships(relationships: DocumentRelationship[]): Promise<void> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const records = relationships.map(rel => ({
        source_document_id: rel.sourceDocumentId,
        target_document_id: rel.targetDocumentId,
        relationship_type: rel.relationshipType,
        confidence_score: rel.confidenceScore,
        notes: rel.notes,
      }));

      const { error } = await supabase.from('document_relationships').upsert(records, {
        onConflict: 'source_document_id,target_document_id,relationship_type',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing relationships:', error);
      throw error;
    }
  }

  /**
   * Get document network/graph
   */
  async getDocumentNetwork(rootDocumentId: string, maxDepth: number = 2): Promise<DocumentNetwork> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Use the PostgreSQL function to get document network
      const { data, error } = await supabase.rpc('get_document_network', {
        root_document_id: rootDocumentId,
        max_depth: maxDepth,
      });

      if (error) throw error;

      // Get relationship types
      const { data: relationshipsData } = await supabase
        .from('document_relationships')
        .select('*')
        .or(`source_document_id.eq.${rootDocumentId},target_document_id.eq.${rootDocumentId}`);

      const relationships = relationshipsData ?? [];

      // Build network structure
      const network: DocumentNetwork = {
        rootDocument: {
          id: data[0].document_id,
          filename: data[0].filename,
        },
        relationships: data.slice(1).map((node: any) => ({
          document: {
            id: node.document_id,
            filename: node.filename,
          },
          relationshipPath: node.relationship_path,
          depth: node.depth,
          relationshipType: this.findRelationshipType(
            rootDocumentId,
            node.document_id,
            relationships
          ),
        })),
        insights: await this.generateNetworkInsights(data, relationships),
      };

      return network;
    } catch (error) {
      console.error('Error getting document network:', error);
      throw error;
    }
  }

  /**
   * Find relationship type between two documents
   */
  private findRelationshipType(
    sourceId: string,
    targetId: string,
    relationships: any[]
  ): RelationshipType {
    const rel = relationships?.find(
      r =>
        (r.source_document_id === sourceId && r.target_document_id === targetId) ||
        (r.target_document_id === sourceId && r.source_document_id === targetId)
    );

    return rel?.relationship_type || 'supplements';
  }

  /**
   * Generate insights about document network
   */
  private async generateNetworkInsights(nodes: any[], relationships: any[]): Promise<string[]> {
    const insights: string[] = [];

    // Count relationship types
    const typeCounts = new Map<RelationshipType, number>();
    for (const rel of relationships || []) {
      const count = typeCounts.get(rel.relationship_type) || 0;
      typeCounts.set(rel.relationship_type, count + 1);
    }

    // Generate insights based on patterns
    if (typeCounts.get('contradicts') && typeCounts.get('contradicts')! > 0) {
      insights.push(
        `⚠️ Found ${typeCounts.get('contradicts')} contradictory relationships - requires reconciliation`
      );
    }

    if (typeCounts.get('updates') && typeCounts.get('updates')! > 2) {
      insights.push(
        `📈 Multiple document versions detected - tracking ${typeCounts.get('updates')} updates`
      );
    }

    if (typeCounts.get('related-company')) {
      insights.push(
        `🏢 ${typeCounts.get('related-company')} documents about the same company - comprehensive view available`
      );
    }

    if (nodes.length > 10) {
      insights.push(`📚 Large document network with ${nodes.length} connected documents`);
    }

    return insights;
  }

  /**
   * Add manual relationship
   */
  async addRelationship(
    sourceDocumentId: string,
    targetDocumentId: string,
    relationshipType: RelationshipType,
    notes?: string
  ): Promise<DocumentRelationship> {
    try {
      const relationship: DocumentRelationship = {
        id: crypto.randomUUID(),
        sourceDocumentId,
        targetDocumentId,
        relationshipType,
        confidenceScore: 1.0,
        notes,
        createdAt: new Date(),
      };

      await this.storeRelationships([relationship]);

      return relationship;
    } catch (error) {
      console.error('Error adding relationship:', error);
      throw error;
    }
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(sourceDocumentId: string, targetDocumentId: string): Promise<void> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const { error } = await supabase
        .from('document_relationships')
        .delete()
        .eq('source_document_id', sourceDocumentId)
        .eq('target_document_id', targetDocumentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  }

  /**
   * Get all relationships for a document
   */
  async getDocumentRelationships(documentId: string): Promise<DocumentRelationship[]> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const { data, error } = await supabase
        .from('document_relationships')
        .select('*')
        .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);

      if (error) throw error;

      return data.map(r => ({
        id: r.id,
        sourceDocumentId: r.source_document_id,
        targetDocumentId: r.target_document_id,
        relationshipType: r.relationship_type,
        confidenceScore: r.confidence_score,
        notes: r.notes,
        createdAt: new Date(r.created_at),
      }));
    } catch (error) {
      console.error('Error getting document relationships:', error);
      throw error;
    }
  }
}

/**
 * Create document relationship tracker instance
 */
export const createDocumentRelationshipTracker = (config: {
  supabaseUrl: string;
  supabaseKey: string;
  aiClient: SecureAIServiceClient;
  vectorService: VectorEmbeddingsService;
}): DocumentRelationshipTracker => {
  return new DocumentRelationshipTracker(config);
};
