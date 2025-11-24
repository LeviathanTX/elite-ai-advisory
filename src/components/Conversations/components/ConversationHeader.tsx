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
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <span className="text-xl md:text-2xl flex-shrink-0">{selectedMode.icon}</span>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                {selectedMode.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 truncate hidden sm:block">
                {selectedMode.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 flex-wrap gap-2">
          {/* Mode Selector - Hidden on mobile, shown in dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={selectedMode.id}
              onChange={e => {
                const mode = modes.find(m => m.id === e.target.value);
                if (mode) onModeChange(mode);
              }}
              className="px-3 md:px-4 py-2 pr-8 md:pr-10 border border-gray-300 rounded-lg text-xs md:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {modes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.icon} {mode.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>

          {/* Action Buttons with Responsive Labels */}
          <button
            onClick={onToggleAdvisorSelector}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all ${
              selectedAdvisorCount > 0
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Select which advisors participate in this conversation"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Advisors</span>
            {selectedAdvisorCount > 0 && (
              <span className="px-1.5 md:px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                {selectedAdvisorCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleDocumentUpload}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all ${
              documentCount > 0
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Upload and attach documents for context"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Documents</span>
            {documentCount > 0 && (
              <span className="px-1.5 md:px-2 py-0.5 bg-green-600 text-white rounded-full text-xs font-bold">
                {documentCount}
              </span>
            )}
          </button>

          {/* Divider - Hidden on mobile */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>

          <button
            onClick={onToggleSettings}
            className={`p-2 rounded-lg transition-colors ${
              showSettings
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Conversation settings"
          >
            <Settings className="w-4 md:w-5 h-4 md:h-5" />
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors sm:hidden">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
