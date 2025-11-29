import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  LogOut,
  Settings,
  Users,
  Send,
  Paperclip,
  FileText,
  Zap,
  Mic,
  MicOff,
  Download,
  Share2,
  Edit2,
  Folder,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useHelp } from '../../contexts/HelpContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useDocumentContext } from '../../hooks/useDocumentContext';
import { createAdvisorAI } from '../../services/advisorAI';
import { SettingsModal } from '../Settings/SettingsModal';
import { TestDocumentManagement } from '../Testing/TestDocumentManagement';
import { HelpModal } from '../Help/HelpModal';
import { DemoTour } from '../Help/DemoTour';
import { OnboardingFlow } from '../Help/OnboardingFlow';
import { QuickStartGuide } from '../Help/QuickStartGuide';
import { EmailVerificationBanner } from '../Auth/EmailVerificationBanner';
import { Avatar } from '../Common/Avatar';
import { AdvisorPresenceBar } from '../Conversations/components/AdvisorPresenceBar';
import { VoiceConversationButton } from '../Voice/VoiceConversationButton';
import { DocumentSelector } from '../Documents/DocumentSelector';
import { DocumentReference } from '../../services/DocumentContext';
import { AdvisorEditModal } from '../Modals/AdvisorEditModal';
import { QuickCreateAdvisorModal } from '../Modals/QuickCreateAdvisorModal';
import { CelebrityAdvisorCustomizationModal } from '../Modals/CelebrityAdvisorCustomizationModal';
import { cn } from '../../utils';
import { ApplicationMode, CelebrityAdvisor } from '../../types';
import { analytics } from '../../services/analytics';
import {
  saveConversation as saveConversationToDb,
  loadConversation as loadConversationFromService,
} from '../../services/conversationService';

interface DashboardProps {
  onModeSelect: (mode: ApplicationMode) => void;
}

