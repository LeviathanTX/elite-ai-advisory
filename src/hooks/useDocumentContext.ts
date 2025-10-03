import { useState, useCallback } from 'react';
import { DocumentContextService, DocumentContext, DocumentReference } from '../services/DocumentContext';
import { StoredDocument } from '../services/DocumentStorage';

export const useDocumentContext = () => {
  const [documentContextService] = useState(() => new DocumentContextService());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocumentContext = useCallback(async (
    advisorId: string,
    conversationHistory: string[] = [],
    referencedDocuments: string[] = []
  ): Promise<DocumentContext | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const context = await documentContextService.getDocumentContext(
        advisorId,
        conversationHistory,
        referencedDocuments
      );
      return context;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get document context';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [documentContextService]);

  const parseDocumentReferences = useCallback((
    messageText: string,
    advisorDocuments: StoredDocument[]
  ): DocumentReference[] => {
    return documentContextService.parseDocumentReferences(messageText, advisorDocuments);
  }, [documentContextService]);

  const suggestRelevantDocuments = useCallback((
    conversationText: string,
    advisorDocuments: StoredDocument[],
    limit = 3
  ): DocumentReference[] => {
    return documentContextService.suggestRelevantDocuments(conversationText, advisorDocuments, limit);
  }, [documentContextService]);

  const formatDocumentContextForAI = useCallback((
    context: DocumentContext
  ): string => {
    return documentContextService.formatDocumentContextForAI(context);
  }, [documentContextService]);

  const getDocumentById = useCallback((
    documentId: string
  ): StoredDocument | undefined => {
    return documentContextService.getDocumentById(documentId);
  }, [documentContextService]);

  const getDocumentPreview = useCallback((
    documentId: string,
    maxLength = 300
  ): string => {
    return documentContextService.getDocumentPreview(documentId, maxLength);
  }, [documentContextService]);

  return {
    getDocumentContext,
    parseDocumentReferences,
    suggestRelevantDocuments,
    formatDocumentContextForAI,
    getDocumentById,
    getDocumentPreview,
    isLoading,
    error
  };
};