import React, { useState } from 'react';
import {
  ChevronRight,
  CheckCircle,
  Play,
  Users,
  FileText,
  Mic,
  Settings,
  Star,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../utils';
import { SubscriptionTier } from '../../types';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: OnboardingPreferences) => void;
}

interface OnboardingPreferences {
  primaryGoals: string[];
  businessStage: string;
  industryFocus: string[];
  preferredAdvisors: string[];
  interestedFeatures: string[];
  experienceLevel: string;
  subscriptionInterest: SubscriptionTier | null;
}

const BUSINESS_GOALS = [
  {
    id: 'fundraising',
    label: 'Raise Capital',
    icon: '💰',
    description: 'Practice pitch 20+ times, get investor-ready feedback (2.3x higher success)',
  },
  {
    id: 'scaling',
    label: 'Scale Operations',
    icon: '📈',
    description: 'Get direct, no-nonsense advice on hiring, ops, and scaling',
  },
  {
    id: 'strategy',
    label: 'Strategic Planning',
    icon: '🎯',
    description: 'Network-effects strategy sessions (Avg 6 hours saved/week)',
  },
  {
    id: 'product',
    label: 'Product Development',
    icon: '🚀',
    description: 'Build and validate products with expert guidance',
  },
  {
    id: 'marketing',
    label: 'Marketing & Sales',
    icon: '📊',
    description: 'Grow customer acquisition with proven frameworks',
  },
  {
    id: 'operations',
    label: 'Operational Excellence',
    icon: '⚙️',
    description: 'Optimize processes and improve efficiency systematically',
  },
];

const BUSINESS_STAGES = [
  { id: 'idea', label: 'Idea Stage', description: 'Validating concept and business model' },
  {
    id: 'startup',
    label: 'Early Startup',
    description: 'Building MVP and finding product-market fit',
  },
  { id: 'growth', label: 'Growth Stage', description: 'Scaling team and expanding market' },
  {
    id: 'established',
    label: 'Established Business',
    description: 'Optimizing operations and exploring new markets',
  },
];

const INDUSTRY_FOCUS = [
  'SaaS & Technology',
  'Healthcare & Biotech',
  'Fintech & Financial Services',
  'E-commerce & Retail',
  'Manufacturing & Industrial',
  'Real Estate',
  'Energy & Sustainability',
  'Education & EdTech',
  'Entertainment & Media',
  'Food & Beverage',
  'Other',
];

const CELEBRITY_ADVISORS = [
  {
    id: 'reid-hoffman',
    name: 'Reed Pawffman',
    title: 'The Network Bear',
    expertise: 'Network effects, platform strategy, scaling',
    bestFor: 'Building viral products, hiring strategy, global expansion',
  },
  {
    id: 'daymond-john',
    name: 'Daymond Fawn',
    title: 'The Brand Bear',
    expertise: 'Branding, lifestyle marketing, cultural connection',
    bestFor: 'Brand building, influencer strategy, retail partnerships',
  },
  {
    id: 'jason-calacanis',
    name: 'Jason Clawcanis',
    title: 'The Angel Bear',
    expertise: 'Early-stage investing, founder assessment',
    bestFor: 'Fundraising strategy, pitch refinement, investor intros',
  },
  {
    id: 'sheryl-sandberg',
    name: 'Cheryl Sandbearg',
    title: 'The Operations Bear',
    expertise: 'Operations, scaling teams, leadership',
    bestFor: 'Building executive teams, operational excellence, growth',
  },
];

