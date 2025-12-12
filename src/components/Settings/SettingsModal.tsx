import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { AIService, AIServiceConfig } from '../../types';
import { cn, calculatePercentage } from '../../utils';
import { CheckCircle, XCircle, AlertCircle, Loader, User, CreditCard, Settings as SettingsIcon, Users, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Avatar } from '../Common/Avatar';
import { QuickCreateAdvisorModal } from '../Modals/QuickCreateAdvisorModal';
import { AdvisorEditModal } from '../Modals/AdvisorEditModal';
import { CelebrityAdvisorCustomizationModal } from '../Modals/CelebrityAdvisorCustomizationModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_SERVICE_OPTIONS = [
  {
    id: 'claude' as AIService,
    name: 'Claude (Anthropic)',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-20250514',
    placeholder: 'sk-ant-api03-...',
  },
  {
    id: 'gemini' as AIService,
    name: 'Gemini (Google)',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-1.5-pro',
    placeholder: 'AIza...',
  },
  {
    id: 'chatgpt' as AIService,
    name: 'ChatGPT (OpenAI)',
    baseUrl: 'https://api.openai.com',
    model: 'gpt-5.2',
    placeholder: 'sk-...',
  },
  {
    id: 'deepseek' as AIService,
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    placeholder: 'sk-...',
  },
  {
    id: 'groq' as AIService,
    name: 'Groq',
    baseUrl: 'https://api.groq.com',
    model: 'llama3-70b-8192',
    placeholder: 'gsk_...',
  },
];

type ServiceStatus = 'checking' | 'connected' | 'error' | 'unchecked';

