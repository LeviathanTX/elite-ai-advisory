import { DocumentStorage, StoredDocument } from './DocumentStorage';

export interface DocumentContext {
  documents: StoredDocument[];
  relevantChunks: DocumentChunk[];
  totalTokens: number;
  maxTokens: number;
}

export interface DocumentChunk {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  relevanceScore: number;
  tokens: number;
}

export interface DocumentReference {
  id: string;
  name: string;
  type: 'direct' | 'suggested' | 'automatic';
  document: StoredDocument;
}

export class DocumentContextService {
  private documentStorage = DocumentStorage.getInstance();
  private maxContextTokens = 8000; // Conservative limit for most AI models

  /**
   * Get document context for an advisor conversation
   */
  async getDocumentContext(
    advisorId: string,
    conversationHistory: string[] = [],
    referencedDocuments: string[] = []
  ): Promise<DocumentContext> {
    const advisorDocuments = this.documentStorage.getAdvisorDocuments(advisorId);

    if (advisorDocuments.length === 0) {
      return {
        documents: [],
        relevantChunks: [],
        totalTokens: 0,
        maxTokens: this.maxContextTokens
      };
    }

    // Get relevant chunks based on conversation context
    const relevantChunks = await this.getRelevantChunks(
      advisorDocuments,
      conversationHistory,
      referencedDocuments
    );

    // Sort by relevance and fit within token limit
    const optimizedChunks = this.optimizeChunksForTokenLimit(relevantChunks);

    return {
      documents: advisorDocuments,
      relevantChunks: optimizedChunks,
      totalTokens: optimizedChunks.reduce((sum, chunk) => sum + chunk.tokens, 0),
      maxTokens: this.maxContextTokens
    };
  }

