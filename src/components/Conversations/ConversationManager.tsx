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
  Paperclip,
} from 'lucide-react';
import { AdvisoryConversation } from './AdvisoryConversation';
import { ConfirmationModal } from '../Modals/ConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { loadConversations as loadConversationsFromDb } from '../../services/conversationService';
import { cn, formatDate } from '../../utils';

interface SavedConversation {
  id: string;
  title: string;
  mode:
    | 'pitch_practice'
    | 'strategic_planning'
    | 'due_diligence'
    | 'quick_consultation'
    | 'general';
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
  const { user } = useAuth();
  const { conversations: supabaseConversations, loadConversations: reloadSupabaseConversations, activeConversation } =
    useAdvisor();
  const [localConversations, setLocalConversations] = useState<SavedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'recent' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'mode'>('recent');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're in demo mode (no Supabase configured)
  const isDemoMode = !process.env.REACT_APP_SUPABASE_URL;

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
    if (isDemoMode) {
      loadLocalStorageConversations();
    } else if (user?.id) {
      // In production mode, load from our conversation service
      loadConversationsFromService();
    }
  }, [isDemoMode, user]);

  // Auto-start new conversation if no conversations exist after loading
  useEffect(() => {
    if (
      !isLoading &&
      localConversations.length === 0 &&
      !showNewConversation &&
      !selectedConversation
    ) {
      console.log('📝 No conversations found, auto-starting new general discussion');
      setShowNewConversation(true);
    }
  }, [isLoading, localConversations.length, showNewConversation, selectedConversation]);

  const loadLocalStorageConversations = () => {
    const saved: SavedConversation[] = [];

    // Load from localStorage (demo mode only)
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

    setLocalConversations(saved);
  };

  const loadConversationsFromService = async () => {
    if (!user?.id) {
      console.log('No user logged in, skipping conversation load');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log(`📋 Loading conversations for user ${user.id}...`);

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Conversation load timeout')), 10000);
      });

      const loaded = await Promise.race([
        loadConversationsFromDb(user.id, user.email),
        timeoutPromise,
      ]);

      console.log(`✅ Loaded ${loaded.length} conversations from database`);

      const saved: SavedConversation[] = loaded.map(data => ({
        id: data.id,
        title: data.title || 'Untitled Conversation',
        mode: data.mode || 'general',
        advisors: data.advisors?.map(a => a.id) || [],
        lastMessage: data.messages?.[data.messages.length - 1]?.content || 'No messages',
        lastUpdated: data.updated_at || data.created_at || new Date().toISOString(),
        messageCount: data.messages?.length || 0,
        hasAttachments: Boolean(data.files && data.files.length > 0),
        tags: [],
        isStarred: false,
        isArchived: false,
      }));

      setLocalConversations(saved);
      console.log(`✅ Set ${saved.length} conversations in state`);
    } catch (error) {
      console.error('❌ Error loading conversations from database:', error);
      // Fallback to empty state to unblock UI
      setLocalConversations([]);
    } finally {
      setIsLoading(false);
      console.log('✅ Conversation loading complete, isLoading set to false');
    }
  };

  // Get conversations from the appropriate source
  // Priority: 1) AdvisorContext (if available), 2) Our conversation service, 3) localStorage
  const conversations: SavedConversation[] = React.useMemo(() => {
    if (isDemoMode) {
      return localConversations;
    }

    // If AdvisorContext has conversations, use those (synced from Dashboard)
    if (supabaseConversations && supabaseConversations.length > 0) {
      return supabaseConversations.map(conv => ({
        id: conv.id,
        title: `Conversation with ${conv.advisor_id}`,
        mode: conv.mode as
          | 'strategic_planning'
          | 'due_diligence'
          | 'quick_consultation'
          | 'general',
        advisors: [conv.advisor_id],
        lastMessage: conv.messages?.[conv.messages.length - 1]?.content || 'No messages',
        lastUpdated: conv.updated_at,
        messageCount: conv.messages?.length || 0,
        hasAttachments: false,
        tags: [],
        isStarred: false,
        isArchived: false,
      }));
    }

    // Fallback to our conversation service data
    return localConversations;
  }, [isDemoMode, localConversations, supabaseConversations]);

  const filteredAndSortedConversations = conversations
    .filter(conv => {
      if (filterMode === 'starred' && !conv.isStarred) return false;
      if (filterMode === 'archived' && !conv.isArchived) return false;
      if (filterMode === 'recent' && conv.isArchived) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          conv.title.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query) ||
          conv.advisors.some(a => a.toLowerCase().includes(query))
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'mode') {
        return a.mode.localeCompare(b.mode);
      }
      return 0;
    });

  const handleDeleteConversation = (id: string) => {
    setConversationToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      localStorage.removeItem(`conversation-${conversationToDelete}`);
      if (isDemoMode) {
        loadLocalStorageConversations();
      } else {
        loadConversationsFromService();
      }
      setShowDeleteConfirmation(false);
      setConversationToDelete(null);
    }
  };

  // Check for activeConversation from Dashboard or selectedConversation from this component
  const conversationToLoad = activeConversation?.id || selectedConversation;

  if (conversationToLoad || showNewConversation) {
    return (
      <AdvisoryConversation
        onBack={() => {
          // "Back to Dashboard" should always go to dashboard
          onBack();
        }}
        conversationId={conversationToLoad || undefined}
      />
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Filters & Actions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Filter</span>
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'recent', 'starred', 'archived'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Sort by</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="mode">By Mode</option>
          </select>
        </div>

        {/* New Conversation Button */}
        <div className="p-4">
          <button
            onClick={() => setShowNewConversation(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Start New Conversation</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Get advice from AI advisors on any topic
          </p>
        </div>
      </div>

      {/* Main Content - Conversation List */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading conversations...</div>
            </div>
          ) : filteredAndSortedConversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'Ready to get started?'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? "Try adjusting your search criteria or filters to find what you're looking for"
                  : 'Start your first conversation with AI advisors trained on insights from Mark Cuban, Reid Hoffman, and other business legends'}
              </p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Start Your First Conversation
              </button>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Strategic Planning</p>
                  <p className="text-xs text-gray-600">
                    Get expert guidance on your business strategy
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">💡</div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Quick Consultation</p>
                  <p className="text-xs text-gray-600">Fast answers to urgent business questions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Due Diligence</p>
                  <p className="text-xs text-gray-600">Deep analysis and document review</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedConversations.map(conv => {
                const mode = conversationModes.find(m => m.id === conv.mode);
                return (
                  <div
                    key={conv.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-2 rounded-lg', mode?.color || 'bg-gray-500')}>
                            {mode?.icon || <MessageCircle className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {conv.title}
                            </h3>
                            <p className="text-xs text-gray-500">{mode?.name || 'General'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {conv.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Last Message */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{conv.lastMessage}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(conv.lastUpdated)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {conv.messageCount}
                          </span>
                          {conv.hasAttachments && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {conv.advisors.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
