import React, { useState } from 'react';
import { Plus, Edit, Star, Bot, Search, Users, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { AdvisorEditModal } from '../Modals/AdvisorEditModal';
import { ConfirmationModal } from '../Modals/ConfirmationModal';
import { Avatar } from '../Common/Avatar';
import { Advisor, AIService, CelebrityAdvisor, CustomAdvisor } from '../../types';
import { cn } from '../../utils';

interface AdvisorManagementProps {
  onBack: () => void;
}

type FilterType = 'all' | 'celebrity' | 'custom' | 'active' | 'available';

export function AdvisorManagement({ onBack }: AdvisorManagementProps) {
  const { celebrityAdvisors, customAdvisors, deleteAdvisor } = useAdvisor();
  const { settings } = useSettings();
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);

  const allAdvisors = [...celebrityAdvisors, ...customAdvisors];

  const filteredAdvisors = allAdvisors.filter(advisor => {
    // Search filter
    const matchesSearch =
      advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (advisor.expertise || []).some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type filter
    const matchesFilter = (() => {
      switch (filterType) {
        case 'celebrity':
          return celebrityAdvisors.includes(advisor as any);
        case 'custom':
          return customAdvisors.includes(advisor as any);
        case 'active':
          return true; // All advisors are considered active for now
        case 'available':
          return true; // All advisors are available for now
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const handleCreateAdvisor = () => {
    setEditingAdvisor(null);
    setShowEditModal(true);
  };

  const handleEditAdvisor = (advisor: CelebrityAdvisor | CustomAdvisor) => {
    setEditingAdvisor(advisor as unknown as Advisor);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingAdvisor(null);
  };

  const confirmDelete = () => {
    if (advisorToDelete) {
      deleteAdvisor(advisorToDelete.id);
      setAdvisorToDelete(null);
    }
  };

  const getAIServiceIcon = (service: string) => {
    switch (service) {
      case 'claude':
        return '🤖';
      case 'chatgpt':
        return '🧠';
      case 'gemini':
        return '💎';
      case 'deepseek':
        return '🔮';
      case 'groq':
        return '⚡';
      default:
        return '🤖';
    }
  };

  const getAIServiceStatus = (service: string) => {
    // Always return 'configured' since we're using server-side API keys
    return 'configured';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/hero/shark-tank-hero.png"
          alt="Shark Tank"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tank
              </button>
              <div className="h-6 border-l border-white/20"></div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🦈</span>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Shark Management
                  </h1>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateAdvisor}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2 rounded-lg hover:from-amber-400 hover:to-orange-400 flex items-center space-x-2 font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Shark</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30"
          >
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Celebrity Sharks</p>
                <p className="text-2xl font-bold text-white">{celebrityAdvisors.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Custom Sharks</p>
                <p className="text-2xl font-bold text-white">{customAdvisors.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Bot className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">AI Services</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(settings.aiServices).filter((s: any) => s.apiKey).length || '∞'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-500/20 to-rose-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/30"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Sharks</p>
                <p className="text-2xl font-bold text-white">{allAdvisors.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search sharks by name or expertise..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {(['all', 'celebrity', 'custom'] as FilterType[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    filterType === filter
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisors.map((advisor, index) => {
            const isCelebrity = celebrityAdvisors.includes(advisor as any);
            const isHost = advisor.id === 'the-host';
            const aiServiceStatus = getAIServiceStatus(advisor.ai_service || 'claude');

            return (
              <motion.div
                key={advisor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 6) }}
                className={cn(
                  'rounded-xl p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl',
                  isHost
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 border border-white/10 hover:border-amber-500/50'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar
                        avatar_emoji={advisor.avatar_emoji}
                        avatar_image={advisor.avatar_image}
                        avatar_url={advisor.avatar_url}
                        name={advisor.name}
                        size="lg"
                      />
                      {isHost && <span className="absolute -top-1 -right-1 text-lg">👑</span>}
                    </div>
                    <div>
                      <h3 className={cn('font-semibold', isHost ? 'text-amber-400' : 'text-white')}>
                        {advisor.name}
                      </h3>
                      <p className={cn('text-sm', isHost ? 'text-amber-300/80' : 'text-gray-400')}>
                        {advisor.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {isHost && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-black">
                        HOST
                      </span>
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        isCelebrity
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      )}
                    >
                      {isCelebrity ? '🦈 Shark' : '✨ Custom'}
                    </span>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(advisor.expertise || []).slice(0, 3).map(exp => (
                      <span
                        key={exp}
                        className="inline-block px-2 py-1 bg-white/10 text-gray-300 text-xs rounded border border-white/10"
                      >
                        {exp}
                      </span>
                    ))}
                    {(advisor.expertise || []).length > 3 && (
                      <span className="inline-block px-2 py-1 bg-white/5 text-gray-500 text-xs rounded">
                        +{(advisor.expertise || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Service */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{getAIServiceIcon(advisor.ai_service || 'claude')}</span>
                      <span className="text-sm text-gray-400">
                        {(advisor.ai_service || 'claude').charAt(0).toUpperCase() +
                          (advisor.ai_service || 'claude').slice(1)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        aiServiceStatus === 'configured' ? 'bg-green-500' : 'bg-yellow-500'
                      )}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAdvisor(advisor)}
                    className="flex-1 px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 flex items-center justify-center space-x-1 transition-colors border border-white/10"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {!isCelebrity && (
                    <button
                      onClick={() => {
                        setAdvisorToDelete(advisor as unknown as Advisor);
                        setShowDeleteConfirmation(true);
                      }}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAdvisors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center"
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-amber-500/20 border-2 border-amber-500/50">
              <span className="text-4xl">🦈</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No sharks found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first custom shark to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={handleCreateAdvisor}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-3 rounded-lg hover:from-amber-400 hover:to-orange-400 flex items-center space-x-2 mx-auto font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Shark</span>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AdvisorEditModal
        advisor={editingAdvisor}
        isOpen={showEditModal}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setAdvisorToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Shark"
        message={
          advisorToDelete
            ? `Are you sure you want to remove ${advisorToDelete.name} from the Tank? This action cannot be undone.`
            : 'Are you sure you want to delete this shark?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
