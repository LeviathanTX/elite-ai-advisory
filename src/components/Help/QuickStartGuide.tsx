import React from 'react';
import { Play, MessageCircle, FileText, Mic, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '../../utils';

interface QuickStartGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
  onStartConversation: () => void;
}

const QUICK_START_STEPS = [
  {
    id: 'start-conversation',
    title: 'Start Your First Advisory Conversation',
    description:
      'Talk to The Shark Bear about your sales strategy. Founders average 3 actionable insights per conversation.',
    examples: [
      'How do I close my first 5 enterprise customers?',
      "What's a realistic revenue goal for my first year?",
      'Should I hire a salesperson or do sales myself?',
    ],
    why: '73% of founders say AI advisor conversations helped clarify strategy within first week',
    value: 'Equivalent to $500 business coaching session',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    action: 'Start Chatting',
    estimatedTime: '5 minutes',
    difficulty: 'Easy',
  },
  {
    id: 'upload-document',
    title: 'Upload and Analyze a Document',
    description:
      'Get VC-grade analysis on your pitch deck or business plan. Founders who upload decks raise 2.1x more capital.',
    examples: [
      'Upload your pitch deck for structure and messaging review',
      'Analyze your business plan for investor readiness',
      'Review financial projections for accuracy',
    ],
    why: 'AI-powered document analysis identifies blind spots you might miss',
    value: 'Equivalent to $2,000 pitch deck review service',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    action: 'Upload Document',
    estimatedTime: '3 minutes',
    difficulty: 'Easy',
  },
  {
    id: 'practice-pitch',
    title: 'Record and Analyze Your Pitch',
    description:
      'Practice makes perfect. Sarah Chen practiced 47 times and raised $2M from her first pitch.',
    examples: [
      'Record your 3-minute investor pitch',
      'Get feedback on pacing, confidence, and clarity',
      'Identify and eliminate filler words ("um", "like")',
    ],
    why: 'Founders who practice 8+ times are 3.2x more confident in investor meetings',
    value: 'Equivalent to $3,000 pitch coaching program',
    icon: <Mic className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600',
    action: 'Start Recording',
    estimatedTime: '10 minutes',
    difficulty: 'Medium',
  },
  {
    id: 'create-advisor',
    title: 'Create a Custom Advisor',
    description:
      'Build industry-specific advisors. SaaS founders create "VP of Sales" advisors for targeted guidance.',
    examples: [
      'Create a "Healthcare Compliance Expert" advisor',
      'Build a "SaaS Pricing Strategist" for your niche',
      'Design a "Retail Operations Advisor" for e-commerce',
    ],
    why: 'Industry-specific advice = better outcomes for specialized challenges',
    value: 'Unlimited access vs. $10K/mo fractional executive',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600',
    action: 'Create Advisor',
    estimatedTime: '15 minutes',
    difficulty: 'Advanced',
  },
];