interface EnhancedMeetingSettings {
  enableDebate: boolean;
  enableConsensusBuilding: boolean;
  discussionRounds: number;
  includeDocumentAnalysis: boolean;
  autoSummary: boolean;
  enableExpertPanel: boolean;
  pitchDuration: number; // in minutes (0.5 to 20)
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'advisor' | 'system' | 'analysis';
  content: string;
  timestamp: Date;
  advisor?: any;
  attachments?: any[];
  metadata?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ onModeSelect }) => {
  const { user, signOut } = useAuth();
  const { currentTier } = useSubscription();
  const { celebrityAdvisors, customAdvisors, conversations, setActiveConversation } = useAdvisor();
  const {
    showHelpModal,
    showOnboarding,
    showDemoTour,
    helpSection,
    setShowHelpModal,
    setShowOnboarding,
    setShowDemoTour,
    markOnboardingComplete,
    markDemoTourComplete,
  } = useHelp();
  const { settings, isConfigured } = useSettings();
  const {
    getDocumentContext,
    parseDocumentReferences,
    formatDocumentContextForAI,
    isLoading: documentContextLoading,
  } = useDocumentContext();

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showTestDocument, setShowTestDocument] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(true);
  const [showPitchSettings, setShowPitchSettings] = useState(false);

  // Conversation States
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [enhancedSettings, setEnhancedSettings] = useState<EnhancedMeetingSettings>({
    enableDebate: false,
    enableConsensusBuilding: false,
    discussionRounds: 1,
    includeDocumentAnalysis: false,
    autoSummary: false,
    enableExpertPanel: true,
    pitchDuration: 2, // Default 2 minutes
  });

  // Document selection state
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentReference[]>([]);
  const [conversationDocuments, setConversationDocuments] = useState<
    Array<{ name: string; content: string }>
  >([]);

  // Modal states
  const [showAdvisorEditModal, setShowAdvisorEditModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showCelebrityCustomizationModal, setShowCelebrityCustomizationModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDemoMode = !process.env.REACT_APP_SUPABASE_URL;
  const allAdvisors = [...celebrityAdvisors, ...customAdvisors];

  // Track dashboard view
  useEffect(() => {
    analytics.trackNavigation.dashboardView();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pitch duration options (in minutes)
  const pitchDurationOptions = [
    { value: 0.5, label: '30 sec' },
    { value: 1, label: '1 min' },
    { value: 2, label: '2 min' },
    { value: 3, label: '3 min' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' },
  ];

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev =>
      prev.includes(advisorId) ? prev.filter(id => id !== advisorId) : [...prev, advisorId]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || selectedAdvisors.length === 0) return;

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get document context if documents are selected
      let documentContext = '';
      if (conversationDocuments.length > 0) {
        documentContext = conversationDocuments
          .map(doc => `[${doc.name}]\n${doc.content}`)
          .join('\n\n');
      }

      // Generate responses from selected advisors
      for (const advisorId of selectedAdvisors) {
        const advisor = allAdvisors.find(a => a.id === advisorId);
        if (!advisor) continue;

        try {
          // Get AI service config from settings
          const aiService = settings.aiServices?.claude || {
            id: 'claude',
            name: 'Claude',
            model: 'claude-3-sonnet-20240229',
            apiKey: '',
          };

          const advisorAI = createAdvisorAI(aiService);

          // Build advisor-specific system prompt
          const systemPrompt = `You are ${advisor.name}, a Shark Tank investor. ${(advisor as CelebrityAdvisor).system_prompt || `You are known for your expertise in ${(advisor as CelebrityAdvisor).expertise?.join(', ') || 'business and investing'}.`}

The user has ${enhancedSettings.pitchDuration < 1 ? `${enhancedSettings.pitchDuration * 60} seconds` : `${enhancedSettings.pitchDuration} minutes`} to pitch their business idea.

${documentContext ? `The user has shared the following documents:\n${documentContext}\n\n` : ''}

Respond in character as ${advisor.name} would on Shark Tank - be direct, ask tough questions, and provide honest feedback. Keep responses conversational and engaging.`;

          // Build conversation history
          const conversationHistory = messages
            .filter(m => m.type === 'user' || (m.type === 'advisor' && m.advisor?.id === advisorId))
            .map(m => ({
              role: (m.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.content,
            }));

          const response = await advisorAI.generateResponseWithCustomPrompt(
            systemPrompt,
            inputMessage,
            {
              maxTokens: 1500,
              conversationHistory,
            }
          );

          const advisorMessage: ConversationMessage = {
            id: `advisor-${Date.now()}-${advisorId}`,
            type: 'advisor',
            content: response,
            timestamp: new Date(),
            advisor: advisor,
          };

          setMessages(prev => [...prev, advisorMessage]);
        } catch (error) {
          console.error(`Error getting response from ${advisor.name}:`, error);

          // Demo mode fallback
          const demoResponse = generateDemoResponse(advisor, inputMessage);
          const advisorMessage: ConversationMessage = {
            id: `advisor-${Date.now()}-${advisorId}`,
            type: 'advisor',
            content: demoResponse,
            timestamp: new Date(),
            advisor: advisor,
          };
          setMessages(prev => [...prev, advisorMessage]);
        }

        // Small delay between advisor responses
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const generateDemoResponse = (advisor: any, userMessage: string): string => {
    const responses = {
      'mark-cuban': `Look, I've seen a lot of pitches, and here's the deal - I need to understand what makes this different. What's your unfair advantage? Are you solving a real problem, or just creating a solution looking for a problem? Give me the numbers - what's your cost of customer acquisition, lifetime value, and most importantly, are you making money?`,
      'barbara-corcoran': `Honey, I love the passion, but let me tell you something - the business is only as good as the person running it. I invest in people, not just ideas. What makes YOU the right person to execute this? And sweetie, have you thought about how you'll scale this? I've built businesses from the ground up, and the ones that succeed are the ones where the founder has that special something.`,
      'kevin-oleary': `Here's what I need to know - what are the royalties going to look like? I'm Mr. Wonderful for a reason, and that reason is I make money. Give me the unit economics. How many units have you sold? What's your gross margin? If you can't answer these questions, you're dead to me.`,
      'daymond-john': `I'm looking at this from a brand perspective. FUBU succeeded because we understood our customer inside and out. Who is YOUR customer? How are you reaching them? What's your social media strategy? In today's market, if you're not building a community around your brand, you're missing the boat.`,
      'lori-greiner': `Is this a hero or a zero? That's what I always ask myself. I need to see if this product can sell on QVC in the first 10 minutes. What's the 'wow' factor? Can you demonstrate it? The best products solve an everyday problem that people didn't even know they had. Show me why every household needs this.`,
      'robert-herjavec': `I see a lot of entrepreneurs who are passionate but haven't thought through the technology side. If you're building tech, what's your moat? How defensible is this? I've built multiple technology companies, and the ones that win are the ones that can't be easily replicated. What happens when a bigger company decides to copy you?`,
    };

    return (
      responses[advisor.id as keyof typeof responses] ||
      `As ${advisor.name}, let me share my perspective on your pitch. Based on my experience in ${advisor.expertise || 'business'}, I'd want to understand more about your market opportunity and what makes your approach unique. The key questions I always ask are: Can you scale this? What's your competitive advantage? And most importantly, do you have the drive to see this through?`
    );
  };

  const handleEditAdvisor = (advisor: any) => {
    setEditingAdvisor(advisor);
    if (celebrityAdvisors.some(ca => ca.id === advisor.id)) {
      setShowCelebrityCustomizationModal(true);
    } else {
      setShowAdvisorEditModal(true);
    }
  };

  const handleAdvisorCreated = (newAdvisor: any) => {
    setSelectedAdvisors(prev => [...prev, newAdvisor.id]);
    const systemMessage: ConversationMessage = {
      id: `advisor-joined-${Date.now()}`,
      type: 'system',
      content: `✨ ${newAdvisor.name} (${newAdvisor.role}) has joined the conversation`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleAdvisorUpdated = (updatedAdvisor: any) => {
    const systemMessage: ConversationMessage = {
      id: `advisor-updated-${Date.now()}`,
      type: 'system',
      content: `🔄 ${updatedAdvisor.name}'s settings have been updated`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const closeAllModals = () => {
    setShowAdvisorEditModal(false);
    setShowQuickCreateModal(false);
    setShowCelebrityCustomizationModal(false);
    setEditingAdvisor(null);
  };

  return (
    <div className={cn('h-screen flex bg-black', !isConfigured && 'pt-10')}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/hero/shark-tank-hero.png"
          alt="Shark Tank"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/80" />
      </div>

      {/* Development Mode Banner */}
      {!isConfigured && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-center py-2 px-4 text-sm font-medium z-50">
          🦈 Demo Mode - AI responses are simulated.{' '}
          <button
            onClick={() => setShowSettings(true)}
            className="underline hover:text-amber-100 font-semibold"
          >
            Configure API keys
          </button>{' '}
          for real responses.
        </div>
      )}

      {/* Sidebar - Shark Selection */}
      {showAdvisorPanel && (
        <div className="relative z-10 w-80 bg-black/80 backdrop-blur-sm border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🦈</span>
                <h2 className="font-bold text-white">THE SHARKS</h2>
              </div>
              <button
                onClick={() => setShowAdvisorPanel(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Shark Tank Mode */}
            <div className="space-y-3">
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>Swim with the Sharks</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Pitch your idea and get real feedback from the Sharks
                </p>
              </div>

              {/* Settings Toggle */}
              <button
                onClick={() => setShowPitchSettings(!showPitchSettings)}
                className={cn(
                  'w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                  showPitchSettings
                    ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
                    : 'text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10'
                )}
              >
                <Settings className="w-4 h-4" />
                <span>Pitch Settings</span>
              </button>
            </div>
          </div>

          {/* Enhanced Settings */}
          {showPitchSettings && (
            <div className="mx-4 mt-4 p-4 border border-amber-500/30 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
              <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <span className="text-lg">⚙️</span> Pitch Settings
              </h3>
              <div className="space-y-4">
                {/* Pitch Duration Selector */}
                <div className="pb-3 border-b border-white/10">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Pitch Duration:{' '}
                    <span className="text-amber-400 font-bold">
                      {enhancedSettings.pitchDuration < 1
                        ? `${enhancedSettings.pitchDuration * 60} seconds`
                        : `${enhancedSettings.pitchDuration} minute${enhancedSettings.pitchDuration !== 1 ? 's' : ''}`}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {pitchDurationOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setEnhancedSettings(prev => ({
                            ...prev,
                            pitchDuration: option.value,
                          }))
                        }
                        className={cn(
                          'px-2 py-1.5 text-xs rounded-lg transition-colors font-medium',
                          enhancedSettings.pitchDuration === option.value
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center text-sm text-gray-200 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableDebate}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableDebate: e.target.checked,
                      }))
                    }
                    className="rounded border-amber-500/50 bg-white/10 text-amber-500 mr-3 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Enable Advisor Debate
                  </span>
                </label>
                <label className="flex items-center text-sm text-gray-200 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableConsensusBuilding}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableConsensusBuilding: e.target.checked,
                      }))
                    }
                    className="rounded border-amber-500/50 bg-white/10 text-amber-500 mr-3 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="group-hover:text-white transition-colors">Build Consensus</span>
                </label>
                <label className="flex items-center text-sm text-gray-200 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableExpertPanel}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableExpertPanel: e.target.checked,
                      }))
                    }
                    className="rounded border-amber-500/50 bg-white/10 text-amber-500 mr-3 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Expert Panel Mode{' '}
                    <span className="text-xs text-gray-400">(Deep document analysis)</span>
                  </span>
                </label>
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Discussion Rounds:{' '}
                    <span className="text-amber-400 font-bold">
                      {enhancedSettings.discussionRounds}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={enhancedSettings.discussionRounds}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        discussionRounds: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Quick</span>
                    <span>Balanced</span>
                    <span>Deep</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shark List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">
                  Choose Your Sharks ({selectedAdvisors.length})
                </span>
              </div>

              {allAdvisors.map(advisor => {
                const isSelected = selectedAdvisors.includes(advisor.id);

                return (
                  <div
                    key={advisor.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all group cursor-pointer',
                      isSelected
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-white/10 hover:border-amber-500/50 bg-white/5'
                    )}
                    onClick={() => toggleAdvisor(advisor.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        avatar_emoji={advisor.avatar_emoji}
                        avatar_image={advisor.avatar_image}
                        avatar_url={advisor.avatar_url}
                        name={advisor.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white text-sm">{advisor.name}</span>
                          <span className="text-amber-400 text-xs">🦈</span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {advisor.role || advisor.title}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => onModeSelect('advisor_management')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Manage Advisors
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showAdvisorPanel && (
                <button
                  onClick={() => setShowAdvisorPanel(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">BEAR TRAP</h1>
                <span className="text-amber-400 text-sm">Shark Tank Advisory</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {selectedAdvisors.length} shark{selectedAdvisors.length !== 1 ? 's' : ''} selected
              </span>

              <button
                onClick={() => {
                  const conversationData = {
                    title: `Shark Tank Session`,
                    advisors: selectedAdvisors
                      .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                      .filter(Boolean)
                      .join(', '),
                    messages: messages,
                    timestamp: new Date().toISOString(),
                  };

                  if (navigator.share) {
                    navigator
                      .share({
                        title: conversationData.title,
                        text: `Conversation with ${conversationData.advisors}\n\n${messages.map(m => `${m.type === 'user' ? 'You' : 'Shark'}: ${m.content}`).join('\n\n')}`,
                      })
                      .catch(console.error);
                  } else {
                    const shareText = `${conversationData.title}\nSharks: ${conversationData.advisors}\n\n${messages.map(m => `${m.type === 'user' ? 'You' : 'Shark'}: ${m.content}`).join('\n\n')}`;
                    navigator.clipboard
                      .writeText(shareText)
                      .then(() => alert('Conversation copied to clipboard!'))
                      .catch(() => alert('Could not share conversation'));
                  }
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                title="Share conversation"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const chatText = `Shark Tank Session
Generated: ${new Date().toLocaleString()}
Sharks: ${selectedAdvisors
                    .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}

${'='.repeat(50)}

${messages.map(m => `${m.type === 'user' ? 'You' : 'Shark'}: ${m.content}`).join('\n\n')}`;

                  const blob = new Blob([chatText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shark-tank-session-${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                title="Download conversation"
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="h-6 border-l border-white/20" />

              <span className="text-sm text-gray-300">{user?.full_name || user?.email}</span>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.reload();
                  } catch (error) {
                    window.location.reload();
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Advisor Presence Bar */}
        {selectedAdvisors.length > 0 && (
          <AdvisorPresenceBar
            advisors={selectedAdvisors
              .map(id => allAdvisors.find(a => a.id === id))
              .filter((a): a is (typeof allAdvisors)[0] => a !== undefined)}
            speakingAdvisorId={null}
            typingAdvisorId={isTyping ? selectedAdvisors[0] : null}
          />
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-amber-500/20 border-2 border-amber-500/50">
                <span className="text-4xl">🦈</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Enter the Tank</h3>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">
                You have{' '}
                {enhancedSettings.pitchDuration < 1
                  ? `${enhancedSettings.pitchDuration * 60} seconds`
                  : `${enhancedSettings.pitchDuration} minute${enhancedSettings.pitchDuration !== 1 ? 's' : ''}`}{' '}
                to pitch your business idea. The Sharks are ready to hear what you've got. Make it
                count!
              </p>
              <p className="text-sm text-amber-400">
                {selectedAdvisors.length > 0
                  ? `${selectedAdvisors.length} Shark${selectedAdvisors.length !== 1 ? 's' : ''} ready to hear your pitch`
                  : 'Select your Sharks from the sidebar to begin'}
              </p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn('flex', message.type === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg',
                  message.type === 'user'
                    ? 'bg-amber-500 text-black'
                    : message.type === 'system'
                      ? 'bg-white/10 text-gray-300 border-l-4 border-amber-500/50'
                      : message.type === 'analysis'
                        ? 'bg-green-900/30 text-green-300 border-l-4 border-green-500 max-w-2xl'
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg'
                )}
              >
                {message.advisor && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        avatar_emoji={message.advisor.avatar_emoji}
                        avatar_image={message.advisor.avatar_image}
                        avatar_url={message.advisor.avatar_url}
                        name={message.advisor.name}
                        size="sm"
                      />
                      <span className="font-semibold text-amber-400 text-sm">
                        {message.advisor.name}
                      </span>
                      {celebrityAdvisors.some(ca => ca.id === message.advisor.id) && (
                        <span className="text-amber-500 text-xs">🦈</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditAdvisor(message.advisor)}
                      className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit advisor"
                    >
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-400">The Sharks are deliberating...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2"
                >
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Documents Display */}
          {selectedDocuments.length > 0 && (
            <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-400">
                  📚 Pitch Deck ({selectedDocuments.length} documents)
                </span>
                <button
                  onClick={() => setShowDocumentSelector(true)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.slice(0, 3).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-1 bg-white/10 rounded px-2 py-1"
                  >
                    <FileText className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-gray-300">{doc.name}</span>
                  </div>
                ))}
                {selectedDocuments.length > 3 && (
                  <div className="text-xs text-amber-400">+{selectedDocuments.length - 3} more</div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Upload pitch deck"
              >
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setShowDocumentSelector(true)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  selectedDocuments.length > 0
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400'
                    : 'bg-white/10 hover:bg-white/20 text-gray-400'
                )}
                title="Browse and select documents"
              >
                <Folder className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Make your pitch to the Sharks..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-white placeholder-gray-500"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            {/* Voice Chat Button - Now at the bottom */}
            {selectedAdvisors.length > 0 && (
              <VoiceConversationButton
                advisorId={selectedAdvisors[0]}
                advisorName={
                  celebrityAdvisors.find(a => a.id === selectedAdvisors[0])?.name || 'Advisor'
                }
                systemPrompt={
                  celebrityAdvisors.find(a => a.id === selectedAdvisors[0])?.system_prompt ||
                  'You are a helpful Shark Tank investor providing business advice.'
                }
                onTranscript={text => {
                  if (text.trim()) {
                    setInputMessage(text);
                  }
                }}
                onResponse={text => {
                  console.log('Voice response:', text);
                }}
                variant="default"
              />
            )}

            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || selectedAdvisors.length === 0}
              className="p-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showTestDocument && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="p-4">
            <button
              onClick={() => setShowTestDocument(false)}
              className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </button>
            <TestDocumentManagement />
          </div>
        </div>
      )}

      {/* Help System Modals */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        initialSection={helpSection}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={preferences => {
          markOnboardingComplete(preferences);
          console.log('Onboarding completed with preferences:', preferences);
        }}
      />

      <DemoTour
        isOpen={showDemoTour}
        onClose={() => setShowDemoTour(false)}
        onComplete={() => {
          markDemoTourComplete();
          console.log('Demo tour completed');
        }}
      />

      <QuickStartGuide
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onStartDemo={() => {
          setShowQuickStart(false);
          setShowDemoTour(true);
        }}
        onStartConversation={() => {
          setShowQuickStart(false);
        }}
      />

      <AdvisorEditModal
        advisor={editingAdvisor}
        isOpen={showAdvisorEditModal}
        onClose={closeAllModals}
        onSave={handleAdvisorUpdated}
      />

      <QuickCreateAdvisorModal
        isOpen={showQuickCreateModal}
        onClose={closeAllModals}
        onAdvisorCreated={handleAdvisorCreated}
      />

      <CelebrityAdvisorCustomizationModal
        advisor={editingAdvisor}
        isOpen={showCelebrityCustomizationModal}
        onClose={closeAllModals}
        onSave={handleAdvisorUpdated}
      />

      <DocumentSelector
        advisorId={selectedAdvisors.length > 0 ? selectedAdvisors[0] : 'general'}
        onDocumentsSelected={setSelectedDocuments}
        selectedDocuments={selectedDocuments}
        isOpen={showDocumentSelector}
        onClose={() => setShowDocumentSelector(false)}
      />
    </div>
  );
};
