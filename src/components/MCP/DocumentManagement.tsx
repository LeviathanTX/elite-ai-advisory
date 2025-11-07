import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, Eye, X, Folder, AlertCircle } from 'lucide-react';
import { Advisor, MCPDocument } from '../../types';
import { DocumentStorage } from '../../services/DocumentStorage';
import { DocumentProcessor } from '../../services/DocumentProcessor';

interface DocumentManagementProps {
  advisor: Advisor;
  isOpen: boolean;
  onClose: () => void;
  onDocumentsChange?: (documents: MCPDocument[]) => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  advisor,
  isOpen,
  onClose,
  onDocumentsChange,
}) => {
  const [documents, setDocuments] = useState<MCPDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentStorage] = useState(() => DocumentStorage.getInstance());
  const [documentProcessor] = useState(() => new DocumentProcessor());

  // Load existing documents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingDocuments();
    }
  }, [isOpen, advisor.id]);

  const loadExistingDocuments = () => {
    // Load documents from DocumentStorage and convert to MCPDocument format
    const storedDocs = documentStorage.getAdvisorDocuments(advisor.id);
    const mcpDocs: MCPDocument[] = storedDocs.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      path: doc.filePath,
      content: doc.extractedText,
      type: convertToMCPType(doc.metadata.type),
      size: doc.size,
      uploaded_at: doc.uploadedAt,
      advisor_id: doc.advisorId,
    }));

    setDocuments(mcpDocs);
    console.log(
      `📄 MCP DocumentManagement: Loaded ${mcpDocs.length} existing documents for ${advisor.name}`
    );
  };

  const convertToMCPType = (type: string): MCPDocument['type'] => {
    switch (type) {
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const newDocuments: MCPDocument[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'text/markdown',
      ];
      if (
        !allowedTypes.includes(file.type) &&
        !file.name.endsWith('.md') &&
        !file.name.endsWith('.pptx') &&
        !file.name.endsWith('.ppt') &&
        !file.name.endsWith('.xlsx')
      ) {
        alert(`Unsupported file type: ${file.name}`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name} (max 10MB)`);
        continue;
      }

      try {
        // Process document with DocumentProcessor for proper text extraction
        const processedDoc = await documentProcessor.processFile(file);

        // Store in DocumentStorage service for integration with conversation system
        const storedDocument = await documentStorage.storeDocument(
          file,
          processedDoc,
          advisor.id,
          'test-user-1', // Using test user ID
          {
            category: 'other',
            confidentialityLevel: 'internal',
            tags: ['mcp', 'advisor-specific'],
          }
        );

        console.log('📄 Document stored:', storedDocument);

        // Also create MCP document for backward compatibility
        const content = await readFileContent(file);
        const doc: MCPDocument = {
          id: storedDocument.id, // Use same ID for consistency
          filename: file.name,
          path: `${advisor.mcp_folder_path || '/documents'}/${file.name}`,
          content,
          type: getFileType(file),
          size: file.size,
          uploaded_at: new Date().toISOString(),
          advisor_id: advisor.id,
        };
        newDocuments.push(doc);
      } catch (error) {
        console.error(`Failed to process file: ${file.name}`, error);
        alert(`Failed to process file: ${file.name}`);
      }
    }

    const updatedDocuments = [...documents, ...newDocuments];
    setDocuments(updatedDocuments);
    onDocumentsChange?.(updatedDocuments);
    setUploading(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const getFileType = (file: File): MCPDocument['type'] => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return 'docx';
    if (file.type === 'text/markdown' || file.name.endsWith('.md')) return 'markdown';
    return 'text';
  };

  const deleteDocument = (docId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    onDocumentsChange?.(updatedDocuments);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: MCPDocument['type']) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'markdown':
        return '📋';
      default:
        return '📄';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  if (!advisor.mcp_enabled) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">MCP Not Enabled</h3>
            <p className="text-gray-600 mb-4">
              Document management is not enabled for this advisor. Enable MCP in the advisor
              settings to upload documents.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Folder className="w-6 h-6 mr-2 text-blue-600" />
              Document Management - {advisor.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage documents for {advisor.name}'s knowledge base
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload
                className={`w-8 h-8 mx-auto mb-4 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <p className="text-lg font-medium text-gray-900 mb-2">Upload Documents</p>
              <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.pdf,.docx,.md"
                onChange={e => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Browse Files'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supports: PDF, DOCX, TXT, Markdown (max 10MB each)
              </p>
            </div>
          </div>

          {/* Document List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Documents ({documents.length})
              </h3>
              <div className="text-sm text-gray-500">
                Total: {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No documents uploaded</p>
                <p className="text-sm">Upload documents to build this advisor's knowledge base</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(doc.type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} •{' '}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
