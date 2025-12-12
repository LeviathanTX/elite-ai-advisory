import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '../../utils';

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus' | 'none';
  content: React.ReactNode;
  highlight?: boolean;
}

// Simplified tour that works on AdvisoryConversation page (where users actually land)
// All steps use position: 'center' to avoid targeting non-existent elements
const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bearable Advisors',
    description: 'Your AI-powered strategic advisory board platform',
    position: 'center',
    action: 'none',
    content: (
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🐻</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Bearable Advisors!</h3>
        <p className="text-gray-600 mb-6">
          Let's take a quick tour of your AI-powered advisory board. You'll learn how to:
        </p>
        <ul className="text-left text-gray-700 space-y-2 mb-6">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Chat with AI advisors inspired by business legends
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Practice and analyze your pitches
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Upload and analyze documents
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Create custom advisors
          </li>
        </ul>
        <p className="text-sm text-gray-500">This tour takes about 1 minute.</p>
      </div>
    ),
  },
  {
    id: 'bear-advisors',
    title: 'Meet Your AI Bear Advisors',
    description: 'AI advisors inspired by legendary business minds',
    position: 'center',
    action: 'none',
    content: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Your Advisory Board</h3>
        <p className="text-gray-600 mb-4">
          Select advisors from the left panel. Each has unique expertise:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded text-center">
            <div className="font-medium text-sm">Reed Pawffman</div>
            <div className="text-xs text-gray-500">The Network Bear</div>
          </div>
          <div className="p-2 bg-green-50 rounded text-center">
            <div className="font-medium text-sm">Jason Clawcanis</div>
            <div className="text-xs text-gray-500">The Angel Bear</div>
          </div>
          <div className="p-2 bg-purple-50 rounded text-center">
            <div className="font-medium text-sm">Cheryl Sandbearg</div>
            <div className="text-xs text-gray-500">The Operations Bear</div>
          </div>
          <div className="p-2 bg-orange-50 rounded text-center">
            <div className="font-medium text-sm">Fei-Fei Pawli</div>
            <div className="text-xs text-gray-500">The AI Bear</div>
          </div>
        </div>
        <p className="text-sm text-blue-600">
          💡 Select multiple advisors for a panel discussion!
        </p>
      </div>
    ),
  },
  {
    id: 'conversation-modes',
    title: 'Conversation Modes',
    description: 'Choose the right mode for your needs',
    position: 'center',
    action: 'none',
    content: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Mode</h3>
        <p className="text-gray-600 mb-4">
          After selecting advisors, pick a conversation mode:
        </p>
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded-lg flex items-center">
            <span className="text-lg mr-2">🧠</span>
            <div>
              <strong className="text-blue-700 text-sm">Strategic Planning</strong>
              <p className="text-xs text-gray-500">Long-term strategy and planning</p>
            </div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg flex items-center">
            <span className="text-lg mr-2">📄</span>
            <div>
              <strong className="text-green-700 text-sm">Due Diligence</strong>
              <p className="text-xs text-gray-500">Investment analysis and document review</p>
            </div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg flex items-center">
            <span className="text-lg mr-2">⚡</span>
            <div>
              <strong className="text-orange-700 text-sm">Quick Consultation</strong>
              <p className="text-xs text-gray-500">Fast answers to specific questions</p>
            </div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg flex items-center">
            <span className="text-lg mr-2">🎤</span>
            <div>
              <strong className="text-purple-700 text-sm">Pitch Practice</strong>
              <p className="text-xs text-gray-500">Record and get feedback on your pitch</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'documents',
    title: 'Document Analysis',
    description: 'Upload documents for AI analysis',
    position: 'center',
    action: 'none',
    content: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Documents</h3>
        <p className="text-gray-600 mb-4">
          Get expert analysis on your business documents:
        </p>
        <ul className="text-gray-700 space-y-2 mb-4">
          <li className="flex items-center">
            <span className="text-blue-500 mr-2">📄</span>
            Business plans and pitch decks (PDF, Word)
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">📊</span>
            Financial models and projections (Excel)
          </li>
          <li className="flex items-center">
            <span className="text-purple-500 mr-2">📑</span>
            Term sheets and contracts
          </li>
        </ul>
        <p className="text-sm text-blue-600">
          📎 Use the paperclip icon in the chat to attach documents
        </p>
      </div>
    ),
  },
  {
    id: 'header-buttons',
    title: 'Quick Access',
    description: 'Important buttons in the header',
    position: 'center',
    action: 'none',
    content: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Header Navigation</h3>
        <p className="text-gray-600 mb-4">
          Find these helpful buttons in the top-right corner:
        </p>
        <div className="space-y-3">
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <span className="text-green-600 font-medium mr-3">Demo Tour</span>
            <span className="text-sm text-gray-500">← You're here! Restart anytime</span>
          </div>
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <span className="text-gray-600 font-medium mr-3">Help</span>
            <span className="text-sm text-gray-500">FAQs and documentation</span>
          </div>
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <span className="text-gray-600 font-medium mr-3">Settings</span>
            <span className="text-sm text-gray-500">API keys, preferences, manage advisors</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'get-started',
    title: "You're Ready!",
    description: 'Start your first conversation',
    position: 'center',
    action: 'none',
    content: (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">You're All Set!</h3>
        <p className="text-gray-600 mb-4">Here's how to get started:</p>
        <div className="text-left space-y-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-700">1. Select an Advisor</strong>
            <p className="text-sm text-blue-600">
              Click on an advisor from the left panel
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <strong className="text-purple-700">2. Choose a Mode</strong>
            <p className="text-sm text-purple-600">
              Pick Strategic Planning, Due Diligence, or Quick Consultation
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <strong className="text-green-700">3. Start Chatting!</strong>
            <p className="text-sm text-green-600">
              Ask your business questions and get expert advice
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Click "Complete Tour" to close and start exploring!
        </p>
      </div>
    ),
  },
];

