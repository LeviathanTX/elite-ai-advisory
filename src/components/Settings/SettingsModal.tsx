import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { AIService, AIServiceConfig } from '../../types';
import { cn } from '../../utils';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

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
    model: 'gpt-4',
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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, addAIService, removeAIService, updateSettings } = useSettings();
  const [editingService, setEditingService] = useState<AIService | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [newService, setNewService] = useState({
    id: 'claude' as AIService,
    name: '',
    apiKey: '',
    baseUrl: '',
    model: '',
  });

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
        content: 'Say OK'
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
            options: { maxTokens: 50, temperature: 0 }
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
            'Authorization': `Bearer ${service.apiKey}`,
          };
          body = {
            model: service.model || 'gpt-4',
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
            contents: [{
              parts: [{ text: testMessage.content }]
            }]
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
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

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
