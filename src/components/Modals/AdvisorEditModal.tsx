import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Brain,
  Save,
  Plus,
  Trash2,
  Settings,
  Upload,
  Image,
  Folder,
  FileText,
} from 'lucide-react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Advisor, AdvisorExpertise, AdvisorRole } from '../../types';
import { ConfirmationModal } from './ConfirmationModal';

interface AdvisorEditModalProps {
  advisor: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (advisor: Advisor) => void;
}

const availableExpertise: AdvisorExpertise[] = [
  'Strategy',
  'Finance',
  'Marketing',
  'Operations',
  'Technology',
  'Sales',
  'Product Development',
  'Legal',
  'HR',
  'International Business',
  'Venture Capital',
  'Private Equity',
  'Investment Banking',
  'Startups',
  'Digital Transformation',
  'Supply Chain',
  'Manufacturing',
  'Healthcare',
  'Fintech',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Cybersecurity',
  'Real Estate',
];

const availableRoles: AdvisorRole[] = [
  'CEO',
  'CFO',
  'CTO',
  'CMO',
  'COO',
  'VP Strategy',
  'VP Finance',
  'VP Marketing',
  'VP Operations',
  'VP Technology',
  'Managing Partner',
  'Investment Partner',
  'Board Member',
  'Strategic Advisor',
  'Consultant',
];

const availableEmojis = [
  '👨‍💼',
  '👩‍💼',
  '🧑‍💼',
  '👨‍💻',
  '👩‍💻',
  '🧑‍💻',
  '👨‍🔬',
  '👩‍🔬',
  '🧑‍🔬',
  '👨‍🎓',
  '👩‍🎓',
  '🧑‍🎓',
  '🧠',
  '💡',
  '⚡',
  '🚀',
  '💼',
  '📊',
  '💰',
  '🎯',
  '🔥',
  '⭐',
  '💎',
  '🏆',
];

