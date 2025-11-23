/**
 * Vector Embeddings Service
 * Generates and manages vector embeddings for semantic document search
 */

import { createClient } from '@supabase/supabase-js';

export interface EmbeddingRequest {
  text: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

export interface SemanticSearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  chunkType: string;
  metadata: Record<string, any>;
}

export class VectorEmbeddingsService {
  private supabaseUrl: string;
  private supabaseKey: string;
  private openaiApiKey: string;
  private embeddingModel = 'text-embedding-ada-002';
  private embeddingDimension = 1536;

  constructor(config: { supabaseUrl: string; supabaseKey: string; openaiApiKey: string }) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.openaiApiKey = config.openaiApiKey;
  }

  /**
   * Generate embeddings for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // Clean and truncate text to fit within token limits (8191 tokens for ada-002)
      const cleanText = this.cleanText(text);
      const truncatedText = this.truncateToTokenLimit(cleanText, 8000);

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: truncatedText,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return {
        embedding: data.data[0].embedding,
        tokenCount: data.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      // Clean and prepare texts
      const cleanTexts = texts.map(text => this.truncateToTokenLimit(this.cleanText(text), 8000));

      // OpenAI allows up to 2048 inputs per request, but we'll batch smaller for reliability
      const batchSize = 100;
      const results: EmbeddingResult[] = [];

      for (let i = 0; i < cleanTexts.length; i += batchSize) {
        const batch = cleanTexts.slice(i, i + batchSize);

        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: this.embeddingModel,
            input: batch,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        // Map results to our format
        const batchResults = data.data.map((item: any) => ({
          embedding: item.embedding,
          tokenCount: Math.ceil(data.usage.total_tokens / batch.length),
        }));

        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      console.error('Error generating embeddings batch:', error);
      throw error;
    }
  }

  /**
   * Store embeddings for document chunks in Supabase
   */
  async storeDocumentEmbeddings(
    documentId: string,
    chunks: Array<{
      chunkIndex: number;
      content: string;
      chunkType?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Generate embeddings for all chunks
      const embeddings = await this.generateEmbeddingsBatch(chunks.map(c => c.content));

      // Prepare chunk records
      const chunkRecords = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        content_embedding: embeddings[index].embedding,
        chunk_type: chunk.chunkType || 'text',
        metadata: chunk.metadata || {},
        token_count: embeddings[index].tokenCount,
      }));

      // Insert chunks in batches
      const batchSize = 50;
      for (let i = 0; i < chunkRecords.length; i += batchSize) {
        const batch = chunkRecords.slice(i, i + batchSize);
        const { error } = await supabase.from('document_chunks').upsert(batch, {
          onConflict: 'document_id,chunk_index',
        });

        if (error) {
          throw new Error(`Supabase error storing chunks: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error storing document embeddings:', error);
      throw error;
    }
  }

  /**
   * Semantic search across document chunks
   */
  async semanticSearch(
    query: string,
    options: {
      matchThreshold?: number;
      matchCount?: number;
      filterDocumentIds?: string[];
    } = {}
  ): Promise<SemanticSearchResult[]> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Generate embedding for query
      const { embedding } = await this.generateEmbedding(query);

      // Use the PostgreSQL function for semantic search
      const { data, error } = await supabase.rpc('find_similar_chunks', {
        query_embedding: embedding,
        match_threshold: options.matchThreshold || 0.7,
        match_count: options.matchCount || 10,
        filter_document_ids: options.filterDocumentIds || null,
      });

      if (error) {
        throw new Error(`Semantic search error: ${error.message}`);
      }

      return data.map((row: any) => ({
        chunkId: row.chunk_id,
        documentId: row.document_id,
        content: row.content,
        similarity: row.similarity,
        chunkType: row.chunk_type,
        metadata: row.metadata,
      }));
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw error;
    }
  }

  /**
   * Find similar documents based on overall content similarity
   */
  async findSimilarDocuments(
    documentId: string,
    options: {
      matchThreshold?: number;
      matchCount?: number;
    } = {}
  ): Promise<
    Array<{
      documentId: string;
      avgSimilarity: number;
      matchingChunks: number;
    }>
  > {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Get chunks for the source document
      const { data: sourceChunks, error: sourceError } = await supabase
        .from('document_chunks')
        .select('content_embedding')
        .eq('document_id', documentId);

      if (sourceError || !sourceChunks?.length) {
        throw new Error('Could not find source document chunks');
      }

      // Calculate average embedding for the document
      const avgEmbedding = this.calculateAverageEmbedding(
        sourceChunks.map(c => c.content_embedding)
      );

      // Search for similar chunks
      const { data, error } = await supabase.rpc('find_similar_chunks', {
        query_embedding: avgEmbedding,
        match_threshold: options.matchThreshold || 0.7,
        match_count: options.matchCount || 50,
        filter_document_ids: null,
      });

      if (error) {
        throw new Error(`Similar documents search error: ${error.message}`);
      }

      // Group by document and calculate average similarity
      const documentScores = new Map<string, { totalSimilarity: number; count: number }>();

      for (const chunk of data) {
        if (chunk.document_id === documentId) continue; // Skip source document

        const current = documentScores.get(chunk.document_id) || { totalSimilarity: 0, count: 0 };
        documentScores.set(chunk.document_id, {
          totalSimilarity: current.totalSimilarity + chunk.similarity,
          count: current.count + 1,
        });
      }

      // Convert to results array
      return Array.from(documentScores.entries())
        .map(([docId, scores]) => ({
          documentId: docId,
          avgSimilarity: scores.totalSimilarity / scores.count,
          matchingChunks: scores.count,
        }))
        .sort((a, b) => b.avgSimilarity - a.avgSimilarity)
        .slice(0, options.matchCount || 10);
    } catch (error) {
      console.error('Error finding similar documents:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate average embedding from multiple embeddings
   */
  private calculateAverageEmbedding(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      throw new Error('Cannot calculate average of empty embeddings array');
    }

    const dimension = embeddings[0].length;
    const avgEmbedding = new Array(dimension).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        avgEmbedding[i] += embedding[i];
      }
    }

    for (let i = 0; i < dimension; i++) {
      avgEmbedding[i] /= embeddings.length;
    }

    return avgEmbedding;
  }

  /**
   * Clean text before generating embeddings
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  }

  /**
   * Truncate text to fit within token limit
   */
  private truncateToTokenLimit(text: string, maxTokens: number): string {
    // Rough approximation: 1 token ≈ 0.75 words
    const maxWords = Math.floor(maxTokens * 0.75);
    const words = text.split(/\s+/);

    if (words.length <= maxWords) {
      return text;
    }

    return words.slice(0, maxWords).join(' ');
  }

  /**
   * Delete embeddings for a document
   */
  async deleteDocumentEmbeddings(documentId: string): Promise<void> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const { error } = await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      if (error) {
        throw new Error(`Error deleting embeddings: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting document embeddings:', error);
      throw error;
    }
  }
}

/**
 * Create vector embeddings service instance
 */
export const createVectorEmbeddingsService = (config: {
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
}): VectorEmbeddingsService => {
  return new VectorEmbeddingsService(config);
};
