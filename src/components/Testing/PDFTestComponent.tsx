import React, { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DocumentProcessor } from '../../services/DocumentProcessor';
import { quickPDFTest } from '../../utils/pdfWorkerTest';

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

export function PDFTestComponent() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentProcessor = new DocumentProcessor();

  const runWorkerTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Run the comprehensive worker tests
      await quickPDFTest();

      setTestResults([
        {
          success: true,
          message: 'PDF.js worker configuration successful',
          details: 'All worker tests passed. Check browser console for detailed results.'
        }
      ]);
    } catch (error) {
      setTestResults([
        {
          success: false,
          message: 'PDF.js worker test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const testPDFProcessing = async () => {
    if (!selectedFile) {
      setTestResults([{
        success: false,
        message: 'No file selected',
        details: 'Please select a PDF file to test processing'
      }]);
      return;
    }

    setIsLoading(true);
    setTestResults([]);

    try {
      // Validate file
      const validation = documentProcessor.validateFile(selectedFile);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Process the file
      const result = await documentProcessor.processFile(selectedFile);

      setTestResults([
        {
          success: true,
          message: 'PDF processing successful',
          details: `Extracted ${result.metadata.wordCount} words from ${result.metadata.pages} pages. File size: ${DocumentProcessor.formatFileSize(result.metadata.size)}`
        }
      ]);

      console.log('📄 Full extracted text:', result.text.substring(0, 500) + '...');
      console.log('📊 Processing metadata:', result.metadata);

    } catch (error) {
      setTestResults([
        {
          success: false,
          message: 'PDF processing failed',
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF.js Worker Test Suite</h2>
        <p className="text-gray-600">
          Test your PDF.js worker configuration and document processing capabilities.
        </p>
      </div>

      <div className="space-y-4">
        {/* Worker Test Section */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Worker Configuration Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tests the PDF.js worker setup, compatibility, and basic functionality.
          </p>
          <button
            onClick={runWorkerTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Run Worker Tests'}
          </button>
        </div>

        {/* File Processing Test Section */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">PDF Processing Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a PDF file to test the complete document processing pipeline.
          </p>

          <div className="space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <span className="text-gray-500">
                  ({DocumentProcessor.formatFileSize(selectedFile.size)})
                </span>
              </div>
            )}

            <button
              onClick={testPDFProcessing}
              disabled={!selectedFile || isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Test PDF Processing'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {testResults.length > 0 && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.success
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                  {result.details && (
                    <p
                      className={`text-sm ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {result.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Testing Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Worker tests verify PDF.js configuration and compatibility</li>
                <li>• Processing tests use your actual DocumentProcessor service</li>
                <li>• Check browser console for detailed test output</li>
                <li>• Tests cover both local worker files and CDN fallbacks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}