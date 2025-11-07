import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  FileText,
  Star,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  Share2,
  Archive,
  Calendar,
  Brain,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { AdvisoryConversation } from './AdvisoryConversation';
import { ConfirmationModal } from '../Modals/ConfirmationModal';
import { cn, formatDate } from '../../utils';

interface SavedConversation {
  id: string;
  title: string;
  mode: 'strategic_planning' | 'due_diligence' | 'quick_consultation' | 'general';
  advisors: string[];
  lastMessage: string;
  lastUpdated: string;
  messageCount: number;
  hasAttachments: boolean;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
}

interface ConversationManagerProps {
  onBack: () => void;
}

export function ConversationManager({ onBack }: ConversationManagerProps) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'recent' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'mode'>('recent');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const conversationModes = [
    {
      id: 'strategic_planning',
      name: 'Strategic Planning',
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-blue-500',
      description: 'Long-term strategy and planning',
    },
    {
      id: 'due_diligence',
      name: 'Due Diligence',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-green-500',
      description: 'Investment analysis and document review',
    },
    {
      id: 'quick_consultation',
      name: 'Quick Consultation',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-orange-500',
      description: 'Fast answers and immediate advice',
    },
    {
      id: 'general',
      name: 'General Discussion',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-purple-500',
      description: 'Open conversation with advisors',
    },
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const saved: SavedConversation[] = [];

    // Load from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          saved.push({
            id: data.id,
            title: data.title || 'Untitled Conversation',
            mode: data.mode || 'general',
            advisors: data.advisors || [],
            lastMessage: data.messages?.[data.messages.length - 1]?.content || 'No messages',
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            messageCount: data.messages?.length || 0,
            hasAttachments: data.files?.length > 0 || false,
            tags: data.tags || [],
            isStarred: data.isStarred || false,
            isArchived: data.isArchived || false,
          });
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      }
    }

    setConversations(saved);
  };

  const filteredAndSortedConversations = conversations
    .filter(conv => {
      if (filterMode === 'starred' && !conv.isStarred) return false;
      if (filterMode === 'archived' && !conv.isArchived) return false;
      if (filterMode === 'recent' && conv.isArchived) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          conv.title.toLowerCase().includes(query) || conv.lastMessage.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'mode':
          return a.mode.localeCompare(b.mode);
        case 'recent':
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const deleteConversation = (id: string) => {
    setConversationToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      localStorage.removeItem(`conversation-${conversationToDelete}`);
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      setConversationToDelete(null);
    }
  };

  const toggleStar = (id: string) => {
    const key = `conversation-${id}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data.isStarred = !data.isStarred;
    localStorage.setItem(key, JSON.stringify(data));
    loadConversations();
  };

  const archiveConversation = (id: string) => {
    const key = `conversation-${id}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data.isArchived = !data.isArchived;
    localStorage.setItem(key, JSON.stringify(data));
    loadConversations();
  };

  const getModeInfo = (mode: string) => {
    return conversationModes.find(m => m.id === mode) || conversationModes[3];
  };

  if (selectedConversation || showNewConversation) {
    return (
      <AdvisoryConversation
        onBack={() => {
          setSelectedConversation(null);
          setShowNewConversation(false);
          loadConversations(); // Refresh list when returning
        }}
        conversationId={selectedConversation || undefined}
        initialMode={showNewConversation ? 'general' : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium">
                ← Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Advisory Conversations</h1>
              </div>
            </div>
            <button
              onClick={() => setShowNewConversation(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Strategic Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.mode === 'strategic_planning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due Diligence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.mode === 'due_diligence').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Starred</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.isStarred).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {(['all', 'recent', 'starred', 'archived'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterMode(filter)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    filterMode === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Sort by Recent</option>
              <option value="alphabetical">Sort A-Z</option>
              <option value="mode">Sort by Type</option>
            </select>
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {conversationModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedConversation(null);
                  setShowNewConversation(true);
                }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                    mode.color
                  )}
                >
                  <div className="text-white text-lg">{mode.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{mode.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
                <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                  <span>Start new session</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Conversations</h2>
          {filteredAndSortedConversations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterMode !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start your first conversation with our AI advisory board'}
              </p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Start First Conversation</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedConversations.map(conversation => {
                const modeInfo = getModeInfo(conversation.mode);
                return (
                  <div
                    key={conversation.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            modeInfo.color
                          )}
                        >
                          <div className="text-white">{modeInfo.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {conversation.title}
                          </h3>
                          <p className="text-sm text-gray-600">{modeInfo.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleStar(conversation.id);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-gray-100',
                            conversation.isStarred ? 'text-yellow-500' : 'text-gray-400'
                          )}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={conversation.isStarred ? 'currentColor' : 'none'}
                          />
                        </button>
                        <div className="relative group/menu">
                          <button
                            onClick={e => e.stopPropagation()}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                            <div className="py-1">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  archiveConversation(conversation.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                {conversation.isArchived ? 'Unarchive' : 'Archive'}
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{conversation.messageCount} messages</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{conversation.advisors.length} advisors</span>
                        </div>
                        {conversation.hasAttachments && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>Files</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(conversation.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setConversationToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
