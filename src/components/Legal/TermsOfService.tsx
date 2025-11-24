import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Critical Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">
                  ⚠️ CRITICAL DISCLAIMERS - READ FIRST
                </h3>
                <div className="mt-2 text-red-700">
                  <h4 className="font-semibold mb-2">FOR ENTERTAINMENT PURPOSES ONLY</h4>
                  <p className="mb-3">
                    The AI Board of Advisors platform and all content, recommendations, analyses,
                    and outputs provided by our AI advisors are intended{' '}
                    <strong>SOLELY FOR ENTERTAINMENT PURPOSES</strong> and should{' '}
                    <strong>NEVER</strong> be relied upon for actual business, financial, legal,
                    medical, or any other professional decisions.
                  </p>
                  <p className="font-semibold mb-3">
                    <strong>AI SYSTEMS CAN AND DO GENERATE FALSE INFORMATION</strong> (commonly
                    known as "hallucinations"). Our AI advisors may confidently present completely
                    fabricated facts, statistics, citations, and recommendations that have no basis
                    in reality.
                  </p>
                  <h4 className="font-semibold mb-2 mt-4">Celebrity Advisor Disclaimer</h4>
                  <p>
                    <strong>None of the Celebrity Advisors have authorized or are even aware of this
                    platform, yet.</strong> I hope to introduce it to them in the near future. These AI
                    personas are based on publicly available information and do not represent actual
                    endorsements or participation by the individuals portrayed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-800">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date: January 16, 2025</strong>
            </p>

            <h3 className="text-xl font-bold mb-4">1. ACCEPTANCE OF TERMS</h3>
            <p className="mb-4">
              By accessing or using the AI Board of Advisors platform ("Service"), you acknowledge
              that you have read, understood, and agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, you must immediately cease all use of
              the Service.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-semibold mb-2">YOU EXPLICITLY ACKNOWLEDGE AND AGREE THAT:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This Service is a novelty entertainment product</li>
                <li>All AI-generated content is potentially false or misleading</li>
                <li>You will NOT rely on any information provided for real-world decisions</li>
                <li>You use this Service entirely at your own risk</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold mb-4">2. COMPLETE DISCLAIMER OF LIABILITY</h3>

            <h4 className="text-lg font-semibold mb-3">2.1 No Liability Whatsoever</h4>
            <p className="mb-3">
              <strong>WE ASSUME ABSOLUTELY NO RESPONSIBILITY OR LIABILITY</strong> for any
              consequences, damages, losses, or harm of any kind arising from your use of this
              Service, including but not limited to:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Financial losses or missed opportunities</li>
              <li>Business failures or setbacks</li>
              <li>Legal consequences or violations</li>
              <li>Reputational damage</li>
              <li>Personal injury or emotional distress</li>
              <li>Data loss or corruption</li>
              <li>Any direct, indirect, incidental, special, consequential, or punitive damages</li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">2.2 AI Limitations and Errors</h4>
            <p className="mb-3">You expressly acknowledge that:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>AI systems regularly generate false, misleading, or nonsensical information</li>
              <li>AI "advisors" have no actual expertise, credentials, or qualifications</li>
              <li>AI responses may be biased, discriminatory, or offensive</li>
              <li>AI cannot understand context the way humans do</li>
              <li>AI has no ability to verify the accuracy of its outputs</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                🎭 ENTERTAINMENT PRODUCT NOTICE
              </h3>
              <p className="text-blue-700">
                This Service is equivalent to a Magic 8-Ball, fortune cookie, or horoscope. It
                provides entertainment value through simulated business advisory conversations. Any
                resemblance to actual business advice is purely coincidental.
              </p>
            </div>

            <h3 className="text-xl font-bold mb-4">3. PROHIBITED USES</h3>
            <p className="mb-3">You agree NOT to use this Service for:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Making actual business, investment, or financial decisions</li>
              <li>Legal, medical, or professional advice of any kind</li>
              <li>Tax planning or compliance</li>
              <li>Any decision that could impact your or others' wellbeing</li>
              <li>Generating content for professional or commercial use</li>
              <li>Any purpose where accuracy or reliability matters</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">4. NO WARRANTIES</h3>
            <p className="mb-3">
              THE SERVICE IS PROVIDED <strong>"AS IS" AND "AS AVAILABLE"</strong> WITHOUT ANY
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Accuracy, reliability, or completeness of information</li>
              <li>Fitness for a particular purpose</li>
              <li>Merchantability</li>
              <li>Non-infringement</li>
              <li>Security or error-free operation</li>
              <li>Availability or uptime</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">5. DATA AND PRIVACY</h3>
            <h4 className="text-lg font-semibold mb-3">5.1 No Confidentiality</h4>
            <p className="mb-3">
              Do NOT upload or share any confidential, proprietary, or sensitive information. We
              make no guarantees about data security or confidentiality.
            </p>

            <h4 className="text-lg font-semibold mb-3">5.2 Data Usage</h4>
            <p className="mb-3">Any data you provide may be:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Used to improve our AI systems</li>
              <li>Retained indefinitely</li>
              <li>Shared with third-party AI providers</li>
              <li>Subject to data breaches or unauthorized access</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">6. GOVERNING LAW AND DISPUTES</h3>
            <h4 className="text-lg font-semibold mb-3">6.1 Liability Cap</h4>
            <p className="mb-6">
              Our total liability to you for any claims shall not exceed the amount you paid for the
              Service in the past twelve months, or $100, whichever is less.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-red-800 mb-2">FINAL WARNING</h3>
              <p className="text-red-700 font-semibold mb-3">
                DO NOT USE THIS SERVICE FOR ANYTHING IMPORTANT
              </p>
              <p className="text-red-700 mb-3">
                If you need actual business advice, consult qualified human professionals including:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                <li>Licensed attorneys for legal matters</li>
                <li>Certified Public Accountants for financial advice</li>
                <li>Qualified business consultants for strategy</li>
                <li>Industry experts for specific guidance</li>
              </ul>
              <p className="text-red-700 font-semibold mt-3">
                Remember: This is an entertainment product. Treat it like a video game, not a
                business tool.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-2">12. CONTACT INFORMATION</h3>
              <p className="mb-2">
                For questions about these Terms (though we assume no obligation to respond):
              </p>
              <p className="mb-1">
                <strong>Email:</strong> hello@bearableai.com
              </p>
              <p>
                <strong>Response Time:</strong> If we feel like it
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="font-bold text-yellow-800 mb-2">
                BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO
                ALL OF THE ABOVE TERMS AND CONDITIONS.
              </p>
              <p className="text-yellow-700">
                Seriously, we mean it. This is for fun only. Do not stake your business, career, or
                financial future on what our AI advisors tell you. They're basically sophisticated
                random text generators wearing digital business suits.
              </p>
            </div>

            <div className="text-center text-2xl font-bold text-red-600 mb-4">
              🎰 USE AT YOUR OWN RISK 🎰
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