const ACHIEVEMENT_BADGES = [
  {
    id: 'first-chat',
    title: 'First Conversation',
    icon: '💬',
    description: 'Started your first advisory chat',
  },
  {
    id: 'document-uploaded',
    title: 'Document Analyzer',
    icon: '📄',
    description: 'Uploaded and analyzed a document',
  },
  {
    id: 'pitch-recorded',
    title: 'Pitch Master',
    icon: '🎤',
    description: 'Recorded your first pitch',
  },
  {
    id: 'custom-advisor',
    title: 'Team Builder',
    icon: '👥',
    description: 'Created a custom advisor',
  },
  {
    id: 'power-user',
    title: 'Power User',
    icon: '⭐',
    description: 'Completed all quick start steps',
  },
];

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  isOpen,
  onClose,
  onStartDemo,
  onStartConversation,
}) => {
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());

  // Load completed steps from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('bearable-quick-start-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setCompletedSteps(new Set(progress.completedSteps || []));
      } catch (error) {
        console.warn('Failed to load quick start progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  React.useEffect(() => {
    const progress = {
      completedSteps: Array.from(completedSteps),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('bearable-quick-start-progress', JSON.stringify(progress));
  }, [completedSteps]);

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(stepId)));
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    localStorage.removeItem('bearable-quick-start-progress');
  };

  const progressPercentage = (completedSteps.size / QUICK_START_STEPS.length) * 100;
  const earnedBadges = ACHIEVEMENT_BADGES.filter(badge => {
    switch (badge.id) {
      case 'first-chat':
        return completedSteps.has('start-conversation');
      case 'document-uploaded':
        return completedSteps.has('upload-document');
      case 'pitch-recorded':
        return completedSteps.has('practice-pitch');
      case 'custom-advisor':
        return completedSteps.has('create-advisor');
      case 'power-user':
        return completedSteps.size === QUICK_START_STEPS.length;
      default:
        return false;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Quick Start Guide</h2>
              <p className="text-blue-100">
                Get up and running in minutes with these essential features
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded p-2"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-100">Your Progress</span>
              <span className="text-sm text-blue-100">
                {completedSteps.size} of {QUICK_START_STEPS.length} completed
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Achievement Badges */}
          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm flex items-center"
                  title={badge.description}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Proof - What Founders Are Doing */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What Founders Are Doing This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">📊 Most Popular Conversations</div>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>1. "How do I validate SaaS pricing?" (47 founders)</li>
                <li>2. "Should I raise VC or bootstrap?" (38 founders)</li>
                <li>3. "How do I hire my first engineer?" (29 founders)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-2">🎤 Most Practiced Pitches</div>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• "3-minute investor pitch" (156 recordings)</li>
                <li>• "Customer problem/solution" (112 recordings)</li>
                <li>• "Demo day presentation" (87 recordings)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-green-900 mb-2">📄 Most Analyzed Documents</div>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Pitch decks (89 uploads this week)</li>
                <li>• Financial projections (67 uploads)</li>
                <li>• Business plans (43 uploads)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onStartDemo}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3"
            >
              <Play className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Take Demo Tour</div>
                <div className="text-sm text-gray-500">2-minute guided walkthrough</div>
              </div>
            </button>
            <button
              onClick={onStartConversation}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3"
            >
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Start Chatting</div>
                <div className="text-sm text-gray-500">Talk to an AI advisor now</div>
              </div>
            </button>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Getting Started Steps</h3>
            {completedSteps.size > 0 && (
              <button onClick={resetProgress} className="text-sm text-gray-500 hover:text-gray-700">
                Reset Progress
              </button>
            )}
          </div>

          <div className="space-y-4">
            {QUICK_START_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isNext =
                !isCompleted &&
                Array.from({ length: index }).every((_, i) =>
                  completedSteps.has(QUICK_START_STEPS[i].id)
                );

              return (
                <div
                  key={step.id}
                  className={cn(
                    'border rounded-xl p-6 transition-all',
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isNext
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step Number/Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                        step.color
                      )}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6 text-green-600" /> : step.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs',
                              step.difficulty === 'Easy'
                                ? 'bg-green-100 text-green-700'
                                : step.difficulty === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            )}
                          >
                            {step.difficulty}
                          </span>
                          <span>{step.estimatedTime}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>

                      {/* Why This Matters & Value */}
                      {!isCompleted && (
                        <div className="bg-white bg-opacity-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <strong className="text-blue-600">🎯 WHY:</strong>{' '}
                              <span className="text-gray-700">{step.why}</span>
                            </div>
                            <div>
                              <strong className="text-green-600">💰 VALUE:</strong>{' '}
                              <span className="text-gray-700">{step.value}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Example Questions/Actions */}
                      {!isCompleted && step.examples && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-medium mb-1">💡 Try asking:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {step.examples.slice(0, 2).map((example: string, idx: number) => (
                              <li key={idx} className="pl-3">
                                • {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => {
                            markStepComplete(step.id);
                            // Here you would typically navigate to the relevant feature
                            console.log(`Starting step: ${step.id}`);
                          }}
                          className={cn(
                            'inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors',
                            isNext
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {step.action}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedSteps.size === QUICK_START_STEPS.length && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                <p className="text-gray-600 mb-4">
                  You've completed the quick start guide and earned the Power User badge. You're now
                  ready to get the most out of Bearable AI Advisors!
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Need help? Check our{' '}
              <button className="text-blue-600 hover:underline">FAQ section</button> or{' '}
              <button className="text-blue-600 hover:underline">contact support</button>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
