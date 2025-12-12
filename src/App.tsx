import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdvisorProvider } from './contexts/AdvisorContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HelpProvider } from './contexts/HelpContext';
import { AuthModal } from './components/Auth/AuthModal';
import { PasswordResetModal } from './components/Auth/PasswordResetModal';
import { PasswordResetConfirmation } from './components/Auth/PasswordResetConfirmation';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ConversationManager } from './components/Conversations/ConversationManager';
import { AdvisorManagement } from './components/Advisory/AdvisorManagement';
import { PitchPracticeMode } from './components/Modes/PitchPracticeMode';
import TermsOfService from './components/Legal/TermsOfService';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import { ApplicationMode } from './types';
import { formatCurrency } from './utils';

// Create a client
const queryClient = new QueryClient();

function LandingPage({
  onGetStarted,
  onLogin,
}: {
  onGetStarted: () => void;
  onLogin: (email?: string, password?: string) => void;
}) {
  const isDemoMode = !process.env.REACT_APP_SUPABASE_URL;
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Disciple testimonials
  const testimonials = [
    {
      quote: "Entrepreneurs waste months trying to get 15 minutes with the right advisor. Bearable scales world-class guidance to everyone.",
      name: "Reed Pawffman",
      title: "The Network Bear",
      avatar: "/images/advisors/reid-hoffman.jpg",
    },
    {
      quote: "What if you could get board-level advice from Marc Benioff, Reid Hoffman, or me - on demand, 24/7, for a fraction of what we charge? Bearable AI gives entrepreneurs access to digital twins of the world's top VCs who analyze your pitch and give you the same brutal honest feedback we'd give in our actual boardrooms.",
      name: "Jason Clawcanis",
      title: "The Angel Bear",
      avatar: "/images/advisors/jason-calacanis.jpg",
    },
    {
      quote: "Now every entrepreneur can get a board meeting with the world's best investors and advisors - anytime, anywhere, for any decision.",
      name: "Satya Nadellaw",
      title: "The Cloud Bear",
      avatar: "/images/advisors/satya-nadella.jpg",
    },
    {
      quote: "Get a board meeting with Marc Benioff, Reid Hoffman, and Barbara Corcoran - without writing a single check or giving up equity.",
      name: "Jamie Diamondpaw",
      title: "The Finance Bear",
      avatar: "/images/advisors/jamie-dimon.jpg",
    },
    {
      quote: "Get mentored by the world's most successful entrepreneurs and VCs - instantly, affordably, and on-demand through AI.",
      name: "Whitney Wolfbear Herd",
      title: "The Customer Bear",
      avatar: "/images/advisors/whitney-wolfe-herd.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-center py-2 px-4 text-sm font-medium z-50">
          DEMO MODE - Try the full experience! Sign up with any email/password.
        </div>
      )}

      {/* Top Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🐻</span>
          <span className="text-xl font-bold text-white">Bearable AI</span>
        </div>
        <button
          onClick={() => onLogin()}
          className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
        >
          Login
        </button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-200 rounded-full text-sm font-medium mb-6 border border-blue-400/30">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            AI Disciples of the World's Best Entrepreneurs & Investors
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Get billion-dollar advice<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              without the billion-dollar connections
            </span>
          </h1>

          <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto">
            The world's best business minds, now available 24/7 in your pocket.
          </p>
          <p className="text-lg text-blue-200/80 mb-8 max-w-2xl mx-auto">
            Bearable AI puts Marc Andreessen, Reid Hoffman, and other legendary investors in your pocket.
            Get board-level advice from AI versions of the world's top VCs and entrepreneurs.
          </p>

          {/* Hook Quote */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto mb-8 border border-white/10">
            <p className="text-lg text-white italic">
              "Why wait 6 months for a 30-minute VC meeting when you can get their insights in 30 seconds?"
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => onLogin('founder@demo.com', 'demo123')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Try Demo Now - Free
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>

        {/* The Problem / Solution Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-400/20">
            <div className="text-red-400 text-sm font-bold mb-2">THE PROBLEM</div>
            <p className="text-white font-medium">Great advice is gatekept by wealth and connections</p>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-400/20">
            <div className="text-blue-400 text-sm font-bold mb-2">THE SOLUTION</div>
            <p className="text-white font-medium">AI-powered board of directors available 24/7</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-400/20">
            <div className="text-green-400 text-sm font-bold mb-2">THE PROOF</div>
            <p className="text-white font-medium">Upload your pitch deck, get feedback like you're in the room with Sequoia</p>
          </div>
        </div>

        {/* Testimonials from Disciples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">What Our AI Advisors Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <p className="text-blue-100 text-sm mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%234F46E5" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16">🐻</text></svg>';
                    }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-blue-300 text-xs">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row of testimonials */}
          <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
            {testimonials.slice(3).map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <p className="text-blue-100 text-sm mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%234F46E5" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16">🐻</text></svg>';
                    }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-blue-300 text-xs">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jason's Extended Quote - Featured */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-purple-400/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src="/images/advisors/jason-calacanis.jpg"
              alt="Jason Clawcanis"
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-400/50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%238B5CF6" width="80" height="80" rx="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="32">🐻</text></svg>';
              }}
            />
            <div>
              <p className="text-white text-lg mb-3">
                "Get million-dollar advice without the million-dollar meeting."
              </p>
              <p className="text-purple-200 font-semibold">— Jason Clawcanis, The Angel Bear</p>
            </div>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-blue-400/20 text-center">
          <p className="text-xl text-white mb-4 italic">
            "I wanted to make world-class advisory expertise available to everyone."
          </p>
          <p className="text-blue-300 font-semibold">— Jeff Levine, Founder</p>
          <p className="text-blue-200/60 text-sm mt-2">Do your best work!</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-white font-bold mb-2">Pitch Practice</h3>
            <p className="text-blue-200 text-sm">Record your pitch and get brutal honest feedback from AI VCs</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-4xl mb-4">🐻</div>
            <h3 className="text-white font-bold mb-2">15+ Expert Advisors</h3>
            <p className="text-blue-200 text-sm">AI disciples inspired by legendary business minds, available 24/7</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-white font-bold mb-2">Document Analysis</h3>
            <p className="text-blue-200 text-sm">Upload pitch decks and business plans for expert review</p>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Get Started in Seconds</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Demo Account */}
            <div className="bg-white/5 rounded-xl p-6 border border-blue-400/30">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-white">Try Demo Account</h3>
                <p className="text-blue-200 text-sm">Instant access, no signup</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-200">Email:</span>
                  <code className="text-blue-400">founder@demo.com</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Password:</span>
                  <code className="text-blue-400">demo123</code>
                </div>
              </div>
              <button
                onClick={() => onLogin('founder@demo.com', 'demo123')}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Try Demo Now →
              </button>
            </div>

            {/* Free Trial */}
            <div className="bg-white/5 rounded-xl p-6 border border-purple-400/30">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white">7-Day Free Trial</h3>
                <p className="text-purple-200 text-sm">Full access, no credit card</p>
              </div>
              <ul className="text-sm text-blue-100 space-y-2 mb-4">
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Unlimited AI conversations</li>
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Pitch practice with feedback</li>
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Document analysis</li>
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> All 15+ expert advisors</li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Start Free Trial →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200/60 text-sm">
              Bearable Advisors - Because great decisions shouldn't wait for great connections
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setShowTermsOfService(true)}
                className="text-blue-200/60 hover:text-white transition-colors underline"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-blue-200/60 hover:text-white transition-colors underline"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <TermsOfService isOpen={showTermsOfService} onClose={() => setShowTermsOfService(false)} />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy isOpen={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  // Default to advisory_conversation - this is now the main landing page
  const [selectedMode, setSelectedMode] = useState<ApplicationMode | null>('advisory_conversation');

  // Mock user for development mode
  const mockUser = {
    id: 'dev-user-123',
    email: 'developer@eliteai.com',
    full_name: 'Developer User',
    subscription_tier: 'enterprise' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your advisory platform...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || mockUser;

  if (!currentUser) {
    return null; // This will be handled by the main App component
  }

  return (
    <HelpProvider>
      <SettingsProvider>
        <SubscriptionProvider>
          <AdvisorProvider>
            {selectedMode ? (
              (() => {
                // Back now goes to Advisory Board (the new home), not Dashboard
                const handleBackToHome = () => setSelectedMode('advisory_conversation');

                switch (selectedMode) {
                  case 'advisory_conversation':
                    return (
                      <ConversationManager
                        onBack={handleBackToHome}
                      />
                    );
                  case 'pitch_practice':
                    return (
                      <PitchPracticeMode
                        onBack={handleBackToHome}
                      />
                    );
                  case 'advisor_management':
                    return <AdvisorManagement onBack={handleBackToHome} />;
                  default:
                    return (
                      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            {selectedMode
                              ? (selectedMode as string).replace('_', ' ').toUpperCase()
                              : ''}{' '}
                            Mode
                          </h1>
                          <p className="text-xl text-gray-600 mb-8">
                            This mode is under development. Full implementation coming soon!
                          </p>
                          <button
                            onClick={() => setSelectedMode('advisory_conversation')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Back to Home
                          </button>
                        </div>
                      </div>
                    );
                }
              })()
            ) : (
              // Fallback to Dashboard - rarely used since default is now 'advisory_conversation'
              // Kept for backwards compatibility and edge cases
              <Dashboard onModeSelect={setSelectedMode} />
            )}
          </AdvisorProvider>
        </SubscriptionProvider>
      </SettingsProvider>
    </HelpProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [prefilledEmail, setPrefilledEmail] = useState<string | undefined>();
  const [prefilledPassword, setPrefilledPassword] = useState<string | undefined>();

  console.log('AppContent render:', { user, showAuthModal });

  // Check if we're on the password reset page
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsPasswordReset(true);
    }
  }, []);

  // DEVELOPMENT MODE: Bypass authentication
  const isDevelopmentMode = false; // Disabled to test real authentication

  // Show password reset page if that's what the user is doing
  if (isPasswordReset) {
    return (
      <PasswordResetConfirmation
        onSuccess={() => {
          setIsPasswordReset(false);
          setShowAuthModal(true);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }}
        onCancel={() => {
          setIsPasswordReset(false);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (user || isDevelopmentMode) {
    return <AuthenticatedApp />;
  }

  const handleLogin = (email?: string, password?: string) => {
    // SECURITY: Never log credentials or credential metadata
    console.log('Opening login modal');
    // Set mode to signin and pass credentials if provided
    setAuthMode('signin');
    setPrefilledEmail(email);
    setPrefilledPassword(password);
    setShowAuthModal(true);
  };

  return (
    <>
      <LandingPage
        onGetStarted={() => {
          console.log('Setting showAuthModal to true for signup');
          setAuthMode('signup');
          setPrefilledEmail(undefined);
          setPrefilledPassword(undefined);
          setShowAuthModal(true);
        }}
        onLogin={handleLogin}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('Closing auth modal');
          setShowAuthModal(false);
          setAuthMode('signup');
          setPrefilledEmail(undefined);
          setPrefilledPassword(undefined);
        }}
        defaultMode={authMode}
        initialEmail={prefilledEmail}
        initialPassword={prefilledPassword}
        onForgotPassword={() => {
          setShowPasswordResetModal(true);
        }}
        onShowTerms={() => setShowTermsOfService(true)}
        onShowPrivacy={() => setShowPrivacyPolicy(true)}
      />
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
      />
      <TermsOfService isOpen={showTermsOfService} onClose={() => setShowTermsOfService(false)} />
      <PrivacyPolicy isOpen={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
