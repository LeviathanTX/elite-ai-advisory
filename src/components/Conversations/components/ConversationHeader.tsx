// Conversation Header Component
// Extracted from monolithic AdvisoryConversation component

import React from 'react';
import { ArrowLeft, Settings, Users, FileText, MoreHorizontal } from 'lucide-react';
import { ConversationMode } from '../hooks/useConversationState';

interface ConversationHeaderProps {
  selectedMode: ConversationMode;
  selectedAdvisorCount: number;
  documentCount: number;
  showSettings: boolean;
  onBack: () => void;
  onModeChange: (mode: ConversationMode) => void;
  onToggleSettings: () => void;
  onToggleAdvisorSelector: () => void;
  onToggleDocumentUpload: () => void;
  modes: ConversationMode[];
}

export function ConversationHeader({
  selectedMode,
  selectedAdvisorCount,
  documentCount,
  showSettings,
  onBack,
  onModeChange,
  onToggleSettings,
  onToggleAdvisorSelector,
  onToggleDocumentUpload,
  modes,
}: ConversationHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-2xl">{selectedMode.icon}</span>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{selectedMode.name}</h1>
              <p className="text-sm text-gray-500">{selectedMode.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Selector */}
          <select
            value={selectedMode.id}
            onChange={e => {
              const mode = modes.find(m => m.id === e.target.value);
              if (mode) onModeChange(mode);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {modes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.icon} {mode.name}
              </option>
            ))}
          </select>

          {/* Status Indicators */}
          <div className="flex items-center space-x-1">
            {selectedAdvisorCount > 0 && (
              <button
                onClick={onToggleAdvisorSelector}
                className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                title={`${selectedAdvisorCount} advisor(s) selected`}
              >
                <Users className="w-3 h-3 mr-1" />
                {selectedAdvisorCount}
              </button>
            )}

            {documentCount > 0 && (
              <button
                onClick={onToggleDocumentUpload}
                className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200 transition-colors"
                title={`${documentCount} document(s) uploaded`}
              >
                <FileText className="w-3 h-3 mr-1" />
                {documentCount}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={onToggleAdvisorSelector}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Select advisors"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleDocumentUpload}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Upload documents"
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSettings}
            className={`p-2 rounded-lg transition-colors ${
              showSettings
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Conversation settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
