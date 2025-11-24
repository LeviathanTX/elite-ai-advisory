import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Privacy Notice Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-blue-800">Your Privacy Matters</h3>
                <div className="mt-2 text-blue-700">
                  <p>
                    This Privacy Policy explains how Bearable AI Advisors collects, uses, and
                    protects your personal information when you use our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-800">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date: January 16, 2025</strong>
            </p>

            <h3 className="text-xl font-bold mb-4">1. INFORMATION WE COLLECT</h3>

            <h4 className="text-lg font-semibold mb-3">1.1 Account Information</h4>
            <p className="mb-3">When you create an account, we collect:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Full name (optional)</li>
              <li>Account creation and last login timestamps</li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">1.2 Usage Data</h4>
            <p className="mb-3">We collect information about how you use our service:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Conversations with AI advisors</li>
              <li>Pitch practice sessions and recordings</li>
              <li>Documents you upload for analysis</li>
              <li>Feature usage patterns</li>
              <li>Session duration and frequency</li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">1.3 Technical Information</h4>
            <p className="mb-3">We automatically collect certain technical data:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Referring URLs</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">2. HOW WE USE YOUR INFORMATION</h3>
            <p className="mb-3">We use collected information to:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Provide and maintain our AI advisory services</li>
              <li>Improve our AI models and features</li>
              <li>Personalize your experience</li>
              <li>Send service-related communications</li>
              <li>Analyze platform usage and performance</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">3. THIRD-PARTY SERVICES</h3>

            <h4 className="text-lg font-semibold mb-3">3.1 Service Providers</h4>
            <p className="mb-3">We share data with trusted third-party providers:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li><strong>Supabase:</strong> Database, authentication, and file storage</li>
              <li><strong>OpenAI:</strong> AI language model processing</li>
              <li><strong>Vercel:</strong> Hosting and deployment infrastructure</li>
              <li><strong>Sentry:</strong> Error monitoring and performance tracking</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-semibold mb-2">⚠️ Important: AI Processing</p>
              <p className="text-sm">
                Your conversations and uploaded documents are processed by OpenAI's API. While
                OpenAI states they do not use API data to train models, you should review their
                privacy policy at{' '}
                <a
                  href="https://openai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  openai.com/privacy
                </a>
              </p>
            </div>

            <h4 className="text-lg font-semibold mb-3">3.2 No Third-Party Advertising</h4>
            <p className="mb-6">
              We do not sell your personal information to advertisers or third parties for marketing
              purposes.
            </p>

            <h3 className="text-xl font-bold mb-4">4. DATA SECURITY</h3>
            <p className="mb-3">We implement security measures including:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Automated backups</li>
            </ul>
            <p className="mb-6">
              However, no internet transmission is 100% secure. Use our service at your own risk and
              do not upload highly confidential or sensitive information.
            </p>

            <h3 className="text-xl font-bold mb-4">5. DATA RETENTION</h3>
            <p className="mb-3">We retain your data as follows:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li><strong>Account data:</strong> Until you delete your account</li>
              <li><strong>Conversations:</strong> Stored indefinitely unless manually deleted</li>
              <li><strong>Uploaded documents:</strong> Stored until you delete them</li>
              <li><strong>Analytics data:</strong> Aggregated and anonymized after 90 days</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">6. YOUR RIGHTS</h3>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your conversation history</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">7. COOKIES AND TRACKING</h3>
            <p className="mb-3">We use cookies and similar technologies for:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Authentication and session management</li>
              <li>User preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="mb-6">
              You can control cookies through your browser settings, but disabling them may affect
              platform functionality.
            </p>

            <h3 className="text-xl font-bold mb-4">8. CHILDREN'S PRIVACY</h3>
            <p className="mb-6">
              Our service is not intended for users under 18 years of age. We do not knowingly
              collect personal information from children. If you believe we have inadvertently
              collected such data, contact us immediately.
            </p>

            <h3 className="text-xl font-bold mb-4">9. CALIFORNIA PRIVACY RIGHTS</h3>
            <p className="mb-3">
              California residents have additional rights under CCPA, including:
            </p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of sale of personal information</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">10. GDPR COMPLIANCE (EU USERS)</h3>
            <p className="mb-3">For users in the European Union, we comply with GDPR by:</p>
            <ul className="list-disc list-inside mb-6 space-y-1">
              <li>Processing data lawfully with your consent</li>
              <li>Allowing data portability</li>
              <li>Implementing data protection by design</li>
              <li>Reporting data breaches within 72 hours</li>
              <li>Appointing a data protection contact</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">11. CHANGES TO THIS POLICY</h3>
            <p className="mb-6">
              We may update this Privacy Policy periodically. Changes will be posted on this page
              with an updated effective date. Continued use of our service after changes constitutes
              acceptance of the updated policy.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-2">12. CONTACT US</h3>
              <p className="mb-2">For privacy-related questions or requests:</p>
              <p className="mb-1">
                <strong>Email:</strong> hello@bearableai.com
              </p>
              <p className="mb-1">
                <strong>Subject Line:</strong> Privacy Request
              </p>
              <p className="text-sm text-gray-600 mt-2">
                We will respond to privacy requests within 30 days.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="font-bold text-blue-800 mb-2">🔒 Your Privacy Commitment</p>
              <p className="text-blue-700 text-sm">
                We take your privacy seriously and are committed to protecting your personal
                information. While we implement industry-standard security measures, please
                remember that this is an entertainment platform and you should not upload highly
                confidential business information.
              </p>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              Last Updated: January 16, 2025
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

export default PrivacyPolicy;
