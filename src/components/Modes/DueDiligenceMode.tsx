import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { createAdvisorAI } from '../../services/advisorAI';
import { cn } from '../../utils';
import { Avatar } from '../Common/Avatar';

interface DueDiligenceModeProps {
  onBack: () => void;
}

export const DueDiligenceMode: React.FC<DueDiligenceModeProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('');
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [discussionMessages, setDiscussionMessages] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const { advisors } = useAdvisor();
  const { settings } = useSettings();

  const isConfigured = Object.values(settings.aiServices).some((service: any) => service.apiKey);

  const analysisTypes = [
    {
      id: 'startup_pitch',
      name: 'Startup Pitch Deck',
      description: 'Evaluate startup potential and investment opportunity',
    },
    {
      id: 'financial_statements',
      name: 'Financial Statements',
      description: 'Analyze financial health and performance',
    },
    {
      id: 'market_research',
      name: 'Market Research',
      description: 'Assess market opportunity and competitive landscape',
    },
    {
      id: 'business_plan',
      name: 'Business Plan',
      description: 'Review strategic direction and execution plan',
    },
    {
      id: 'legal_documents',
      name: 'Legal Documents',
      description: 'Examine contracts, IP, and legal structures',
    },
    {
      id: 'technical_specs',
      name: 'Technical Specifications',
      description: 'Evaluate technology and product architecture',
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev =>
      prev.includes(advisorId) ? prev.filter(id => id !== advisorId) : [...prev, advisorId]
    );
  };

  const getAIService = (serviceName: string) => {
    return settings.aiServices[serviceName as keyof typeof settings.aiServices];
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !analysisType || selectedAdvisors.length === 0) return;

    setIsAnalyzing(true);

    try {
      // Simulate document analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockAnalysis = {
        fileName: selectedFile.name,
        analysisType: analysisTypes.find(t => t.id === analysisType)?.name || analysisType,
        overallScore: Math.floor(Math.random() * 30) + 70,
        summary:
          'This investment opportunity shows strong potential with experienced leadership and clear market positioning.',
        keyFindings: [
          'Strong product-market fit in growing sector',
          'Experienced management team with relevant background',
          'Clear competitive advantages and defensible moat',
          'Realistic financial projections with conservative growth assumptions',
        ],
        riskFactors: [
          'Competitive market with established players',
          'Regulatory compliance requirements in target markets',
          'Dependency on key partnerships for distribution',
        ],
        recommendation: 'Proceed with investment pending final due diligence',
        recommendations: [
          'Conduct detailed financial audit',
          'Verify key customer contracts and retention rates',
          'Review IP portfolio and competitive positioning',
        ],
      };

      setAnalysis(mockAnalysis);
      setDiscussionMessages([]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !analysis || selectedAdvisors.length === 0) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: newQuestion.trim(),
    };

    setDiscussionMessages(prev => [...prev, userMessage]);
    setNewQuestion('');
    setIsGeneratingResponse(true);

    try {
      const selectedAdvisorData = advisors.filter(advisor => selectedAdvisors.includes(advisor.id));
      const responses = await generateAdvisorDiscussion(
        selectedAdvisorData,
        newQuestion.trim(),
        discussionMessages
      );

      // Add responses with slight delays to simulate real conversation
      for (let i = 0; i < responses.length; i++) {
        setTimeout(
          () => {
            setDiscussionMessages(prev => [...prev, responses[i]]);
            if (i === responses.length - 1) {
              setIsGeneratingResponse(false);
            }
          },
          (i + 1) * 2000
        );
      }
    } catch (error) {
      console.error('Failed to generate discussion:', error);
      setIsGeneratingResponse(false);
    }
  };

  const generateAdvisorDiscussion = async (
    advisors: any[],
    question: string,
    context: any[]
  ): Promise<any[]> => {
    const responses: any[] = [];
    const conversationContext = context
      .slice(-10)
      .map(msg => `${msg.advisor || 'User'}: ${msg.content}`)
      .join('\n');

    for (let i = 0; i < advisors.length; i++) {
      const advisor = advisors[i];
      const otherAdvisors = advisors.filter((_, index) => index !== i).map(a => a.name);
      const previousResponses = responses.map(r => `${r.advisor}: ${r.content}`).join('\n');

      try {
        if (isConfigured) {
          const aiService = getAIService(advisor?.aiService || settings.defaultAIService!);
          if (aiService) {
            const advisorAI = createAdvisorAI(aiService);

            // Enhanced system prompt with debate dynamics
            const systemPrompt: string = `You are ${advisor.name} in an investment committee meeting discussing the due diligence analysis of ${analysis.fileName} (${analysis.analysisType}).

INVESTMENT CONTEXT:
- Overall Score: ${analysis.overallScore}/100
- Recommendation: ${analysis.recommendation}
- Analysis Summary: ${analysis.summary}
- Key Findings: ${analysis.keyFindings.join(', ')}
- Risk Factors: ${analysis.riskFactors.join(', ')}

COMMITTEE DYNAMICS:
- Other advisors present: ${otherAdvisors.join(', ')}
- Your role: Provide your unique perspective based on your expertise
- Meeting stage: ${responses.length === 0 ? 'Initial responses' : 'Debate/discussion phase'}

RECENT CONVERSATION:
${conversationContext}

${previousResponses ? `ADVISOR RESPONSES SO FAR:\n${previousResponses}\n` : ''}

CURRENT QUESTION: ${question}

INSTRUCTIONS:
- Respond as ${advisor.name} would in a real investment committee meeting
- Keep responses under 150 words for conversational flow
- Show your expertise and personality
- ${responses.length > 0 ? "Build on or challenge other advisors' points" : 'Give your initial take on the investment'}
- Be specific and actionable
- Use ${
              advisor.name === 'Marc Benioff'
                ? 'your experience with SaaS and cloud platforms'
                : advisor.name === 'Reid Hoffman'
                  ? 'network effects thinking and platform insights'
                  : advisor.name === 'Cathie Wood'
                    ? 'disruptive innovation frameworks'
                    : advisor.name === 'Peter Thiel'
                      ? 'contrarian thinking and monopoly theory'
                      : advisor.name === 'Marc Cuban'
                        ? 'practical business sense and execution focus'
                        : advisor.name === "Kevin O'Leary"
                          ? 'ruthless financial analysis and ROI focus'
                          : advisor.name === 'Barbara Corcoran'
                            ? 'sales instincts and team assessment'
                            : advisor.name === 'Daymond John'
                              ? 'brand building and market positioning'
                              : 'Provide insights based on your expertise'
            }`;

            const response: string = await advisorAI.generateStrategicResponse(
              advisor,
              'due_diligence',
              systemPrompt
            );

            responses.push({
              id: `${advisor.id}-${Date.now()}-${responses.length}`,
              type: 'advisor',
              advisor: advisor.name,
              content: response,
              avatar: advisor.avatar_emoji || '👤',
            });
          }
        } else {
          // Mock response for development
          const mockResponse = generateMockAdvisorResponse(advisor, question, responses);
          responses.push({
            id: `${advisor.id}-${Date.now()}-${responses.length}`,
            type: 'advisor',
            advisor: advisor.name,
            content: mockResponse,
            avatar: advisor.avatar_emoji || '👤',
          });
        }
      } catch (error) {
        console.error(`Failed to generate response for ${advisor.name}:`, error);
        responses.push({
          id: `${advisor.id}-${Date.now()}-${responses.length}`,
          type: 'advisor',
          advisor: advisor.name,
          content: `I need more time to analyze this. Let me review the details and get back to you.`,
          avatar: advisor.avatar_emoji || '👤',
        });
      }
    }

    return responses;
  };

  const generateMockAdvisorResponse = (
    advisor: any,
    question: string,
    previousResponses: any[] = []
  ): string => {
    const responses = [
      `Looking at ${analysis?.fileName}, I see both opportunities and risks that need careful consideration.`,
      `This reminds me of similar deals I've evaluated. The key metrics here are telling us something important.`,
      `From my experience, the market timing and execution capability are the critical factors here.`,
      `I'd want to dig deeper into the competitive landscape and defensive moats before making a decision.`,
      `The financials look interesting, but I'm concerned about the scalability assumptions in their projections.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {/* Development Mode Banner */}
        {(process.env.NODE_ENV === 'development' || !isConfigured) && (
          <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
            🚧 Development Mode: Using mock AI responses. Configure API keys in settings for real AI
            analysis.
          </div>
        )}

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="text-gray-500 hover:text-gray-700 font-medium flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </button>
                <div className="h-6 border-l border-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h1 className="text-xl font-bold text-gray-900">Due Diligence Analysis</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analysis Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Analysis Complete</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{analysis.fileName}</p>
                      <p className="text-sm text-gray-600">{analysis.analysisType}</p>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Investment Score
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {analysis.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${analysis.overallScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                    <p className="text-gray-700 text-sm">{analysis.summary}</p>
                  </div>

                  {/* Key Findings */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                    <ul className="space-y-1">
                      {analysis.keyFindings.map((finding: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-700 text-sm">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Factors */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                    <ul className="space-y-1">
                      {analysis.riskFactors.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2 mt-1">⚠</span>
                          <span className="text-gray-700 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Investment Recommendation</h4>
                    <p className="text-gray-700 text-sm font-medium">{analysis.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">→</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Discussion Panel */}
            <div
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
              style={{ height: '600px' }}
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                  Investment Committee Discussion
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ask questions and get insights from your selected advisors
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {discussionMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Ask a question to start the discussion</p>
                  </div>
                ) : (
                  discussionMessages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex space-x-3',
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.type === 'advisor' && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm">
                          {message.avatar}
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-xs rounded-lg px-4 py-2',
                          message.type === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        {message.type === 'advisor' && (
                          <p className="text-xs font-medium text-purple-600 mb-1">
                            {message.advisor}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isGeneratingResponse && (
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <p className="text-sm text-gray-600">Advisors are discussing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleQuestionSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="Ask the committee a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={isGeneratingResponse}
                  />
                  <button
                    type="submit"
                    disabled={!newQuestion.trim() || isGeneratingResponse}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Development Mode Banner */}
      {(process.env.NODE_ENV === 'development' || !isConfigured) && (
        <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
          🚧 Development Mode: Using mock AI responses. Configure API keys in settings for real AI
          analysis.
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 font-medium flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Due Diligence Analysis</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Document for Analysis</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : 'Choose a file to analyze'}
                </p>
                <p className="text-sm text-gray-600">
                  PDF, Word, PowerPoint, or Excel files up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Analysis Type */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Analysis Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    analysisType === type.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advisor Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Investment Committee
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose advisors to participate in the due diligence review
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {advisors.slice(0, 12).map(advisor => {
                const isSelected = selectedAdvisors.includes(advisor.id);
                const isHost = advisor.id === 'the-host';
                return (
                  <button
                    key={advisor.id}
                    onClick={() => toggleAdvisor(advisor.id)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all relative',
                      isHost && !isSelected
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg ring-2 ring-amber-200'
                        : isHost && isSelected
                          ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-lg ring-2 ring-amber-300'
                          : isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {isHost && (
                      <div className="absolute top-1 right-1 px-1 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded">
                        HOST
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Avatar
                        avatar_emoji={advisor.avatar_emoji}
                        avatar_image={advisor.avatar_image}
                        avatar_url={(advisor as any).avatar_url}
                        name={advisor.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'font-medium truncate',
                            isHost ? 'text-amber-900' : 'text-gray-900'
                          )}
                        >
                          {advisor.name}
                        </p>
                        <p
                          className={cn(
                            'text-xs truncate',
                            isHost ? 'text-amber-700' : 'text-gray-600'
                          )}
                        >
                          {(advisor as any).role || (advisor as any).title}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle
                          className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isHost ? 'text-amber-500' : 'text-green-500'
                          )}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedAdvisors.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Selected {selectedAdvisors.length} advisor
                  {selectedAdvisors.length !== 1 ? 's' : ''} for the committee
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={analyzeDocument}
              disabled={
                !selectedFile || !analysisType || selectedAdvisors.length === 0 || isAnalyzing
              }
              className={cn(
                'px-8 py-4 rounded-xl font-semibold text-white transition-all',
                !selectedFile || !analysisType || selectedAdvisors.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isAnalyzing
                    ? 'bg-green-400 cursor-wait'
                    : 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Document...</span>
                </div>
              ) : (
                'Start Due Diligence Analysis'
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-green-600 text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900">Deep Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered comprehensive review</p>
          </div>
          <div className="p-4">
            <div className="text-green-600 text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900">Investment Grade</h3>
            <p className="text-sm text-gray-600">VC-quality analysis and scoring</p>
          </div>
          <div className="p-4">
            <div className="text-green-600 text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">VC Memo</h3>
            <p className="text-sm text-gray-600">Ready-to-share investment memo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
