import React, { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  Folder,
  BarChart3,
  TrendingUp,
  Calendar,
  User,
  Tag,
  Shield,
  Download,
  Eye,
  Trash2,
  Edit,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import { DocumentProcessor } from '../../services/DocumentProcessor';
import {
  DocumentStorage,
  StoredDocument,
  DocumentCategory,
  ConfidentialityLevel,
} from '../../services/DocumentStorage';
import { useDropzone } from 'react-dropzone';

interface DocumentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  advisorId?: string;
  userId: string;
}

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
  isOpen,
  onClose,
  advisorId,
  userId,
}) => {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StoredDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedConfidentiality, setSelectedConfidentiality] = useState<
    ConfidentialityLevel | 'all'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const documentProcessor = new DocumentProcessor();
  const documentStorage = DocumentStorage.getInstance();

  useEffect(() => {
    loadDocuments();
  }, [advisorId, userId]);

  useEffect(() => {
    // Reload documents whenever the modal opens
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory, selectedConfidentiality, selectedTags]);

  const loadDocuments = () => {
    const docs = advisorId
      ? documentStorage.getAdvisorDocuments(advisorId)
      : documentStorage.getUserDocuments(userId);
    setDocuments(docs);
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchQuery.trim()) {
      const searchResults = documentStorage.searchDocuments(searchQuery, advisorId, userId, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        confidentialityLevel:
          selectedConfidentiality !== 'all' ? selectedConfidentiality : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      filtered = searchResults.map(result => result.document);
    } else {
      // Apply filters without search
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(doc => doc.category === selectedCategory);
      }
      if (selectedConfidentiality !== 'all') {
        filtered = filtered.filter(doc => doc.confidentialityLevel === selectedConfidentiality);
      }
      if (selectedTags.length > 0) {
        filtered = filtered.filter(doc => selectedTags.some(tag => doc.tags.includes(tag)));
      }
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);

    try {
      for (const file of files) {
        const validation = documentProcessor.validateFile(file);
        if (!validation.isValid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        const processed = await documentProcessor.processFile(file);
        await documentStorage.storeDocument(file, processed, advisorId || 'default', userId, {
          category: 'other',
          confidentialityLevel: 'internal',
          tags: [],
        });
      }

      loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: handleFileUpload,
    disabled: uploading,
  });

  const deleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      documentStorage.deleteDocument(documentId);
      loadDocuments();
    }
  };

  const viewDocument = (document: StoredDocument) => {
    // Create a modal to view document content
    const modal = window.open('', '_blank', 'width=800,height=600');
    if (modal) {
      modal.document.write(`
        <html>
          <head>
            <title>${document.filename}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
              .metadata { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${document.filename}</h1>
              <div class="metadata">
                <strong>Type:</strong> ${document.metadata.type.toUpperCase()} |
                <strong>Size:</strong> ${(document.size / 1024 / 1024).toFixed(2)} MB |
                <strong>Words:</strong> ${document.metadata.wordCount} |
                <strong>Category:</strong> ${document.category}
              </div>
            </div>
            <div class="content">${document.extractedText.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `);
    }
  };

  const downloadDocument = (document: StoredDocument) => {
    // Create a downloadable text file with the extracted content
    const content = `Document: ${document.filename}
Type: ${document.metadata.type.toUpperCase()}
Category: ${document.category}
Uploaded: ${new Date(document.uploadedAt).toLocaleString()}
Word Count: ${document.metadata.wordCount}

--- Content ---
${document.extractedText}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.filename.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    return documentStorage.getDocumentStats(advisorId, userId);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    documents.forEach(doc => {
      doc.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const stats = getStats();
  const allTags = getAllTags();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Document Management
              {advisorId && <span className="ml-2 text-sm text-gray-500">(Advisor Documents)</span>}
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {stats.totalDocuments} documents
              </span>
              <span className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                {DocumentProcessor.formatFileSize(stats.totalSize)}
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.recentUploads} recent
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border flex items-center space-x-1 ${
                  showFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div
                {...getRootProps()}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center space-x-2 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as DocumentCategory | 'all')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="meeting-minutes">Meeting Minutes</option>
                  <option value="proposal">Proposals</option>
                  <option value="report">Reports</option>
                  <option value="legal">Legal</option>
                  <option value="financial">Financial</option>
                  <option value="strategic-plan">Strategic Plans</option>
                  <option value="presentation">Presentations</option>
                  <option value="contract">Contracts</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidentiality
                </label>
                <select
                  value={selectedConfidentiality}
                  onChange={e =>
                    setSelectedConfidentiality(e.target.value as ConfidentialityLevel | 'all')
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="relative">
                  <select
                    onChange={e => {
                      const tag = e.target.value;
                      if (tag && !selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                      e.target.value = '';
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select tags...</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  {selectedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              {documents.length === 0 ? (
                <div>
                  <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-600 mb-4">Upload your first document to get started</p>
                  <div
                    {...getRootProps()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </div>
                </div>
              ) : (
                <div>
                  <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-4'
              }
            >
              {filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  onDelete={() => deleteDocument(document.id)}
                  onView={() => viewDocument(document)}
                  onDownload={() => downloadDocument(document)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DocumentCardProps {
  document: StoredDocument;
  viewMode: 'grid' | 'list';
  onDelete: () => void;
  onView: () => void;
  onDownload: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  viewMode,
  onDelete,
  onView,
  onDownload,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getConfidentialityColor = (level: ConfidentialityLevel) => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      internal: 'bg-blue-100 text-blue-800',
      confidential: 'bg-yellow-100 text-yellow-800',
      restricted: 'bg-red-100 text-red-800',
    };
    return colors[level];
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = {
      'meeting-minutes': 'bg-purple-100 text-purple-800',
      proposal: 'bg-orange-100 text-orange-800',
      report: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-red-100 text-red-800',
      financial: 'bg-green-100 text-green-800',
      'strategic-plan': 'bg-blue-100 text-blue-800',
      presentation: 'bg-pink-100 text-pink-800',
      contract: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category];
  };

  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <span className="text-2xl">
              {DocumentProcessor.getFileIcon(document.metadata.type)}
            </span>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{document.filename}</h4>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{DocumentProcessor.formatFileSize(document.size)}</span>
                <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(document.category)}`}
                >
                  {document.category}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getConfidentialityColor(document.confidentialityLevel)}`}
                >
                  {document.confidentialityLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="View document content"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Download document"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Actions overlay */}
      {showActions && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={onView}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-600 hover:text-gray-800"
            title="View document content"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={onDownload}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-600 hover:text-gray-800"
            title="Download document"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="text-center mb-3">
        <span className="text-3xl">{DocumentProcessor.getFileIcon(document.metadata.type)}</span>
      </div>

      <h4 className="font-medium text-gray-900 text-sm text-center mb-2 truncate">
        {document.filename}
      </h4>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{DocumentProcessor.formatFileSize(document.size)}</span>
          <span>{document.metadata.wordCount} words</span>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(document.category)}`}>
            {document.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getConfidentialityColor(document.confidentialityLevel)}`}
          >
            {document.confidentialityLevel}
          </span>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {new Date(document.uploadedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