const FEATURES = [
  {
    id: 'advisory',
    label: 'Strategic Conversations',
    icon: <Users className="w-5 h-5" />,
    description: 'Chat with AI advisors',
  },
  {
    id: 'pitch',
    label: 'Pitch Practice',
    icon: <Mic className="w-5 h-5" />,
    description: 'Record and analyze pitches',
  },
  {
    id: 'documents',
    label: 'Document Analysis',
    icon: <FileText className="w-5 h-5" />,
    description: 'Upload and analyze documents',
  },
  {
    id: 'custom',
    label: 'Custom Advisors',
    icon: <Settings className="w-5 h-5" />,
    description: 'Create personalized advisors',
  },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    primaryGoals: [],
    businessStage: '',
    industryFocus: [],
    preferredAdvisors: [],
    interestedFeatures: [],
    experienceLevel: 'beginner',
    subscriptionInterest: null,
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Bearable AI Advisors!',
      subtitle: "Let's personalize your experience",
      component: <WelcomeStep onNext={() => setCurrentStep(1)} />,
    },
    {
      id: 'goals',
      title: 'What are your primary business goals?',
      subtitle: 'Select all that apply to customize your advisor recommendations',
      component: (
        <GoalsStep
          selected={preferences.primaryGoals}
          onChange={goals => setPreferences(prev => ({ ...prev, primaryGoals: goals }))}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      ),
    },
    {
      id: 'stage',
      title: 'What stage is your business?',
      subtitle: 'This helps us provide more relevant advice',
      component: (
        <StageStep
          selected={preferences.businessStage}
          onChange={stage => setPreferences(prev => ({ ...prev, businessStage: stage }))}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      ),
    },
    {
      id: 'industry',
      title: 'What industries are you focused on?',
      subtitle: 'Select up to 3 industries for specialized insights',
      component: (
        <IndustryStep
          selected={preferences.industryFocus}
          onChange={industries => setPreferences(prev => ({ ...prev, industryFocus: industries }))}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      ),
    },
    {
      id: 'advisors',
      title: 'Which advisors interest you most?',
      subtitle: 'Pick your dream advisory board',
      component: (
        <AdvisorsStep
          selected={preferences.preferredAdvisors}
          onChange={advisors => setPreferences(prev => ({ ...prev, preferredAdvisors: advisors }))}
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      ),
    },
    {
      id: 'features',
      title: 'Which features are you most excited about?',
      subtitle: "We'll prioritize these in your experience",
      component: (
        <FeaturesStep
          selected={preferences.interestedFeatures}
          onChange={features => setPreferences(prev => ({ ...prev, interestedFeatures: features }))}
          onNext={() => setCurrentStep(6)}
          onBack={() => setCurrentStep(4)}
        />
      ),
    },
    {
      id: 'complete',
      title: "You're all set!",
      subtitle: "Let's start building your success story",
      component: (
        <CompleteStep
          preferences={preferences}
          onComplete={() => onComplete(preferences)}
          onBack={() => setCurrentStep(5)}
        />
      ),
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Bearable AI Advisors</h1>
                  <p className="text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
              <p className="text-lg text-gray-600">{currentStepData.subtitle}</p>
            </div>
            {currentStepData.component}
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="text-center">
    {/* Social Proof Banner */}
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-8">
      <p className="text-sm text-blue-900 font-medium mb-3">
        Join 247 founders using AI-BoD to refine pitches, raise capital, and scale faster
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="text-gray-700">Sarah C. - Raised $2M after 47 pitch practices</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="text-gray-700">Marcus R. - Cut planning time by 80%</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="text-gray-700">Amy P. - Secured Series A with AI deck review</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {[
        { icon: '🎯', title: 'Strategic Advice', desc: 'World-class insights' },
        { icon: '🎤', title: 'Pitch Practice', desc: 'Avg 15 practices before investor-ready' },
        { icon: '📊', title: 'Document Analysis', desc: 'VC-grade deck reviews' },
        { icon: '👥', title: 'Custom Advisors', desc: 'Industry-specific expertise' },
      ].map((feature, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl mb-2">{feature.icon}</div>
          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>
    <p className="text-gray-600 mb-8">
      This 2-minute setup customizes your experience based on your goals and gets you to your first
      insight faster.
    </p>
    <button
      onClick={onNext}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center mx-auto"
    >
      Let's Get Started
      <ChevronRight className="w-5 h-5 ml-2" />
    </button>
  </div>
);

const GoalsStep: React.FC<{
  selected: string[];
  onChange: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onChange, onNext, onBack }) => {
  const toggleGoal = (goalId: string) => {
    if (selected.includes(goalId)) {
      onChange(selected.filter(id => id !== goalId));
    } else {
      onChange(selected.concat(goalId));
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {BUSINESS_GOALS.map(goal => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={cn(
              'p-6 rounded-xl border-2 text-left transition-all',
              selected.includes(goal.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{goal.label}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
              {selected.includes(goal.id) && (
                <CheckCircle className="w-6 h-6 text-blue-500 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={cn(
            'px-8 py-3 rounded-lg font-semibold flex items-center',
            selected.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

const StageStep: React.FC<{
  selected: string;
  onChange: (stage: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onChange, onNext, onBack }) => (
  <div>
    <div className="space-y-4 mb-8">
      {BUSINESS_STAGES.map(stage => (
        <button
          key={stage.id}
          onClick={() => onChange(stage.id)}
          className={cn(
            'w-full p-6 rounded-xl border-2 text-left transition-all',
            selected === stage.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{stage.label}</h3>
              <p className="text-sm text-gray-600">{stage.description}</p>
            </div>
            {selected === stage.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
          </div>
        </button>
      ))}
    </div>
    <div className="flex justify-between">
      <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
        Back
      </button>
      <button
        onClick={onNext}
        disabled={!selected}
        className={cn(
          'px-8 py-3 rounded-lg font-semibold flex items-center',
          selected
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        )}
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  </div>
);

const IndustryStep: React.FC<{
  selected: string[];
  onChange: (industries: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onChange, onNext, onBack }) => {
  const toggleIndustry = (industry: string) => {
    if (selected.includes(industry)) {
      onChange(selected.filter(i => i !== industry));
    } else if (selected.length < 3) {
      onChange(selected.concat(industry));
    }
  };

  return (
    <div>
      <p className="text-center text-gray-600 mb-6">Select up to 3 industries</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {INDUSTRY_FOCUS.map(industry => (
          <button
            key={industry}
            onClick={() => toggleIndustry(industry)}
            disabled={!selected.includes(industry) && selected.length >= 3}
            className={cn(
              'p-4 rounded-lg border-2 text-sm font-medium transition-all',
              selected.includes(industry)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300',
              !selected.includes(industry) &&
                selected.length >= 3 &&
                'opacity-50 cursor-not-allowed'
            )}
          >
            {industry}
            {selected.includes(industry) && <CheckCircle className="w-4 h-4 ml-auto inline" />}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

const AdvisorsStep: React.FC<{
  selected: string[];
  onChange: (advisors: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onChange, onNext, onBack }) => {
  const toggleAdvisor = (advisorId: string) => {
    if (selected.includes(advisorId)) {
      onChange(selected.filter(id => id !== advisorId));
    } else {
      onChange(selected.concat(advisorId));
    }
  };

  return (
    <div>
      <p className="text-center text-gray-600 mb-6">
        Select advisors that match your current challenges (you'll have access to all of them)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CELEBRITY_ADVISORS.map(advisor => (
          <button
            key={advisor.id}
            onClick={() => toggleAdvisor(advisor.id)}
            className={cn(
              'p-6 rounded-xl border-2 text-left transition-all',
              selected.includes(advisor.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-gray-600">{advisor.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{advisor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{advisor.title}</p>
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Expertise:</strong> {advisor.expertise}
                </p>
                <p className="text-xs text-blue-600">
                  <strong>Best for:</strong> {advisor.bestFor}
                </p>
              </div>
              {selected.includes(advisor.id) && (
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

const FeaturesStep: React.FC<{
  selected: string[];
  onChange: (features: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onChange, onNext, onBack }) => {
  const toggleFeature = (featureId: string) => {
    if (selected.includes(featureId)) {
      onChange(selected.filter(id => id !== featureId));
    } else {
      onChange(selected.concat(featureId));
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {FEATURES.map(feature => (
          <button
            key={feature.id}
            onClick={() => toggleFeature(feature.id)}
            className={cn(
              'p-6 rounded-xl border-2 text-left transition-all',
              selected.includes(feature.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center space-x-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  selected.includes(feature.id)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              {selected.includes(feature.id) && (
                <CheckCircle className="w-6 h-6 text-blue-500 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

const CompleteStep: React.FC<{
  preferences: OnboardingPreferences;
  onComplete: () => void;
  onBack: () => void;
}> = ({ preferences, onComplete, onBack }) => {
  const primaryGoal = preferences.primaryGoals[0] || 'strategy';
  const recommendedAdvisor = preferences.preferredAdvisors[0] || 'mark-cuban';
  const advisorName =
    CELEBRITY_ADVISORS.find(a => a.id === recommendedAdvisor)?.name || 'Mark Cuban';

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        🎉 You're Ready! Here's Your Personalized Success Plan
      </h3>
      <p className="text-gray-600 mb-8">
        Based on your {preferences.businessStage} stage and {primaryGoal} focus
      </p>

      {/* Week 1 Quick Wins */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🚀</span>
          Week 1 - Quick Wins
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" disabled />
            <div>
              <strong className="text-gray-900">Day 1:</strong> Talk to {advisorName} about your{' '}
              {primaryGoal === 'fundraising' ? 'funding strategy' : 'business goals'}{' '}
              <span className="text-gray-500">(5 min)</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" disabled />
            <div>
              <strong className="text-gray-900">Day 3:</strong> Upload your key document for AI
              analysis <span className="text-gray-500">(3 min)</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" disabled />
            <div>
              <strong className="text-gray-900">Day 5:</strong> Record your pitch for feedback{' '}
              <span className="text-gray-500">(10 min)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* What Founders Like You Do */}
        <div className="p-6 bg-blue-50 rounded-xl text-left">
          <h4 className="font-semibold text-blue-900 mb-3">Founders like you typically:</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Have 12 advisor conversations in first month</li>
            <li>• Upload 3 key documents (plan, deck, financials)</li>
            <li>• Practice pitches 8-15 times before meetings</li>
            <li>• See clarity improve within first week</li>
          </ul>
        </div>

        {/* Your Custom Advisor Match */}
        <div className="p-6 bg-purple-50 rounded-xl text-left">
          <h4 className="font-semibold text-purple-900 mb-3">Your Custom Advisor Match</h4>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>
              • <strong>Primary:</strong> {advisorName} ({primaryGoal})
            </li>
            <li>• {preferences.preferredAdvisors.length} preferred advisors selected</li>
            <li>• {preferences.industryFocus.length} industry focus areas</li>
            <li>• All 15+ advisors available anytime</li>
          </ul>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left">
        <p className="text-sm text-gray-700">
          <strong>💡 Success Story:</strong> Founders with similar goals to yours average{' '}
          <strong className="text-blue-600">2.3x better outcomes</strong> when they complete their
          first 3 tasks in week 1.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
          >
            Talk to {advisorName} Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