  /**
   * Find documents relevant to conversation
   */
  private async getRelevantChunks(
    documents: StoredDocument[],
    conversationHistory: string[],
    referencedDocuments: string[]
  ): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];
    const conversationText = conversationHistory.join(' ').toLowerCase();

    for (const document of documents) {
      // Get document chunks from storage
      const chunks = this.getDocumentChunks(document);

      // Score each chunk for relevance
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const relevanceScore = this.calculateRelevanceScore(
          chunk,
          conversationText,
          referencedDocuments.includes(document.id)
        );

        if (relevanceScore > 0.1) { // Minimum relevance threshold
          allChunks.push({
            documentId: document.id,
            documentName: document.filename,
            chunkIndex: i,
            content: chunk,
            relevanceScore,
            tokens: this.estimateTokens(chunk)
          });
        }
      }
    }

    return allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get chunks for a specific document
   */
  private getDocumentChunks(document: StoredDocument): string[] {
    // For now, split by paragraphs - could be enhanced with semantic chunking
    const text = document.extractedText;
    const chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 50);

    // If no good paragraph breaks, split by sentences
    if (chunks.length < 2) {
      return text.split(/[.!?]+/).filter(chunk => chunk.trim().length > 50);
    }

    return chunks;
  }

  /**
   * Calculate relevance score for a chunk
   */
  private calculateRelevanceScore(
    chunk: string,
    conversationText: string,
    isDirectlyReferenced: boolean
  ): number {
    let score = 0;
    const chunkLower = chunk.toLowerCase();

    // Boost score if document is directly referenced
    if (isDirectlyReferenced) {
      score += 0.5;
    }

    // Keyword matching
    const conversationWords = conversationText.split(/\s+/).filter(word => word.length > 3);
    const matchingWords = conversationWords.filter(word => chunkLower.includes(word));
    score += (matchingWords.length / conversationWords.length) * 0.4;

    // Boost for important document sections
    if (chunkLower.includes('summary') || chunkLower.includes('conclusion')) {
      score += 0.2;
    }
    if (chunkLower.includes('key') || chunkLower.includes('important')) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Optimize chunks to fit within token limit
   */
  private optimizeChunksForTokenLimit(chunks: DocumentChunk[]): DocumentChunk[] {
    const optimized: DocumentChunk[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      if (totalTokens + chunk.tokens <= this.maxContextTokens) {
        optimized.push(chunk);
        totalTokens += chunk.tokens;
      } else {
        // Try to fit a truncated version
        const remainingTokens = this.maxContextTokens - totalTokens;
        if (remainingTokens > 100) { // Minimum useful chunk size
          const truncatedContent = this.truncateToTokenLimit(chunk.content, remainingTokens);
          optimized.push({
            ...chunk,
            content: truncatedContent,
            tokens: remainingTokens
          });
        }
        break;
      }
    }

    return optimized;
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 0.75 words
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75);
  }

  /**
   * Truncate text to fit token limit
   */
  private truncateToTokenLimit(text: string, maxTokens: number): string {
    const estimatedWords = maxTokens * 0.75;
    const words = text.split(/\s+/);

    if (words.length <= estimatedWords) {
      return text;
    }

    return words.slice(0, Math.floor(estimatedWords)).join(' ') + '...';
  }

  /**
   * Parse document references from message text
   */
  parseDocumentReferences(messageText: string, advisorDocuments: StoredDocument[]): DocumentReference[] {
    const references: DocumentReference[] = [];

    // Match @document-name or @"document name" patterns
    const referencePattern = /@(?:"([^"]+)"|(\S+))/g;
    let match;

    while ((match = referencePattern.exec(messageText)) !== null) {
      const referenceName = match[1] || match[2];

      // Find matching document
      const document = advisorDocuments.find(doc =>
        doc.filename.toLowerCase().includes(referenceName.toLowerCase()) ||
        doc.metadata.title?.toLowerCase().includes(referenceName.toLowerCase())
      );

      if (document) {
        references.push({
          id: document.id,
          name: referenceName,
          type: 'direct',
          document
        });
      }
    }

    return references;
  }

  /**
   * Suggest relevant documents based on conversation context
   */
  suggestRelevantDocuments(
    conversationText: string,
    advisorDocuments: StoredDocument[],
    limit = 3
  ): DocumentReference[] {
    const suggestions: DocumentReference[] = [];

    for (const document of advisorDocuments) {
      const relevanceScore = this.calculateDocumentRelevance(document, conversationText);

      if (relevanceScore > 0.3) { // Suggestion threshold
        suggestions.push({
          id: document.id,
          name: document.filename,
          type: 'suggested',
          document
        });
      }
    }

    return suggestions
      .sort((a, b) => this.calculateDocumentRelevance(b.document, conversationText) -
                      this.calculateDocumentRelevance(a.document, conversationText))
      .slice(0, limit);
  }

  /**
   * Calculate overall document relevance to conversation
   */
  private calculateDocumentRelevance(document: StoredDocument, conversationText: string): number {
    const chunks = this.getDocumentChunks(document);
    const avgRelevance = chunks.reduce((sum, chunk) =>
      sum + this.calculateRelevanceScore(chunk, conversationText, false), 0) / chunks.length;

    return avgRelevance;
  }

  /**
   * Format document context for AI prompt
   */
  formatDocumentContextForAI(context: DocumentContext): string {
    if (context.relevantChunks.length === 0) {
      return '';
    }

    let formattedContext = '\n\n--- AVAILABLE DOCUMENTS ---\n';
    formattedContext += `You have access to ${context.documents.length} documents in your knowledge base.\n\n`;

    // Group chunks by document
    const chunksByDocument = context.relevantChunks.reduce((groups, chunk) => {
      if (!groups[chunk.documentId]) {
        groups[chunk.documentId] = [];
      }
      groups[chunk.documentId].push(chunk);
      return groups;
    }, {} as Record<string, DocumentChunk[]>);

    // Format each document's relevant content
    for (const [documentId, chunks] of Object.entries(chunksByDocument)) {
      const document = context.documents.find(d => d.id === documentId);
      if (!document) continue;

      formattedContext += `## ${document.filename}\n`;
      formattedContext += `Category: ${document.category} | Confidentiality: ${document.confidentialityLevel}\n\n`;

      chunks.forEach((chunk, index) => {
        formattedContext += `### Excerpt ${index + 1} (Relevance: ${(chunk.relevanceScore * 100).toFixed(0)}%)\n`;
        formattedContext += `${chunk.content}\n\n`;
      });
    }

    formattedContext += `--- END DOCUMENTS (${context.totalTokens}/${context.maxTokens} tokens) ---\n\n`;
    formattedContext += 'Reference these documents when relevant to the conversation. ';
    formattedContext += 'If the user asks about specific documents, provide accurate information based on the content above.\n\n';

    return formattedContext;
  }

  /**
   * Get document by ID for direct reference
   */
  getDocumentById(documentId: string): StoredDocument | undefined {
    return this.documentStorage.getDocument(documentId);
  }

  /**
   * Get document preview for chat interface
   */
  getDocumentPreview(documentId: string, maxLength = 300): string {
    return this.documentStorage.getDocumentPreview(documentId, maxLength);
  }
}