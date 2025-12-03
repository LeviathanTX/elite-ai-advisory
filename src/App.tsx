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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium z-50">
          🚀 DEMO MODE - Try the full experience! Sign up with any email/password.
        </div>
      )}

      {/* Top Right Login Button */}
      <button
        onClick={() => onLogin()}
        className="absolute top-6 right-6 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
      >
        Login
      </button>

      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Bearable AI Advisors
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">
            Get advice from AI versions of leading investors and business legends
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice your pitch with AI advisors trained on insights from Mark Cuban, Reid Hoffman,
            and other business legends. Transform how you prepare for investors and make strategic
            decisions.
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-blue-600 font-bold text-xl">🎤</span>
              <span className="text-sm text-gray-700">
                <strong>Unlimited pitch practice</strong> with AI feedback
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-purple-600 font-bold text-xl">🧠</span>
              <span className="text-sm text-gray-700">
                <strong>15+ expert AI advisors</strong> available 24/7
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-green-600 font-bold text-xl">📄</span>
              <span className="text-sm text-gray-700">
                <strong>Document analysis</strong> for pitch decks & plans
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Platform Successfully Deployed
          </div>
        </div>

        {/* Get Started Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Get Started</h2>
          <p className="text-center text-gray-600 mb-10">
            Choose how you'd like to experience Bearable AI Advisors
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Demo Account Option */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg border-2 border-blue-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Try Our Demo Account</h3>
                <p className="text-gray-600 text-sm">No credit card required • Instant access</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100 mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <code className="bg-gray-100 px-3 py-1 rounded text-blue-600">
                      founder@demo.com
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Password:</span>
                    <code className="bg-gray-100 px-3 py-1 rounded text-blue-600">demo123</code>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Pre-loaded with sample conversations
                </p>
              </div>

              <button
                onClick={() => onLogin('founder@demo.com', 'demo123')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Try Demo Now →
              </button>
            </div>

            {/* 7-Day Free Trial Option */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-lg border-2 border-purple-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">7-Day Free Trial</h3>
                <p className="text-gray-600 text-sm">
                  Create your own account • No credit card required
                </p>
              </div>

              <ul className="text-sm text-gray-700 space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited AI advisor conversations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Pitch practice with feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Document analysis tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>15+ expert AI advisors</span>
                </li>
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
              >
                Start Free Trial →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              Bearable Advisors - Where strategy meets innovation ✨
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setShowTermsOfService(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors underline"
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
                const handlePitchPractice = () => setSelectedMode('pitch_practice');

                switch (selectedMode) {
                  case 'pitch_practice':
                    return <PitchPracticeMode onBack={handleBackToHome} />;
                  case 'advisory_conversation':
                    return (
                      <ConversationManager
                        onBack={handleBackToHome}
                        onPitchPractice={handlePitchPractice}
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
