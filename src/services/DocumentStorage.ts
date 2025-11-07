import { ProcessedDocument } from './DocumentProcessor';

export interface StoredDocument {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  contentType: string;
  size: number;
  advisorId: string;
  userId: string;
  extractedText: string;
  metadata: ProcessedDocument['metadata'];
  tags: string[];
  category: DocumentCategory;
  confidentialityLevel: ConfidentialityLevel;
  uploadedAt: string;
  updatedAt: string;
  isTemporary?: boolean; // Added for document selector flexibility
}

export type DocumentCategory =
  | 'meeting-minutes'
  | 'proposal'
  | 'report'
  | 'legal'
  | 'financial'
  | 'strategic-plan'
  | 'presentation'
  | 'contract'
  | 'other';

export type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export interface DocumentSearchResult {
  document: StoredDocument;
  relevanceScore: number;
  matchedChunks: string[];
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export class DocumentStorage {
  private static instance: DocumentStorage;
  private documents: Map<string, StoredDocument> = new Map();
  private documentChunks: Map<string, string[]> = new Map();

  constructor() {
    // Allow multiple instances for now, but provide singleton access
  }

  /**
   * Get the shared singleton instance
   */
  static getInstance(): DocumentStorage {
    if (!DocumentStorage.instance) {
      DocumentStorage.instance = new DocumentStorage();
    }
    return DocumentStorage.instance;
  }

  /**
   * Store a processed document
   */
  async storeDocument(
    file: File,
    processedDoc: ProcessedDocument,
    advisorId: string,
    userId: string,
    options: {
      category?: DocumentCategory;
      confidentialityLevel?: ConfidentialityLevel;
      tags?: string[];
    } = {}
  ): Promise<StoredDocument> {
    const documentId = this.generateDocumentId();
    const timestamp = new Date().toISOString();

    // In a real implementation, this would upload to Supabase Storage
    const filePath = `documents/${userId}/${advisorId}/${documentId}/${file.name}`;

    const storedDocument: StoredDocument = {
      id: documentId,
      filename: this.sanitizeFilename(file.name),
      originalName: file.name,
      filePath,
      contentType: file.type,
      size: file.size,
      advisorId,
      userId,
      extractedText: processedDoc.text,
      metadata: processedDoc.metadata,
      tags: options.tags || [],
      category: options.category || 'other',
      confidentialityLevel: options.confidentialityLevel || 'internal',
      uploadedAt: timestamp,
      updatedAt: timestamp,
    };

    // Store document and chunks
    this.documents.set(documentId, storedDocument);
    this.documentChunks.set(documentId, processedDoc.chunks);

    return storedDocument;
  }

  /**
   * Get document by ID
   */
  getDocument(documentId: string): StoredDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Get all documents
   */
  getAllDocuments(): StoredDocument[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  /**
   * Get all documents for an advisor
   */
  getAdvisorDocuments(advisorId: string): StoredDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.advisorId === advisorId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  /**
   * Get all documents for a user
   */
  getUserDocuments(userId: string): StoredDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  /**
   * Search documents by text content
   */
  searchDocuments(
    query: string,
    advisorId?: string,
    userId?: string,
    options: {
      category?: DocumentCategory;
      confidentialityLevel?: ConfidentialityLevel;
      tags?: string[];
    } = {}
  ): DocumentSearchResult[] {
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2);
    const results: DocumentSearchResult[] = [];

    let documentsToSearch = Array.from(this.documents.values());

    // Apply filters
    if (advisorId) {
      documentsToSearch = documentsToSearch.filter(doc => doc.advisorId === advisorId);
    }
    if (userId) {
      documentsToSearch = documentsToSearch.filter(doc => doc.userId === userId);
    }
    if (options.category) {
      documentsToSearch = documentsToSearch.filter(doc => doc.category === options.category);
    }
    if (options.confidentialityLevel) {
      documentsToSearch = documentsToSearch.filter(
        doc => doc.confidentialityLevel === options.confidentialityLevel
      );
    }
    if (options.tags && options.tags.length > 0) {
      documentsToSearch = documentsToSearch.filter(doc =>
        options.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    for (const document of documentsToSearch) {
      const searchableText = [
        document.filename,
        document.extractedText,
        document.tags.join(' '),
        document.metadata.title || '',
      ]
        .join(' ')
        .toLowerCase();

      let relevanceScore = 0;
      const matchedChunks: string[] = [];

      // Score based on search terms
      for (const term of searchTerms) {
        const matches = (searchableText.match(new RegExp(term, 'gi')) || []).length;
        relevanceScore += matches;

        // Find matching chunks
        const chunks = this.documentChunks.get(document.id) || [];
        for (const chunk of chunks) {
          if (chunk.toLowerCase().includes(term) && !matchedChunks.includes(chunk)) {
            matchedChunks.push(chunk);
          }
        }
      }

      // Boost score for title/filename matches
      if (document.filename.toLowerCase().includes(query.toLowerCase())) {
        relevanceScore += 5;
      }

      if (relevanceScore > 0) {
        results.push({
          document,
          relevanceScore,
          matchedChunks: matchedChunks.slice(0, 3), // Limit to top 3 chunks
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Update document metadata
   */
  updateDocument(
    documentId: string,
    updates: Partial<Pick<StoredDocument, 'tags' | 'category' | 'confidentialityLevel'>>
  ): StoredDocument | undefined {
    const document = this.documents.get(documentId);
    if (!document) return undefined;

    const updatedDocument = {
      ...document,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.documents.set(documentId, updatedDocument);
    return updatedDocument;
  }

  /**
   * Delete document
   */
  deleteDocument(documentId: string): boolean {
    const deleted = this.documents.delete(documentId);
    this.documentChunks.delete(documentId);
    return deleted;
  }

  /**
   * Get document statistics
   */
  getDocumentStats(
    advisorId?: string,
    userId?: string
  ): {
    totalDocuments: number;
    totalSize: number;
    byCategory: Record<DocumentCategory, number>;
    byConfidentiality: Record<ConfidentialityLevel, number>;
    recentUploads: number; // Last 7 days
  } {
    let documents = Array.from(this.documents.values());

    if (advisorId) {
      documents = documents.filter(doc => doc.advisorId === advisorId);
    }
    if (userId) {
      documents = documents.filter(doc => doc.userId === userId);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      byCategory: {} as Record<DocumentCategory, number>,
      byConfidentiality: {} as Record<ConfidentialityLevel, number>,
      recentUploads: documents.filter(doc => new Date(doc.uploadedAt) > sevenDaysAgo).length,
    };

    // Count by category
    for (const doc of documents) {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      stats.byConfidentiality[doc.confidentialityLevel] =
        (stats.byConfidentiality[doc.confidentialityLevel] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category: DocumentCategory, advisorId?: string): StoredDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => {
        if (doc.category !== category) return false;
        if (advisorId && doc.advisorId !== advisorId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  /**
   * Get recent documents
   */
  getRecentDocuments(limit = 10, advisorId?: string, userId?: string): StoredDocument[] {
    let documents = Array.from(this.documents.values());

    if (advisorId) {
      documents = documents.filter(doc => doc.advisorId === advisorId);
    }
    if (userId) {
      documents = documents.filter(doc => doc.userId === userId);
    }

    return documents
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get document preview text
   */
  getDocumentPreview(documentId: string, maxLength = 200): string {
    const document = this.documents.get(documentId);
    if (!document) return '';

    const preview = document.extractedText.substring(0, maxLength);
    return preview.length < document.extractedText.length ? preview + '...' : preview;
  }

  /**
   * Export document data (for backup/migration)
   */
  exportDocuments(advisorId?: string): {
    documents: StoredDocument[];
    chunks: Record<string, string[]>;
  } {
    let documents = Array.from(this.documents.values());

    if (advisorId) {
      documents = documents.filter(doc => doc.advisorId === advisorId);
    }

    const chunks: Record<string, string[]> = {};
    for (const doc of documents) {
      const docChunks = this.documentChunks.get(doc.id);
      if (docChunks) {
        chunks[doc.id] = docChunks;
      }
    }

    return { documents, chunks };
  }

  /**
   * Import document data (for restore/migration)
   */
  importDocuments(data: { documents: StoredDocument[]; chunks: Record<string, string[]> }): void {
    for (const doc of data.documents) {
      this.documents.set(doc.id, doc);
    }

    for (const [docId, chunks] of Object.entries(data.chunks)) {
      this.documentChunks.set(docId, chunks);
    }
  }

  /**
   * Clear all documents (for testing)
   */
  clear(): void {
    this.documents.clear();
    this.documentChunks.clear();
  }
}
