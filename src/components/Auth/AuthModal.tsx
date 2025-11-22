import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialPassword?: string;
  onForgotPassword?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialEmail,
  initialPassword,
  onForgotPassword,
}) => {
  console.log('AuthModal render:', { isOpen, initialEmail, hasInitialPassword: !!initialPassword });

  // Set initial mode: if initialEmail is 'LOGIN_MODE', it's a login request
  const isLoginMode = initialEmail === 'LOGIN_MODE';
  const [mode, setMode] = useState<'signin' | 'signup'>(isLoginMode || (initialEmail && initialEmail !== 'LOGIN_MODE') ? 'signin' : 'signup');
  const [email, setEmail] = useState(isLoginMode ? '' : (initialEmail || ''));
  const [password, setPassword] = useState(initialPassword || '');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const { signIn, signUp } = useAuth();

  // Check if localStorage is available
  React.useEffect(() => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      setStorageBlocked(false);
    } catch (e) {
      setStorageBlocked(true);
    }
  }, []);

  // Update email and password when initialEmail/initialPassword change
  React.useEffect(() => {
    console.log('AuthModal useEffect - updating credentials:', { initialEmail, initialPassword: !!initialPassword });
    const isLogin = initialEmail === 'LOGIN_MODE';
    if (isLogin) {
      setEmail('');
      setMode('signin');
    } else if (initialEmail) {
      setEmail(initialEmail);
      setMode('signin'); // Switch to signin mode when credentials are pre-filled
    }
    if (initialPassword) {
      setPassword(initialPassword);
    }
  }, [initialEmail, initialPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'signup') {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        if (mode === 'signup') {
          // Show verification message for signup
          setSignupSuccess(true);
          setSignupEmail(email);
        } else {
          // Close modal immediately for sign-in
          onClose();
          resetForm();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setSignupSuccess(false);
    setSignupEmail('');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  if (!isOpen) {
    console.log('AuthModal not rendering - isOpen is false');
    return null;
  }

  console.log('AuthModal rendering modal');
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={e => {
        if (e.target === e.currentTarget) {
          console.log('Background clicked');
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {signupSuccess ? (
          // Success screen after signup
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification email to <strong>{signupEmail}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to sign in</li>
              </ol>
            </div>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Got It!
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {mode === 'signin'
                  ? 'Welcome back to Bearable Advisors'
                  : 'Join thousands of entrepreneurs using AI advisory'}
              </p>
          {initialEmail && initialPassword && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✨ Demo credentials loaded - click Sign In below
              </p>
            </div>
          )}
          {storageBlocked && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-900 font-semibold mb-1">
                ⚠️ Browser Storage Blocked
              </p>
              <p className="text-xs text-yellow-800">
                Your browser settings are blocking localStorage. Login will work, but you'll need to sign in each time you visit.
                Try disabling privacy extensions or use a different browser for persistent sessions.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              {mode === 'signin' && onForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onForgotPassword();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-semibold text-white',
              'bg-gradient-to-r from-blue-600 to-purple-600',
              'hover:from-blue-700 hover:to-purple-700',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={switchMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        </>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