export const DemoTour: React.FC<DemoTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, isOpen]);

  const handleNext = () => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  const getTooltipPosition = () => {
    switch (step.position) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* Highlight overlay for targeted elements */}
      {step.target && step.highlight && (
        <div className="absolute inset-0 pointer-events-none">
          <style>
            {`
              ${step.target} {
                position: relative !important;
                z-index: 51 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
                border-radius: 8px !important;
              }
            `}
          </style>
        </div>
      )}

      {/* Tooltip */}
      <div
        className={cn(
          'absolute z-52 w-[420px] max-w-[90vw]',
          step.position === 'center' ? 'fixed' : 'absolute',
          getTooltipPosition()
        )}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm opacity-90">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
                <button
                  onClick={toggleAutoPlay}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-lg">{step.title}</h3>
            <p className="text-sm opacity-90">{step.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 h-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">{step.content}</div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRestart}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Restart tour"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="flex space-x-1">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      index === currentStep
                        ? 'bg-blue-500'
                        : completedSteps.has(index)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleSkip}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 whitespace-nowrap"
              >
                Skip
              </button>
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center whitespace-nowrap"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>
              )}
              <button
                onClick={isLastStep ? handleComplete : handleNext}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center whitespace-nowrap"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow pointer for non-center positions */}
        {step.position !== 'center' && (
          <div
            className={cn(
              'absolute w-3 h-3 bg-white border transform rotate-45',
              step.position === 'top' &&
                'top-full -mt-2 left-1/2 -translate-x-1/2 border-r-0 border-b-0',
              step.position === 'bottom' &&
                'bottom-full -mb-2 left-1/2 -translate-x-1/2 border-l-0 border-t-0',
              step.position === 'left' &&
                'left-full -ml-2 top-1/2 -translate-y-1/2 border-l-0 border-b-0',
              step.position === 'right' &&
                'right-full -mr-2 top-1/2 -translate-y-1/2 border-r-0 border-t-0'
            )}
          />
        )}
      </div>
    </div>
  );
};
