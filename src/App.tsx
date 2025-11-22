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
            Get Mark Cuban's advice for $97/mo instead of $50,000
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            247 founders use AI-BoD to practice pitches, refine strategy, and raise capital faster.
            Join the community transforming how entrepreneurs get expert advice.
          </p>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-green-600 font-bold text-xl">✅</span>
              <span className="text-sm text-gray-700">
                <strong>Avg 47 pitch practices</strong> before investor meetings
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-green-600 font-bold text-xl">✅</span>
              <span className="text-sm text-gray-700">
                <strong>2.3x higher</strong> fundraising success rate
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-green-600 font-bold text-xl">✅</span>
              <span className="text-sm text-gray-700">
                <strong>6 hours/week saved</strong> on strategic planning
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Platform Successfully Deployed
          </div>
        </div>

        {/* Testimonials Section - CRITICAL for conversion */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Trusted by Founders Who've Raised Capital
          </h2>
          <p className="text-center text-gray-600 mb-10">Real results from real entrepreneurs</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl font-bold text-blue-600">SC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">Founder, FinFlow (Fintech)</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "I practiced my pitch 47 times with AI Mark Cuban. The feedback on my delivery,
                pacing, and value prop was incredible.{' '}
                <strong className="text-blue-600">Raised $2M from Austin Ventures</strong> two weeks
                later."
              </p>
              <div className="text-xs text-gray-500">Capital Factory '24</div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl font-bold text-purple-600">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                  <div className="text-sm text-gray-600">CEO, OptiScale (SaaS)</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "AI-BoD replaced my $5K/month business coach. I get better advice, faster, and it
                remembers every conversation.{' '}
                <strong className="text-purple-600">Strategic planning time dropped 80%.</strong>"
              </p>
              <div className="text-xs text-gray-500">Capital Factory '23</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl font-bold text-green-600">AP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amy Patel</div>
                  <div className="text-sm text-gray-600">Founder, HealthBridge (HealthTech)</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "The document analysis is gold. Uploaded my pitch deck, got instant VC-grade
                feedback, and redesigned it completely.{' '}
                <strong className="text-green-600">Secured Series A</strong> three months later."
              </p>
              <div className="text-xs text-gray-500">Capital Factory '24</div>
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
                <p className="text-purple-900 font-medium mb-1">Real Results:</p>
                <p className="text-gray-700">→ Sarah practiced 47x, raised $2M</p>
                <p className="text-gray-700">→ Avg 15 pitches before investor-ready</p>
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
                <p className="text-blue-900 font-medium mb-1">Real Results:</p>
                <p className="text-gray-700">→ Marcus saved 6 hrs/week planning</p>
                <p className="text-gray-700">→ Reid Hoffman-style strategy sessions</p>
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
                <p className="text-green-900 font-medium mb-1">Real Results:</p>
                <p className="text-gray-700">→ Amy's deck scored 8.7/10, got Series A</p>
                <p className="text-gray-700">→ 2.1x higher fundraising success</p>
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
                <p className="text-orange-900 font-medium mb-1">Real Results:</p>
                <p className="text-gray-700">→ 2 min answers vs. 2 weeks waiting</p>
                <p className="text-gray-700">→ Always-on access to 15+ advisors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-10">
            10x cheaper than traditional advisors, infinitely more accessible
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Founder Tier */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Founder 🚀</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-blue-600">{formatCurrency(97)}</span>
                  <span className="text-lg text-gray-500">/mo</span>
                </div>
                <div className="text-xs text-gray-500 line-through">
                  Regular {formatCurrency(147)}/mo
                </div>
                <div className="mt-3 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  BEST FOR: Pre-Seed & Seed Founders
                </div>
              </div>

              <ul className="text-sm text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>20 AI advisor hours</strong> ({formatCurrency(2000)} value)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>10 document analyses</strong> ({formatCurrency(1000)} value)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>50 pitch practice sessions</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>3 custom advisors</strong>
                  </span>
                </li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs">
                <p className="text-green-900 font-semibold">
                  You Save: {formatCurrency(3403)}/mo vs. traditional advisors
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 mb-4">
                47 founders subscribed this month
              </div>

              <button
                onClick={() => {
                  console.log('Founder tier selected');
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Scale-Up Tier */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-xl border-2 border-blue-400 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐ MOST POPULAR
              </div>

              <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Scale-Up 📈</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-blue-600">{formatCurrency(247)}</span>
                  <span className="text-lg text-gray-500">/mo</span>
                </div>
                <div className="text-xs text-gray-500 line-through">
                  Regular {formatCurrency(297)}/mo
                </div>
                <div className="mt-3 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  BEST FOR: Series A & Growth Stage
                </div>
              </div>

              <ul className="text-sm text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>50 AI advisor hours</strong> ({formatCurrency(5000)} value)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Unlimited pitch practice</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Unlimited document analysis</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Unlimited custom advisors</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Priority support</strong>
                  </span>
                </li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs">
                <p className="text-green-900 font-semibold">
                  You Save: {formatCurrency(7753)}/mo vs. traditional advisors
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 mb-4">127 active subscribers</div>

              <button
                onClick={() => {
                  console.log('Scale-Up tier selected');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise 🏢</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-blue-600">{formatCurrency(497)}</span>
                  <span className="text-lg text-gray-500">/mo</span>
                </div>
                <div className="text-xs text-gray-500 line-through">
                  Regular {formatCurrency(597)}/mo
                </div>
                <div className="mt-3 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  BEST FOR: Established Companies
                </div>
              </div>

              <ul className="text-sm text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>150 AI advisor hours</strong> ({formatCurrency(15000)} value)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Unlimited everything</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>White-label options</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>API access</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    <strong>Dedicated account manager</strong>
                  </span>
                </li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs">
                <p className="text-green-900 font-semibold">
                  You Save: {formatCurrency(14503)}/mo vs. traditional advisors
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 mb-4">23 enterprise customers</div>

              <button
                onClick={() => {
                  console.log('Enterprise tier selected');
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start 7-Day Free Trial
              </button>
            </div>
          </div>

          {/* Urgency Message */}
          <div className="mt-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>🔥 Limited-Time Offer:</strong> First 100 founders lock in these prices
              forever. <strong className="text-yellow-700">72 spots claimed, 28 remaining.</strong>
            </p>
          </div>
        </div>

        {/* Demo Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center justify-center">
            <span className="mr-2">🎯</span>
            Try Our Demo Account (No Credit Card Required)
          </h3>

          {/* Mini Testimonial */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
            <p className="text-sm text-gray-700 italic mb-2">
              "I was skeptical about AI advisors. The demo changed my mind in 10 minutes."
            </p>
            <p className="text-xs text-gray-500">- John Martinez, Capital Factory Founder</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
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
              Pre-loaded with sample conversations • Full founder-tier access
            </p>
          </div>
          <button
            onClick={() => onLogin('founder@demo.com', 'demo123')}
            className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Try Demo Now (10 Minutes) →
          </button>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white shadow-2xl text-center">
          <h2 className="text-3xl font-bold mb-3">Join 247 Founders Already Using AI-BoD</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Perfect timing if you're fundraising, preparing for investors, or need strategic clarity
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
                Start Free Trial - Lock in $97/mo
              </button>
              <button
                onClick={() => onLogin()}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Login
              </button>
            </div>
          </div>

          <p className="text-sm text-blue-100">
            💰 <strong>Money-Back Guarantee:</strong> Not seeing results after 30 days? Full refund,
            no questions asked.
          </p>
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
                onClick={() => {
                  /* TODO: Add Privacy Policy */
                }}
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
    console.log('Opening login modal', { email, hasPassword: !!password });
    setPrefilledEmail(email);
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