export function AdvisorEditModal({ advisor, isOpen, onClose, onSave }: AdvisorEditModalProps) {
  const { addAdvisor, updateAdvisor, deleteAdvisor } = useAdvisor();
  const { settings } = useSettings();
  const [formData, setFormData] = useState<Partial<Advisor>>({
    name: '',
    role: 'Strategic Advisor',
    expertise: [],
    personality: '',
    avatar_emoji: '👨‍💼',
    background: '',
    ai_service: 'claude',
    system_prompt: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'emoji' | 'image'>('emoji');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (advisor) {
      setFormData({
        ...advisor,
        expertise: advisor.expertise || [],
      });
      setAvatarMode(advisor.avatar_image ? 'image' : 'emoji');
      setIsCreating(false);
    } else if (isOpen) {
      setFormData({
        name: '',
        role: 'Strategic Advisor',
        expertise: [],
        personality: '',
        avatar_emoji: '👨‍💼',
        background: '',
        ai_service: 'claude',
        system_prompt: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setAvatarMode('emoji');
      setIsCreating(true);
    }
  }, [advisor, isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          avatar_image: result,
          avatar_emoji: '👤', // Set fallback emoji
        }));
        setAvatarMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomImage = () => {
    setFormData(prev => ({
      ...prev,
      avatar_image: undefined,
      avatar_emoji: '👨‍💼',
    }));
    setAvatarMode('emoji');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateSystemPrompt = () => {
    const prompt = `You are ${formData.name}, a ${formData.role} with expertise in ${formData.expertise?.join(', ')}. 

Background: ${formData.background || 'Experienced business professional with a track record of success.'}

Personality: ${formData.personality || 'Professional, analytical, and results-oriented.'}

Your role is to provide strategic advice and insights based on your expertise. Respond in character as ${formData.name}, drawing from your background and personality. Be specific, actionable, and professional in your advice.

Always maintain your persona and provide advice that reflects your expertise areas: ${formData.expertise?.join(', ')}.`;

    setFormData(prev => ({ ...prev, system_prompt: prompt }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.role) {
      alert('Please fill in required fields: Name and Role');
      return;
    }

    const advisorData: Advisor = {
      id: advisor?.id || `advisor-${Date.now()}`,
      name: formData.name!,
      role: formData.role!,
      expertise: formData.expertise || [],
      personality: formData.personality || '',
      avatar_emoji: formData.avatar_emoji || '👨‍💼',
      avatar_image: formData.avatar_image,
      background: formData.background || '',
      ai_service: formData.ai_service || 'claude',
      system_prompt: formData.system_prompt || '',
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isCreating) {
      addAdvisor(advisorData);
    } else {
      updateAdvisor(advisorData);
    }

    if (onSave) {
      onSave(advisorData);
    }

    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (advisor) {
      deleteAdvisor(advisor.id);
      onClose();
    }
  };

  const addExpertise = (expertise: string) => {
    if (expertise && !formData.expertise?.includes(expertise as AdvisorExpertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...(prev.expertise || []), expertise as AdvisorExpertise],
      }));
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise?.filter(e => e !== expertise) || [],
    }));
  };

  const addCustomExpertise = () => {
    if (newExpertise.trim()) {
      addExpertise(newExpertise.trim());
      setNewExpertise('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              {isCreating ? 'Create New Advisor' : `Edit ${advisor?.name}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure advisor details and AI service assignment
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Sarah Chen"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, role: e.target.value as AdvisorRole }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>

                {/* Avatar Mode Toggle */}
                <div className="flex space-x-1 mb-3 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMode('emoji');
                      removeCustomImage();
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      avatarMode === 'emoji'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Brain className="w-4 h-4 inline mr-1" />
                    Emoji
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode('image')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      avatarMode === 'image'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Image className="w-4 h-4 inline mr-1" />
                    Custom Image
                  </button>
                </div>

                {/* Emoji Selection */}
                {avatarMode === 'emoji' && (
                  <div className="flex flex-wrap gap-2">
                    {availableEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            avatar_emoji: emoji,
                            avatar_image: undefined,
                          }))
                        }
                        className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                          formData.avatar_emoji === emoji && !formData.avatar_image
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Upload */}
                {avatarMode === 'image' && (
                  <div className="space-y-3">
                    {/* Current Image Preview */}
                    {formData.avatar_image && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={formData.avatar_image}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Custom avatar image</p>
                          <p className="text-xs text-gray-500">Image uploaded successfully</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCustomImage}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <textarea
                  value={formData.background || ''}
                  onChange={e => setFormData(prev => ({ ...prev, background: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Professional background, achievements, and experience..."
                />
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
                <textarea
                  value={formData.personality || ''}
                  onChange={e => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Communication style, approach, and personality traits..."
                />
              </div>
            </div>

            {/* Expertise and AI Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Expertise & AI Configuration
              </h3>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Expertise
                </label>

                {/* Current Expertise */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.expertise?.map(expertise => (
                    <span
                      key={expertise}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {expertise}
                      <button
                        onClick={() => removeExpertise(expertise)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Expertise */}
                <div className="space-y-2">
                  <select
                    value=""
                    onChange={e => addExpertise(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select expertise to add...</option>
                    {availableExpertise
                      .filter(exp => !formData.expertise?.includes(exp))
                      .map(expertise => (
                        <option key={expertise} value={expertise}>
                          {expertise}
                        </option>
                      ))}
                  </select>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={e => setNewExpertise(e.target.value)}
                      placeholder="Add custom expertise..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      onKeyPress={e => e.key === 'Enter' && addCustomExpertise()}
                    />
                    <button
                      onClick={addCustomExpertise}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Service</label>
                <select
                  value={formData.ai_service || 'claude'}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, ai_service: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="chatgpt">ChatGPT (OpenAI)</option>
                  <option value="gemini">Gemini (Google)</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ✅ Using platform API
                </p>
              </div>

              {/* System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                  <button
                    onClick={generateSystemPrompt}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                  >
                    <Settings className="w-3 h-3 inline mr-1" />
                    Auto-generate
                  </button>
                </div>
                <textarea
                  value={formData.system_prompt || ''}
                  onChange={e => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="System prompt that defines how this advisor behaves and responds..."
                />
              </div>

              {/* MCP Document Folder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Knowledge Base (MCP)
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.mcp_enabled || false}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, mcp_enabled: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <span className="text-xs text-gray-500">
                      {formData.mcp_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {formData.mcp_enabled && (
                  <div className="space-y-3">
                    {/* Folder Path */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Folder Path
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.mcp_folder_path || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, mcp_folder_path: e.target.value }))
                          }
                          placeholder={`/documents/${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'advisor'}`}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const defaultPath = `/documents/${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'advisor'}`;
                            setFormData(prev => ({ ...prev, mcp_folder_path: defaultPath }));
                          }}
                          className="px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    {/* MCP Info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <Folder className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Model Context Protocol (MCP)</p>
                          <ul className="space-y-1 text-blue-700">
                            <li>• Upload documents for this advisor's knowledge base</li>
                            <li>• Advisor will reference these documents in conversations</li>
                            <li>• Supports PDF, DOCX, TXT, and Markdown files</li>
                            <li>• Documents are processed and indexed automatically</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Document Management Preview */}
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          Documents
                        </span>
                        <span className="text-xs text-gray-500">0 files</span>
                      </div>
                      <div className="text-center py-4 text-gray-400">
                        <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents uploaded yet</p>
                        <p className="text-xs">Save this advisor to access document management</p>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.mcp_enabled && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">
                        Enable MCP to provide this advisor with document knowledge
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            {!isCreating && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isCreating ? 'Create Advisor' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Advisor"
        message={
          advisor
            ? `Are you sure you want to delete ${advisor.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this advisor?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
