import React, { useState } from 'react';
import {
  X,
  Zap,
  Users,
  Brain,
  TrendingUp,
  Code,
  Briefcase,
  Target,
  Star,
  Plus,
} from 'lucide-react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Advisor, AdvisorRole, AdvisorExpertise } from '../../types';

interface QuickCreateAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdvisorCreated?: (advisor: Advisor) => void;
}

interface AdvisorTemplate {
  id: string;
  name: string;
  role: AdvisorRole;
  expertise: AdvisorExpertise[];
  personality: string;
  background: string;
  avatar_emoji: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const advisorTemplates: AdvisorTemplate[] = [
  {
    id: 'vc',
    name: 'Venture Capitalist',
    role: 'Investment Partner',
    expertise: ['Venture Capital', 'Startups', 'Finance', 'Strategy'],
    personality: 'Analytical, risk-aware, and focused on scalability and market potential.',
    background:
      'Experienced venture capitalist with a track record of identifying and scaling high-growth startups.',
    avatar_emoji: '💰',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Investment-focused advisor for funding and growth strategies',
    color: 'bg-green-500',
  },
  {
    id: 'marketing',
    name: 'Marketing Expert',
    role: 'CMO',
    expertise: ['Marketing', 'Digital Transformation', 'Strategy', 'Sales'],
    personality:
      'Creative, data-driven, and passionate about building brands and customer engagement.',
    background:
      'Senior marketing executive with expertise in digital marketing, brand building, and customer acquisition.',
    avatar_emoji: '📢',
    icon: <Target className="w-5 h-5" />,
    description: 'Brand building and customer acquisition specialist',
    color: 'bg-pink-500',
  },
  {
    id: 'tech_cto',
    name: 'Tech CTO',
    role: 'CTO',
    expertise: ['Technology', 'AI/ML', 'Product Development', 'Operations'],
    personality: 'Technical, innovative, and focused on building scalable technology solutions.',
    background:
      'Technology leader with deep expertise in software development, AI/ML, and technical strategy.',
    avatar_emoji: '💻',
    icon: <Code className="w-5 h-5" />,
    description: 'Technical strategy and product development expert',
    color: 'bg-blue-500',
  },
  {
    id: 'operations',
    name: 'Operations Expert',
    role: 'COO',
    expertise: ['Operations', 'Supply Chain', 'Manufacturing', 'Strategy'],
    personality: 'Process-oriented, efficiency-focused, and skilled at scaling operations.',
    background: 'Operations executive with experience scaling businesses and optimizing processes.',
    avatar_emoji: '⚙️',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Operational excellence and process optimization specialist',
    color: 'bg-orange-500',
  },
  {
    id: 'finance',
    name: 'Finance Expert',
    role: 'CFO',
    expertise: ['Finance', 'Strategy', 'Investment Banking', 'Operations'],
    personality: 'Analytical, detail-oriented, and focused on financial health and growth.',
    background:
      'Financial executive with expertise in corporate finance, fundraising, and financial strategy.',
    avatar_emoji: '📊',
    icon: <Brain className="w-5 h-5" />,
    description: 'Financial strategy and capital management expert',
    color: 'bg-indigo-500',
  },
  {
    id: 'sales',
    name: 'Sales Leader',
    role: 'Strategic Advisor',
    expertise: ['Sales', 'Marketing', 'Strategy', 'Startups'],
    personality: 'Results-driven, relationship-focused, and passionate about revenue growth.',
    background: 'Sales executive with proven track record of building and scaling sales teams.',
    avatar_emoji: '🎯',
    icon: <Target className="w-5 h-5" />,
    description: 'Revenue growth and sales strategy specialist',
    color: 'bg-red-500',
  },
];

export function QuickCreateAdvisorModal({
  isOpen,
  onClose,
  onAdvisorCreated,
}: QuickCreateAdvisorModalProps) {
  const { addAdvisor } = useAdvisor();
  const { settings } = useSettings();
  const [selectedTemplate, setSelectedTemplate] = useState<AdvisorTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = (template: AdvisorTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
  };

  const handleQuickCreate = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);

    const newAdvisor: Advisor = {
      id: `advisor-${Date.now()}`,
      name: customName || selectedTemplate.name,
      role: selectedTemplate.role,
      expertise: selectedTemplate.expertise,
      personality: selectedTemplate.personality,
      avatar_emoji: selectedTemplate.avatar_emoji,
      background: selectedTemplate.background,
      ai_service: 'claude', // Default to Claude
      system_prompt: generateSystemPrompt(selectedTemplate, customName || selectedTemplate.name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      addAdvisor(newAdvisor);

      if (onAdvisorCreated) {
        onAdvisorCreated(newAdvisor);
      }

      // Reset form
      setSelectedTemplate(null);
      setCustomName('');

      onClose();
    } catch (error) {
      console.error('Error creating advisor:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const generateSystemPrompt = (template: AdvisorTemplate, name: string) => {
    return `You are ${name}, a ${template.role} with expertise in ${template.expertise.join(', ')}.

Background: ${template.background}

Personality: ${template.personality}

Your role is to provide strategic advice and insights based on your expertise. Respond in character as ${name}, drawing from your background and personality. Be specific, actionable, and professional in your advice.

Always maintain your persona and provide advice that reflects your expertise areas: ${template.expertise.join(', ')}.`;
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-purple-600" />
              Quick Create Advisor
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template and customize your new advisor
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedTemplate ? (
            <>
              {/* Template Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Choose an Advisor Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {advisorTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}
                        >
                          <div className="text-white">{template.icon}</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600">{template.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.expertise.slice(0, 3).map(exp => (
                          <span
                            key={exp}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {exp}
                          </span>
                        ))}
                        {template.expertise.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{template.expertise.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Option */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    // Close this modal and open the full advisor edit modal
                    handleClose();
                    // This would trigger opening the full AdvisorEditModal
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-300 transition-all text-center group"
                >
                  <div className="flex items-center justify-center space-x-2 text-gray-600 group-hover:text-purple-600">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create Custom Advisor</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Build from scratch with full customization
                  </p>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Template Customization */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-4"
                >
                  ← Back to Templates
                </button>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedTemplate.color}`}
                    >
                      <span className="text-3xl">{selectedTemplate.avatar_emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedTemplate.name}
                      </h3>
                      <p className="text-gray-600">{selectedTemplate.role}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Expertise Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.expertise.map(exp => (
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
                      <h4 className="font-medium text-gray-900 mb-2">Background</h4>
                      <p className="text-sm text-gray-600">{selectedTemplate.background}</p>
                    </div>
                  </div>
                </div>

                {/* Customization */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customize Your Advisor</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Advisor Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={selectedTemplate.name}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can further customize this advisor after creation
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              AI Service:{' '}
              {settings.aiServices.claude?.apiKey
                ? '✅ Claude configured'
                : '⚠️ Configure AI service in settings'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickCreate}
                disabled={!customName.trim() || isCreating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Create Advisor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
