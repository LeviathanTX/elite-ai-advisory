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
import { PitchPracticeMode } from './components/Modes/PitchPracticeMode';
import { ConversationManager } from './components/Conversations/ConversationManager';
import { AdvisorManagement } from './components/Advisory/AdvisorManagement';
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero/shark-tank-hero.png"
          alt="Shark Tank Advisors"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
      </div>

      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-center py-2 px-4 text-sm font-medium z-50">
          🦈 DEMO MODE - Swim with the Sharks! Try with any email/password.
        </div>
      )}

      {/* Top Right Login Button */}
      <button
        onClick={() => onLogin()}
        className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30"
      >
        Login
      </button>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="text-amber-400 text-lg font-semibold tracking-wider uppercase">
              AI-Powered Advisory Board
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            BEAR TRAP
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-amber-400 mb-6">
            Pitch to the Sharks. Get Real Advice.
          </p>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            Practice your pitch with AI versions of Mark Cuban, Barbara Corcoran, Kevin O'Leary, and
            the entire Shark Tank panel. Get brutally honest feedback before you face real
            investors.
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-amber-400 font-bold text-xl">🦈</span>
              <span className="text-sm text-white">
                <strong>8 Shark Tank Investors</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-amber-400 font-bold text-xl">🎤</span>
              <span className="text-sm text-white">
                <strong>Voice Conversations</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-amber-400 font-bold text-xl">💼</span>
              <span className="text-sm text-white">
                <strong>Real Deal Feedback</strong>
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-medium border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            The Tank is Open
          </div>
        </div>

        {/* Get Started Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Enter the Tank</h2>
          <p className="text-center text-gray-400 mb-10">
            Choose how you'd like to face the Sharks
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Demo Account Option */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-amber-500/50 transition-colors">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                  <span className="text-3xl">🦈</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Demo the Tank</h3>
                <p className="text-gray-400 text-sm">No credit card required • Instant access</p>
              </div>

              <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Email:</span>
                    <code className="bg-amber-500/20 px-3 py-1 rounded text-amber-400">
                      founder@demo.com
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Password:</span>
                    <code className="bg-amber-500/20 px-3 py-1 rounded text-amber-400">
                      demo123
                    </code>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Pre-loaded with sample pitches
                </p>
              </div>

              <button
                onClick={() => onLogin('founder@demo.com', 'demo123')}
                className="w-full bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors shadow-lg"
              >
                Swim with the Sharks →
              </button>
            </div>

            {/* 7-Day Free Trial Option */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-green-500/50 transition-colors">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">7-Day Free Trial</h3>
                <p className="text-gray-400 text-sm">
                  Create your account • No credit card required
                </p>
              </div>

              <ul className="text-sm text-gray-300 space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Face all 8 Shark Tank investors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Voice conversations with AI Sharks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Pitch deck analysis & feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Deal negotiation practice</span>
                </li>
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg"
              >
                Start Free Trial →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              Bear Trap - AI Advisory Board powered by Shark Tank insights 🦈
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setShowTermsOfService(true)}
                className="text-gray-500 hover:text-white transition-colors underline"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-gray-500 hover:text-white transition-colors underline"
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
  const [selectedMode, setSelectedMode] = useState<ApplicationMode | null>(null);

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
                const handleBackToDashboard = () => setSelectedMode(null);

                switch (selectedMode) {
                  case 'pitch_practice':
                    return <PitchPracticeMode onBack={handleBackToDashboard} />;
                  case 'advisory_conversation':
                    return <ConversationManager onBack={handleBackToDashboard} />;
                  case 'advisor_management':
                    return <AdvisorManagement onBack={handleBackToDashboard} />;
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
                            onClick={() => setSelectedMode(null)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    );
                }
              })()
            ) : (
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
