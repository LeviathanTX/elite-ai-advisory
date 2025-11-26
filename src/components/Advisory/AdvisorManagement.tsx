import React, { useState } from 'react';
import { Plus, Edit, Star, Bot, Search, Users, Zap } from 'lucide-react';
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
                <Users className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Advisor Management</h1>
              </div>
            </div>
            <button
              onClick={handleCreateAdvisor}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Advisor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Celebrity Advisors</p>
                <p className="text-2xl font-bold text-gray-900">{celebrityAdvisors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Custom Advisors</p>
                <p className="text-2xl font-bold text-gray-900">{customAdvisors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(settings.aiServices).filter((s: any) => s.apiKey).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                  placeholder="Search advisors by name or expertise..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {(['all', 'celebrity', 'custom', 'active', 'available'] as FilterType[]).map(
                filter => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === filter
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisors.map(advisor => {
            const isCelebrity = celebrityAdvisors.includes(advisor as any);
            const isHost = advisor.id === 'the-host';
            const aiServiceStatus = getAIServiceStatus(advisor.ai_service || 'claude');

            return (
              <div
                key={advisor.id}
                className={cn(
                  'rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow',
                  isHost
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg ring-2 ring-amber-200'
                    : 'bg-white'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      avatar_emoji={advisor.avatar_emoji}
                      avatar_image={advisor.avatar_image}
                      avatar_url={advisor.avatar_url}
                      name={advisor.name}
                      size="lg"
                    />
                    <div>
                      <h3
                        className={cn('font-semibold', isHost ? 'text-amber-900' : 'text-gray-900')}
                      >
                        {advisor.name}
                      </h3>
                      <p className={cn('text-sm', isHost ? 'text-amber-700' : 'text-gray-600')}>
                        {advisor.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {isHost && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
                        HOST
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isCelebrity ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isCelebrity ? 'Celebrity' : 'Custom'}
                    </span>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">EXPERTISE</p>
                  <div className="flex flex-wrap gap-1">
                    {(advisor.expertise || []).slice(0, 3).map(exp => (
                      <span
                        key={exp}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {exp}
                      </span>
                    ))}
                    {(advisor.expertise || []).length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
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
                      <span className="text-sm text-gray-600">
                        {(advisor.ai_service || 'claude').charAt(0).toUpperCase() +
                          (advisor.ai_service || 'claude').slice(1)}
                      </span>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        aiServiceStatus === 'configured' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    ></div>
                  </div>
                  {aiServiceStatus === 'needs-key' && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ API key required</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAdvisor(advisor)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-1"
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
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAdvisors.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No advisors found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first custom advisor to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={handleCreateAdvisor}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Advisor</span>
              </button>
            )}
          </div>
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
        title="Delete Advisor"
        message={
          advisorToDelete
            ? `Are you sure you want to delete ${advisorToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this advisor?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
