import React, { useState } from 'react';
import { DocumentStorage } from '../../services/DocumentStorage';
import { DocumentContextService } from '../../services/DocumentContext';
import { useDocumentContext } from '../../hooks/useDocumentContext';

export const DocumentDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [advisorId, setAdvisorId] = useState('test-advisor-1');
  const { getDocumentContext } = useDocumentContext();

  const runDebug = async () => {
    console.log('🔍 Starting document debug...');

    const documentStorage = DocumentStorage.getInstance();
    const contextService = new DocumentContextService();

    // Check what documents exist
    const allDocs = documentStorage.getAllDocuments();
    const advisorDocs = documentStorage.getAdvisorDocuments(advisorId);

    console.log('📄 All documents:', allDocs);
    console.log('👤 Advisor documents:', advisorDocs);

    // Test document context
    let contextResult = null;
    try {
      contextResult = await getDocumentContext(advisorId, ['test message'], []);
      console.log('📚 Document context result:', contextResult);
    } catch (error) {
      console.error('❌ Document context error:', error);
    }

    setDebugInfo({
      allDocuments: allDocs,
      advisorDocuments: advisorDocs,
      advisorId,
      documentContext: contextResult,
      storageKeys: Object.keys(localStorage).filter(key =>
        key.includes('document') || key.includes('advisor')
      ),
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🔍 Document Integration Debugger</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Advisor ID to test:
        </label>
        <input
          type="text"
          value={advisorId}
          onChange={(e) => setAdvisorId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="test-advisor-1"
        />
      </div>

      <button
        onClick={runDebug}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4"
      >
        Run Debug Test
      </button>

      {debugInfo && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Debug Results</h3>
            <div className="text-sm space-y-2">
              <div>
                <strong>Total Documents:</strong> {debugInfo.allDocuments.length}
              </div>
              <div>
                <strong>Advisor Documents:</strong> {debugInfo.advisorDocuments.length}
              </div>
              <div>
                <strong>Document Context Success:</strong> {debugInfo.documentContext ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Storage Keys:</strong> {debugInfo.storageKeys.length}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📄 Document Details</h3>
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold mb-2 text-yellow-800">🔧 Troubleshooting Tips</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Upload a document through the Document Dashboard first</li>
              <li>• Make sure you're selecting documents for the same advisor ID</li>
              <li>• Check that documents have extracted text content</li>
              <li>• Verify the advisor ID matches between upload and conversation</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};