type PitchAnimationStyle = 'sound-waves' | 'pulsing-mic' | 'gradient-shift' | 'none';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, addAIService, removeAIService, updateSettings } = useSettings();
  const { currentTier, limits, usage, isTrialActive, trialDaysRemaining } = useSubscription();
  const { user } = useAuth();
  const { customAdvisors, celebrityAdvisors, deleteCustomAdvisor } = useAdvisor();

  const [activeTab, setActiveTab] = useState<'services' | 'account' | 'advisors'>('services');
  const [showCreateAdvisorModal, setShowCreateAdvisorModal] = useState(false);
  const [showEditAdvisorModal, setShowEditAdvisorModal] = useState(false);
  const [showCelebrityEditModal, setShowCelebrityEditModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<any>(null);
  const [editingCelebrityAdvisor, setEditingCelebrityAdvisor] = useState<any>(null);
  const [editingService, setEditingService] = useState<AIService | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [pitchAnimation, setPitchAnimation] = useState<PitchAnimationStyle>(() => {
    return (localStorage.getItem('pitch-card-animation') as PitchAnimationStyle) || 'sound-waves';
  });
  const [newService, setNewService] = useState({
    id: 'claude' as AIService,
    name: '',
    apiKey: '',
    baseUrl: '',
    model: '',
  });

  // Save pitch animation preference
  const handlePitchAnimationChange = (style: PitchAnimationStyle) => {
    setPitchAnimation(style);
    localStorage.setItem('pitch-card-animation', style);
  };

  // Helper for usage percentage
  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0;
    return calculatePercentage(used, limit);
  };

  // Initialize service statuses when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialStatuses: Record<string, ServiceStatus> = {};
      Object.keys(settings.aiServices).forEach(serviceId => {
        initialStatuses[serviceId] = 'unchecked';
      });
      setServiceStatuses(initialStatuses);
    }
  }, [isOpen, settings.aiServices]);

  // Check service status with REAL API call
  const checkServiceStatus = async (serviceId: string, service: AIServiceConfig) => {
    setServiceStatuses(prev => ({ ...prev, [serviceId]: 'checking' }));

    try {
      // Make a REAL API call to test the connection
      const testMessage = {
        role: 'user' as const,
        content: 'Say OK',
      };

      // Try backend proxy first (uses server-side API keys)
      try {
        const proxyResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: serviceId,
            model: service.model,
            messages: [testMessage],
            options: { maxTokens: 50, temperature: 0 },
          }),
        });

        if (proxyResponse.ok) {
          const data = await proxyResponse.json();
          console.log(`✅ ${service.name} connected via backend proxy:`, data);
          setServiceStatuses(prev => ({ ...prev, [serviceId]: 'connected' }));
          return;
        } else {
          console.log(`Backend proxy failed for ${service.name}, trying direct API call...`);
        }
      } catch (proxyError) {
        console.log(`Backend proxy error for ${service.name}:`, proxyError);
      }

      // Fallback to direct API call if proxy fails and user has their own key
      if (!service.apiKey || service.apiKey.length < 10) {
        throw new Error('Backend proxy failed and no user API key configured');
      }

      let apiUrl: string;
      let headers: Record<string, string>;
      let body: any;

      switch (serviceId) {
        case 'claude':
          apiUrl = 'https://api.anthropic.com/v1/messages';
          headers = {
            'Content-Type': 'application/json',
            'x-api-key': service.apiKey,
            'anthropic-version': '2023-06-01',
          };
          body = {
            model: service.model || 'claude-sonnet-4-20250514',
            messages: [testMessage],
            max_tokens: 50,
          };
          break;

        case 'chatgpt':
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${service.apiKey}`,
          };
          body = {
            model: service.model || 'gpt-5.2',
            messages: [testMessage],
            max_tokens: 50,
          };
          break;

        case 'gemini':
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${service.model || 'gemini-1.5-flash'}:generateContent?key=${service.apiKey}`;
          headers = {
            'Content-Type': 'application/json',
          };
          body = {
            contents: [
              {
                parts: [{ text: testMessage.content }],
              },
            ],
          };
          break;

        default:
          throw new Error(`Unsupported service: ${serviceId}`);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${service.name} connected via direct API:`, data);
      setServiceStatuses(prev => ({ ...prev, [serviceId]: 'connected' }));
    } catch (error: any) {
      console.error(`❌ Failed to validate ${service.name}:`, error);
      setServiceStatuses(prev => ({ ...prev, [serviceId]: 'error' }));
    }
  };

  // Get status indicator component
  const getStatusIndicator = (serviceId: string) => {
    const status = serviceStatuses[serviceId] || 'unchecked';

    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center text-blue-600">
            <Loader className="w-4 h-4 animate-spin mr-1" />
            <span className="text-xs">Checking...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Connected</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Unchecked</span>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  const handleAddService = () => {
    const serviceTemplate = AI_SERVICE_OPTIONS.find(s => s.id === newService.id);
    if (serviceTemplate && newService.apiKey.trim()) {
      const serviceConfig: AIServiceConfig = {
        id: newService.id,
        name: serviceTemplate.name,
        apiKey: newService.apiKey.trim(),
        baseUrl: serviceTemplate.baseUrl,
        model: serviceTemplate.model,
      };
      addAIService(serviceConfig);
      setNewService({
        id: 'claude' as AIService,
        name: '',
        apiKey: '',
        baseUrl: '',
        model: '',
      });
    }
  };

  const handleSetDefault = (serviceId: AIService) => {
    updateSettings({
      ...settings,
      defaultAIService: serviceId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('services')}
              className={cn(
                'flex items-center space-x-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'services'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>AI Services</span>
            </button>
            <button
              onClick={() => setActiveTab('advisors')}
              className={cn(
                'flex items-center space-x-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'advisors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Manage Advisors</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                'flex items-center space-x-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'account'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Account Tab Content */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Profile Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">{user?.email || 'Not logged in'}</span>
                  </div>
                  {user?.full_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium text-gray-900">{user.full_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Plan</span>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        currentTier === 'founder' && 'bg-blue-100 text-blue-800',
                        currentTier === 'scale-up' && 'bg-purple-100 text-purple-800',
                        currentTier === 'enterprise' && 'bg-green-100 text-green-800'
                      )}
                    >
                      {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                    </span>
                  </div>
                  {isTrialActive && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Status</span>
                      <span className="font-medium text-orange-600">
                        {trialDaysRemaining} days remaining
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Advisor Hours */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">AI Advisor Hours</h4>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {usage.ai_advisor_hours_used}
                      {limits.ai_advisor_hours !== -1 && ` / ${limits.ai_advisor_hours}`}
                      {limits.ai_advisor_hours === -1 && ' (unlimited)'}
                    </div>
                    {limits.ai_advisor_hours !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, getUsagePercentage(usage.ai_advisor_hours_used, limits.ai_advisor_hours))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Document Analyses */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Document Analyses</h4>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {usage.document_analyses_used}
                      {limits.document_analyses !== -1 && ` / ${limits.document_analyses}`}
                      {limits.document_analyses === -1 && ' (unlimited)'}
                    </div>
                    {limits.document_analyses !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, getUsagePercentage(usage.document_analyses_used, limits.document_analyses))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pitch Sessions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Pitch Sessions</h4>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {usage.pitch_practice_sessions_used}
                      {limits.pitch_practice_sessions !== -1 && ` / ${limits.pitch_practice_sessions}`}
                      {limits.pitch_practice_sessions === -1 && ' (unlimited)'}
                    </div>
                    {limits.pitch_practice_sessions !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, getUsagePercentage(usage.pitch_practice_sessions_used, limits.pitch_practice_sessions))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Custom Advisors */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Custom Advisors</h4>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {customAdvisors.length}
                      {limits.custom_advisors !== -1 && ` / ${limits.custom_advisors}`}
                      {limits.custom_advisors === -1 && ' (unlimited)'}
                    </div>
                    {limits.custom_advisors !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, getUsagePercentage(customAdvisors.length, limits.custom_advisors))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Pitch Practice Animation</label>
                      <p className="text-sm text-gray-500">Choose the visual style for the Pitch Practice card</p>
                    </div>
                    <select
                      value={pitchAnimation}
                      onChange={(e) => handlePitchAnimationChange(e.target.value as PitchAnimationStyle)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sound-waves">Sound Waves</option>
                      <option value="pulsing-mic">Pulsing Microphone</option>
                      <option value="gradient-shift">Gradient Shift</option>
                      <option value="none">None (Static)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Manage your subscription and payment methods
                  </p>
                  <button
                    disabled
                    className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    Upgrade Plan (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Services Tab Content */}
          {activeTab === 'services' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Service Configuration</h3>
            <p className="text-gray-600 mb-6">
              Configure API keys for AI services. If multiple services are configured, you can
              assign specific services to individual advisors.
            </p>

            {/* Current Services */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">Configured Services</h4>
                {Object.keys(settings.aiServices).length > 0 && (
                  <button
                    onClick={() => {
                      Object.entries(settings.aiServices).forEach(([serviceId, service]) => {
                        checkServiceStatus(serviceId, service);
                      });
                    }}
                    className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded border border-green-200"
                  >
                    Test All Services
                  </button>
                )}
              </div>
              {Object.keys(settings.aiServices).length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">No AI services configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.values(settings.aiServices).map(service => (
                    <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">{service.name}</h5>
                            {settings.defaultAIService === service.id && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                            {getStatusIndicator(service.id)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Model: {service.model} • API Key: {service.apiKey.substring(0, 8)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => checkServiceStatus(service.id, service)}
                            disabled={serviceStatuses[service.id] === 'checking'}
                            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          >
                            Test
                          </button>
                          {settings.defaultAIService !== service.id && (
                            <button
                              onClick={() => handleSetDefault(service.id)}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => removeAIService(service.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Service */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Add AI Service</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Service</label>
                  <select
                    value={newService.id}
                    onChange={e =>
                      setNewService({ ...newService, id: e.target.value as AIService })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AI_SERVICE_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={newService.apiKey}
                    onChange={e => setNewService({ ...newService, apiKey: e.target.value })}
                    placeholder={AI_SERVICE_OPTIONS.find(s => s.id === newService.id)?.placeholder}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddService}
                  disabled={!newService.apiKey.trim()}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium',
                    newService.apiKey.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  Add Service
                </button>
              </div>
            </div>

            {/* Configuration Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Configuration Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If only one service is configured, it will be used for all advisors</li>
                <li>
                  • With multiple services, you can assign specific services to advisors in the
                  advisor settings
                </li>
                <li>• The default service is used when no specific assignment is made</li>
                <li>• API keys are stored locally in your browser and never sent to our servers</li>
              </ul>
            </div>

            {/* Demo Mode Notice */}
            {!process.env.REACT_APP_SUPABASE_URL && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">🚀 Demo Mode</h4>
                <p className="text-sm text-yellow-800">
                  You're in demo mode. A default Claude API key has been pre-configured for testing.
                  In production, you would need to provide your own API keys.
                </p>
              </div>
            )}
          </div>
          )}

          {/* Manage Advisors Tab Content */}
          {activeTab === 'advisors' && (
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Manage Advisors</h3>
                  <p className="text-gray-600 mt-1">
                    Create and manage your custom AI advisors
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateAdvisorModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Advisor</span>
                </button>
              </div>

              {/* Custom Advisors List */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Your Custom Advisors ({customAdvisors.length})
                </h4>
                {customAdvisors.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">You haven't created any custom advisors yet</p>
                    <button
                      onClick={() => setShowCreateAdvisorModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Your First Advisor
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customAdvisors.map(advisor => (
                      <div key={advisor.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              avatar_emoji={advisor.avatar_emoji}
                              avatar_image={advisor.avatar_image}
                              avatar_url={(advisor as any).avatar_url}
                              name={advisor.name}
                              size="md"
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{advisor.name}</h5>
                              <p className="text-sm text-gray-500">{advisor.role || advisor.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingAdvisor(advisor);
                                setShowEditAdvisorModal(true);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit advisor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${advisor.name}?`)) {
                                  deleteCustomAdvisor(advisor.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete advisor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {advisor.expertise && advisor.expertise.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {advisor.expertise.slice(0, 4).map((exp, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {exp}
                              </span>
                            ))}
                            {advisor.expertise.length > 4 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{advisor.expertise.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bear Persona Advisors - Editable */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Bear Persona Advisors ({celebrityAdvisors.length} available)
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Customize AI service and system prompts for bear persona advisors.
                </p>
                {/* Disclaimer */}
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Our AI advisors are original bear characters inspired by legendary business minds.
                    They are not the actual celebrities and are not endorsed by or affiliated with any real individuals.
                  </p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {celebrityAdvisors.map(advisor => (
                    <div key={advisor.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            avatar_emoji={advisor.avatar_emoji}
                            avatar_image={advisor.avatar_image}
                            avatar_url={(advisor as any).avatar_url}
                            name={advisor.name}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center space-x-1">
                              <h5 className="font-medium text-gray-900 text-sm">{advisor.name}</h5>
                              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                            </div>
                            <p className="text-xs text-gray-500">{advisor.role || advisor.title}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingCelebrityAdvisor(advisor);
                            setShowCelebrityEditModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Customize advisor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Limit Info */}
              {limits.custom_advisors !== -1 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Custom Advisor Limit</span>
                    <span className="text-sm text-gray-600">
                      {customAdvisors.length} / {limits.custom_advisors}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, getUsagePercentage(customAdvisors.length, limits.custom_advisors))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Create New Advisor Modal */}
      <QuickCreateAdvisorModal
        isOpen={showCreateAdvisorModal}
        onClose={() => setShowCreateAdvisorModal(false)}
        onAdvisorCreated={() => {
          setShowCreateAdvisorModal(false);
        }}
      />

      {/* Edit Advisor Modal */}
      <AdvisorEditModal
        advisor={editingAdvisor}
        isOpen={showEditAdvisorModal}
        onClose={() => {
          setShowEditAdvisorModal(false);
          setEditingAdvisor(null);
        }}
        onSave={() => {
          setShowEditAdvisorModal(false);
          setEditingAdvisor(null);
        }}
      />

      {/* Celebrity Advisor Customization Modal */}
      <CelebrityAdvisorCustomizationModal
        advisor={editingCelebrityAdvisor}
        isOpen={showCelebrityEditModal}
        onClose={() => {
          setShowCelebrityEditModal(false);
          setEditingCelebrityAdvisor(null);
        }}
        onSave={() => {
          setShowCelebrityEditModal(false);
          setEditingCelebrityAdvisor(null);
        }}
      />
    </div>
  );
};
