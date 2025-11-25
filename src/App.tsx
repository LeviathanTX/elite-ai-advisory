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

        {/* What You Get Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Built for Founders Who Take Preparation Seriously
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Real AI-powered advisory platform with advanced features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Expert Panel Mode</div>
                  <div className="text-sm text-gray-600">Multi-advisor collaboration</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Orchestrate conversations between multiple AI advisors - Mark Cuban debates with
                Reid Hoffman while Barbara Corcoran adds her perspective. Get comprehensive
                strategic insights from diverse viewpoints.
              </p>
              <div className="text-xs text-blue-600 font-medium">Available on all plans</div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">💾</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Persistent Conversations</div>
                  <div className="text-sm text-gray-600">Full memory & context</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Every conversation is saved and searchable. Advisors remember your business context,
                previous discussions, and uploaded documents. Build on insights over time instead of
                starting fresh each session.
              </p>
              <div className="text-xs text-purple-600 font-medium">Powered by Supabase</div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Document Intelligence</div>
                  <div className="text-sm text-gray-600">PDF, Word, Excel analysis</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Upload pitch decks, business plans, and financial models. AI advisors analyze your
                documents and provide specific feedback referenced to actual content. Get VC-grade
                critique before sending to investors.
              </p>
              <div className="text-xs text-green-600 font-medium">PDF.js + OpenAI embeddings</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Everything You Need to Raise Capital & Scale Faster
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                🎤
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Pitch Practice</h3>
              <p className="text-sm text-gray-600 mb-3 text-center">
                AI-powered analysis of delivery, pacing, content, and confidence
              </p>
              <div className="bg-purple-50 rounded-lg p-3 text-xs">
                <p className="text-purple-900 font-medium mb-1">What You Get:</p>
                <p className="text-gray-700">→ Unlimited practice sessions</p>
                <p className="text-gray-700">→ Real-time delivery feedback</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                🧠
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Strategic Planning</h3>
              <p className="text-sm text-gray-600 mb-3 text-center">
                Multi-advisor discussions with celebrity-grade insights
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-xs">
                <p className="text-blue-900 font-medium mb-1">What You Get:</p>
                <p className="text-gray-700">→ Expert panel orchestration</p>
                <p className="text-gray-700">→ Diverse strategic perspectives</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                📊
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Document Analysis</h3>
              <p className="text-sm text-gray-600 mb-3 text-center">
                VC-grade analysis of pitch decks, business plans, and financials
              </p>
              <div className="bg-green-50 rounded-lg p-3 text-xs">
                <p className="text-green-900 font-medium mb-1">What You Get:</p>
                <p className="text-gray-700">→ PDF, Word, Excel support</p>
                <p className="text-gray-700">→ AI embeddings analysis</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                ⚡
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Quick Consultation</h3>
              <p className="text-sm text-gray-600 mb-3 text-center">
                Instant expert advice 24/7 for urgent decisions
              </p>
              <div className="bg-orange-50 rounded-lg p-3 text-xs">
                <p className="text-orange-900 font-medium mb-1">What You Get:</p>
                <p className="text-gray-700">→ 24/7 instant responses</p>
                <p className="text-gray-700">→ 15+ advisor personas</p>
              </div>
            </div>
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

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white shadow-2xl text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Transform Your Fundraising Strategy?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Get started with AI-powered advisory for pitch preparation, strategic planning, and
            investor readiness
          </p>

          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-white text-sm">
                <span className="font-semibold">🎯 Fundraising in next 3-6 months?</span>
                <br />
                Practice your pitch 20+ times before investor meetings
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-white text-sm">
                <span className="font-semibold">📊 Need strategic clarity?</span>
                <br />
                Get Mark Cuban & Reid Hoffman's advice 24/7
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-white text-sm">
                <span className="font-semibold">💰 Spending $2K+/year on coaching?</span>
                <br />
                Replace expensive advisors with AI-powered expertise
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-white text-sm">
                <span className="font-semibold">⚡ Struggling with pitch deck?</span>
                <br />
                Get VC-grade analysis and improve before sending
              </p>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
            <p className="text-2xl font-bold mb-2">7-Day Free Trial</p>
            <p className="text-blue-100 text-sm mb-4">No credit card required • Cancel anytime</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('Start Free Trial clicked - 7 days free');
                  onGetStarted();
                }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => onLogin()}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Login
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
  const [isPasswordReset, setIsPasswordReset] = useState(false);
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
    // Set a flag to indicate this is for login, not signup
    setPrefilledEmail(email || 'LOGIN_MODE');
    setPrefilledPassword(password);
    setShowAuthModal(true);
  };

  return (
    <>
      <LandingPage
        onGetStarted={() => {
          console.log('Setting showAuthModal to true for signup');
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
          setPrefilledEmail(undefined);
          setPrefilledPassword(undefined);
        }}
        initialEmail={prefilledEmail}
        initialPassword={prefilledPassword}
        onForgotPassword={() => {
          setShowPasswordResetModal(true);
        }}
      />
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
      />
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
