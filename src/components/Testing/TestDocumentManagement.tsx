import React, { useState } from 'react';
import { DocumentDashboard } from '../Documents/DocumentDashboard';
import { DocumentManagement } from '../MCP/DocumentManagement';
import { DocumentDebugger } from '../Debug/DocumentDebugger';
import { FileText, Upload, Bug } from 'lucide-react';
import { Advisor, AdvisorExpertise } from '../../types';

export const TestDocumentManagement: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMCPManager, setShowMCPManager] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  // Mock advisor for testing
  const mockAdvisor: Advisor = {
    id: 'test-advisor-1',
    name: 'Test Advisor',
    role: 'CEO',
    expertise: ['Strategy', 'Finance'] as AdvisorExpertise[],
    personality: 'Professional and analytical',
    avatar_emoji: '👨‍💼',
    background: 'Experienced business leader',
    ai_service: 'claude',
    system_prompt: 'You are a test advisor',
    mcp_enabled: true,
    mcp_folder_path: '/documents/test-advisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Management Testing</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Document Dashboard Test */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Document Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Test the comprehensive document management system with upload, search, filtering, and
              organization features.
            </p>
            <button
              onClick={() => setShowDashboard(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Open Document Dashboard
            </button>
          </div>

          {/* MCP Document Manager Test */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              MCP Document Manager
            </h2>
            <p className="text-gray-600 mb-4">
              Test the advisor-specific document upload and management system for MCP knowledge
              bases.
            </p>
            <button
              onClick={() => setShowMCPManager(true)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Open MCP Manager
            </button>
          </div>

          {/* Document Integration Debugger */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-red-600" />
              Debug Integration
            </h2>
            <p className="text-gray-600 mb-4">
              Debug and troubleshoot document integration issues. Check if documents are properly
              stored and accessible.
            </p>
            <button
              onClick={() => setShowDebugger(true)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
            >
              <Bug className="w-4 h-4 mr-2" />
              Open Debugger
            </button>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Testing Instructions</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900">Document Dashboard Features:</h4>
              <ul className="list-disc ml-5 mt-1">
                <li>Drag and drop file upload (PDF, DOCX, XLSX, TXT, MD)</li>
                <li>Grid and list view modes</li>
                <li>Search functionality</li>
                <li>Category and confidentiality filters</li>
                <li>Document preview and management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">MCP Manager Features:</h4>
              <ul className="list-disc ml-5 mt-1">
                <li>Advisor-specific document uploads</li>
                <li>Document processing and text extraction</li>
                <li>File validation and error handling</li>
                <li>Document organization and deletion</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Test Files:</h4>
              <p>Try uploading different file types to test the document processing:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>PDF documents</li>
                <li>Word documents (.docx)</li>
                <li>Excel spreadsheets (.xlsx)</li>
                <li>Text files (.txt)</li>
                <li>Markdown files (.md)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">🔧 Troubleshooting Issues:</h4>
              <p>If advisors say they can't access document content:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>
                  Use the <strong>Debug Integration</strong> tool above to check if documents are
                  stored
                </li>
                <li>Ensure you're using the same advisor ID for upload and conversation</li>
                <li>
                  Verify documents are uploaded to <code>test-advisor-1</code> (the mock advisor)
                </li>
                <li>Check browser console for any integration errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        userId="test-user-1"
      />

      <DocumentManagement
        advisor={mockAdvisor}
        isOpen={showMCPManager}
        onClose={() => setShowMCPManager(false)}
      />

      {/* Document Debugger Modal */}
      {showDebugger && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="p-4">
            <button
              onClick={() => setShowDebugger(false)}
              className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Back to Testing
            </button>
            <DocumentDebugger />
          </div>
        </div>
      )}
    </div>
  );
};
