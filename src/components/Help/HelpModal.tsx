import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Play,
  Settings,
  MessageCircle,
  FileText,
  Mic,
  Users,
  CreditCard,
  Bug,
} from 'lucide-react';
import { cn } from '../../utils';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Play className="w-5 h-5" />,
    color: 'bg-green-100 text-green-600',
    items: [
      {
        id: 'setup-account',
        question: 'How do I set up my Bearable AI Advisors account?',
        answer:
          "Getting started is easy! Sign up with your email and password, choose your subscription tier (Founder, Scale-Up, or Enterprise), and you'll have immediate access to our AI advisory board. In demo mode, you can explore all features without any setup.",
        tags: ['account', 'setup', 'subscription'],
      },
      {
        id: 'first-conversation',
        question: 'How do I start my first advisory conversation?',
        answer:
          'From the dashboard, click "Advisory Board" to enter conversation mode. Select from our celebrity advisors like Mark Cuban, Reid Hoffman, or create a custom advisor. Choose your consultation type (Strategic Planning, Due Diligence, Quick Consultation) and start asking questions.',
        tags: ['conversation', 'advisors', 'first-time'],
      },
      {
        id: 'navigation',
        question: 'How do I navigate between different features?',
        answer:
          'The dashboard is your central hub. Use the mode selection cards to switch between Pitch Practice, Advisory Board, and other features. The header contains quick access to Settings, Advisor Management, and your subscription status.',
        tags: ['navigation', 'dashboard', 'features'],
      },
      {
        id: 'demo-mode',
        question: 'What is Demo Mode and how does it work?',
        answer:
          'Demo Mode lets you explore the full Bearable AI Advisors experience without requiring real API keys or payment. All features are simulated, conversations work with sample responses, and you can test document analysis with demo files.',
        tags: ['demo', 'testing', 'trial'],
      },
    ],
  },
  {
    id: 'ai-advisors',
    title: 'AI Advisors',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-600',
    items: [
      {
        id: 'celebrity-advisors',
        question: 'What celebrity advisors are available?',
        answer:
          'Our platform features AI versions of world-class entrepreneurs and investors including Mark Cuban, Reid Hoffman, Jason Calacanis, Barbara Corcoran, Daymond John, and Sheryl Sandberg. Each advisor has their unique personality, expertise, and communication style.',
        tags: ['celebrity', 'advisors', 'personalities'],
      },
      {
        id: 'custom-advisors',
        question: 'How do I create a custom advisor?',
        answer:
          'Go to Advisor Management and click "Create Custom Advisor". Define their name, title, expertise areas, personality traits, communication style, and background context. You can also assign specific AI services and upload custom avatar images.',
        tags: ['custom', 'creation', 'personalization'],
      },
      {
        id: 'advisor-expertise',
        question: 'What expertise areas can advisors help with?',
        answer:
          'Our advisors cover Strategic Planning, Due Diligence, Market Analysis, Financial Modeling, Technology Assessment, Operations, Marketing, Legal considerations, and industry-specific expertise across SaaS, Healthcare, Fintech, Manufacturing, and more.',
        tags: ['expertise', 'specialization', 'industries'],
      },
      {
        id: 'advisor-assignment',
        question: 'How do I assign different AI services to advisors?',
        answer:
          'In Settings, configure multiple AI services (Claude, GPT, Gemini, etc.). Then in Advisor Management, you can assign specific AI services to individual advisors to leverage their unique strengths and capabilities.',
        tags: ['ai-services', 'assignment', 'configuration'],
      },
    ],
  },
  {
    id: 'document-analysis',
    title: 'Document Analysis',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600',
    items: [
      {
        id: 'upload-documents',
        question: 'What types of documents can I upload for analysis?',
        answer:
          'Upload PDFs, Word documents, PowerPoint presentations, Excel files, and text documents. Common examples include business plans, financial statements, pitch decks, market research, contracts, and due diligence materials.',
        tags: ['upload', 'formats', 'types'],
      },
      {
        id: 'analysis-types',
        question: 'What types of analysis can I get on my documents?',
        answer:
          'Get comprehensive analysis including executive summaries, key insights extraction, financial metrics evaluation, risk assessment, due diligence scoring, investment recommendations, and comparative market analysis.',
        tags: ['analysis', 'insights', 'evaluation'],
      },
      {
        id: 'document-context',
        question: 'How do advisors use my documents in conversations?',
        answer:
          "Once uploaded, documents become part of the advisor's context. They can reference specific sections, provide detailed analysis, answer questions about your materials, and give advice based on the content.",
        tags: ['context', 'integration', 'reference'],
      },
      {
        id: 'document-security',
        question: 'How secure are my uploaded documents?',
        answer:
          'Documents are processed securely and can be stored locally or in encrypted cloud storage. In demo mode, documents are processed temporarily. We never share your confidential information with third parties.',
        tags: ['security', 'privacy', 'confidential'],
      },
    ],
  },
  {
    id: 'pitch-practice',
    title: 'Pitch Practice',
    icon: <Mic className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-600',
    items: [
      {
        id: 'record-pitch',
        question: 'How do I record and practice my pitch?',
        answer:
          'Enter Pitch Practice mode, click the record button, and deliver your pitch. The AI analyzes your speech patterns, content structure, confidence level, pace, and provides detailed feedback with specific improvement recommendations.',
        tags: ['recording', 'practice', 'feedback'],
      },
      {
        id: 'pitch-metrics',
        question: 'What metrics does the pitch analysis provide?',
        answer:
          'Get scores for confidence, clarity, pace, engagement, overall effectiveness, filler word count, speaking pace (WPM), pause analysis, and strategic pause identification. Each metric includes specific improvement suggestions.',
        tags: ['metrics', 'scoring', 'analytics'],
      },
      {
        id: 'pitch-feedback',
        question: 'What kind of feedback will I receive on my pitch?',
        answer:
          'Receive detailed feedback on content structure, delivery style, key strengths, improvement areas, specific recommendations, and highlighted transcript moments. Celebrity advisors provide feedback in their characteristic style.',
        tags: ['feedback', 'improvement', 'recommendations'],
      },
      {
        id: 'voice-recording',
        question: 'Do I need special equipment for voice recording?',
        answer:
          "No special equipment needed! Use your computer's built-in microphone or any standard microphone. The system works with standard web browser audio recording capabilities.",
        tags: ['recording', 'equipment', 'setup'],
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: <Bug className="w-5 h-5" />,
    color: 'bg-red-100 text-red-600',
    items: [
      {
        id: 'connection-issues',
        question: 'My AI service is not connecting. What should I do?',
        answer:
          'Check your API key format and validity in Settings. Test the connection using the "Test" button. Ensure your API key has the correct permissions and hasn\'t expired. Try refreshing the page or clearing browser cache.',
        tags: ['connection', 'api-key', 'errors'],
      },
      {
        id: 'slow-responses',
        question: 'Why are AI responses taking a long time?',
        answer:
          'Response times depend on the AI service load, complexity of your query, and document analysis requirements. Try using a different AI service or simplifying your query. Check if your internet connection is stable.',
        tags: ['performance', 'speed', 'optimization'],
      },
      {
        id: 'upload-errors',
        question: "My document won't upload. What's wrong?",
        answer:
          'Check file size limits (usually under 10MB), ensure the file format is supported, and verify your internet connection. Try refreshing the page or using a different browser. Contact support if the issue persists.',
        tags: ['upload', 'errors', 'files'],
      },
      {
        id: 'audio-problems',
        question: 'Voice recording is not working. How do I fix this?',
        answer:
          "Grant microphone permissions in your browser, check that your microphone is working in other applications, try refreshing the page, and ensure you're using a supported browser (Chrome, Firefox, Safari, Edge).",
        tags: ['audio', 'microphone', 'permissions'],
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing & Subscriptions',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-600',
    items: [
      {
        id: 'subscription-tiers',
        question: 'What are the different subscription tiers?',
        answer:
          'Founder ($97/mo): 20 AI hours, 10 document analyses, basic pitch practice. Scale-Up ($247/mo): 50 AI hours, unlimited pitch practice, custom advisors. Enterprise ($497/mo): 150 AI hours, unlimited everything, API access, white-label options.',
        tags: ['tiers', 'pricing', 'features'],
      },
      {
        id: 'usage-limits',
        question: 'How do usage limits work?',
        answer:
          'Limits reset monthly. AI advisor hours count conversation time, document analyses count per upload, pitch practice sessions count per recording. Enterprise tier has unlimited usage for most features.',
        tags: ['limits', 'usage', 'tracking'],
      },
      {
        id: 'upgrade-downgrade',
        question: 'Can I change my subscription tier?',
        answer:
          "Yes! Upgrade or downgrade anytime from your account settings. Changes take effect at the next billing cycle. When upgrading mid-cycle, you'll get prorated access to new limits immediately.",
        tags: ['upgrade', 'downgrade', 'changes'],
      },
      {
        id: 'billing-cycle',
        question: 'When will I be billed?',
        answer:
          "Billing occurs monthly on your signup date. You'll receive email notifications before each billing cycle. View your billing history and download invoices from your account settings.",
        tags: ['billing', 'cycle', 'invoices'],
      },
    ],
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'getting-started',
}) => {
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredSections = HELP_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(
      item =>
        searchQuery === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter(section => section.items.length > 0);

  const currentSection = HELP_SECTIONS.find(s => s.id === selectedSection);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                Help & Support
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {(searchQuery ? filteredSections : HELP_SECTIONS).map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSection(section.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                    selectedSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className={cn('p-1 rounded', section.color)}>{section.icon}</div>
                  <span className="font-medium">{section.title}</span>
                  {searchQuery && (
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {section.items.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 rounded-lg', currentSection?.color || 'bg-gray-100')}>
                {currentSection?.icon || <HelpCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {searchQuery
                    ? `Search Results (${filteredSections.reduce((sum, s) => sum + s.items.length, 0)})`
                    : currentSection?.title}
                </h3>
                {!searchQuery && (
                  <p className="text-gray-600">{currentSection?.items.length} topics available</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {searchQuery ? (
              // Search Results
              <div className="space-y-6">
                {filteredSections.map(section => (
                  <div key={section.id}>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={cn('p-1 rounded mr-2', section.color)}>{section.icon}</div>
                      {section.title}
                    </h4>
                    <div className="space-y-3 ml-8">
                      {section.items.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                          >
                            <span className="font-medium text-gray-900">{item.question}</span>
                            {expandedItems.has(item.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          {expandedItems.has(item.id) && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {item.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Section Content
              <div className="space-y-4">
                {currentSection?.items.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{item.question}</span>
                      {expandedItems.has(item.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedItems.has(item.id) && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Need more help? Contact our support team at{' '}
                <a href="mailto:support@bearableadvisors.com" className="text-blue-600 hover:underline">
                  support@bearableadvisors.com
                </a>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200">
                  Start Demo Tour
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                  View Video Tutorials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
