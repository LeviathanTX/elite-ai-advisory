import React, { useState, useEffect } from 'react';
import { X, Star, Bot, Settings, Save, RotateCcw } from 'lucide-react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Advisor, AIService } from '../../types';

interface CelebrityAdvisorCustomizationModalProps {
  advisor: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (advisor: Advisor) => void;
}

export function CelebrityAdvisorCustomizationModal({
  advisor,
  isOpen,
  onClose,
  onSave,
}: CelebrityAdvisorCustomizationModalProps) {
  const { updateAdvisor } = useAdvisor();
  const { settings } = useSettings();
  const [aiService, setAiService] = useState<string>('claude');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (advisor) {
      setAiService(advisor.ai_service || 'claude');
      setSystemPrompt(advisor.system_prompt || generateDefaultPrompt(advisor));
      setIsModified(false);
    }
  }, [advisor]);

  const generateDefaultPrompt = (advisor: Advisor) => {
    if (!advisor) return '';

    return `You are ${advisor.name}, the renowned ${advisor.role || advisor.title} at ${advisor.company || 'your company'}.

Background: ${advisor.background || `You are known for your expertise in ${(advisor.expertise || []).join(', ')} and your unique approach to business challenges.`}

Communication Style: ${advisor.personality || `Professional, insightful, and direct. You draw from your extensive experience and provide actionable advice.`}

Your role is to provide strategic advice and insights based on your real-world experience and expertise. Respond in character as ${advisor.name}, maintaining your known personality and communication style.

Key areas of expertise: ${(advisor.expertise || []).join(', ')}

Always provide specific, actionable advice that reflects your unique perspective and experience in the business world.`;
  };

  const handleAiServiceChange = (service: string) => {
    setAiService(service);
    setIsModified(true);
  };

  const handlePromptChange = (prompt: string) => {
    setSystemPrompt(prompt);
    setIsModified(true);
  };

  const handleSave = () => {
    if (!advisor) return;

    const updatedAdvisor: Advisor = {
      ...advisor,
      ai_service: aiService as any,
      system_prompt: systemPrompt,
      updated_at: new Date().toISOString(),
    };

    updateAdvisor(updatedAdvisor);

    if (onSave) {
      onSave(updatedAdvisor);
    }

    setIsModified(false);
    onClose();
  };

  const handleReset = () => {
    if (advisor) {
      setSystemPrompt(generateDefaultPrompt(advisor));
      setIsModified(true);
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
    return settings.aiServices[service as AIService]?.apiKey ? 'configured' : 'needs-key';
  };

  if (!isOpen || !advisor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Customize {advisor.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure AI service and conversation style for this celebrity advisor
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
          {/* Advisor Info (Read-only) */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">{advisor.avatar_emoji || '👤'}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
                <p className="text-gray-600">{advisor.role || advisor.title}</p>
                <p className="text-sm text-gray-500">{advisor.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Expertise Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {(advisor.expertise || []).map(exp => (
                    <span
                      key={exp}
                      className="inline-block px-2 py-1 bg-white text-gray-700 text-xs rounded border"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                <p className="text-sm text-gray-600">
                  {advisor.personality || 'Professional and insightful'}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Star className="w-4 h-4 inline mr-1" />
                Celebrity advisor details are read-only. You can only customize the AI service and
                conversation prompts.
              </p>
            </div>
          </div>

          {/* AI Service Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              AI Service Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.aiServices).map(([service, config]) => {
                const isSelected = aiService === service;
                const status = getAIServiceStatus(service);

                return (
                  <button
                    key={service}
                    onClick={() => handleAiServiceChange(service)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getAIServiceIcon(service)}</span>
                        <span className="font-medium text-gray-900 capitalize">{service}</span>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === 'configured' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {status === 'configured' ? '✅ Ready to use' : '⚠️ API key required'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Prompt Customization */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Conversation Instructions
              </h3>
              <button
                onClick={handleReset}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Instructions for {advisor.name}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                These instructions will guide how {advisor.name} responds in conversations. Be
                specific about their expertise, communication style, and approach to advice.
              </p>
            </div>

            <textarea
              value={systemPrompt}
              onChange={e => handlePromptChange(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
              placeholder="Enter custom instructions for how this advisor should behave..."
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Characters: {systemPrompt.length}</span>
              <span>Recommended: 500-1500 characters for best results</span>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
            <p className="text-sm text-blue-800">
              {advisor.name} will use{' '}
              <strong>{aiService.charAt(0).toUpperCase() + aiService.slice(1)}</strong> AI service
              with your custom instructions to provide advice that matches their real-world
              expertise and personality.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isModified && <span className="text-orange-600">• Unsaved changes</span>}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isModified}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Customization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
