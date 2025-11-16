import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialPassword?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialEmail,
  initialPassword
}) => {
  console.log('AuthModal render:', { isOpen, initialEmail, hasInitialPassword: !!initialPassword });

  // Set initial mode based on whether we have pre-filled credentials
  const [mode, setMode] = useState<'signin' | 'signup'>(initialEmail ? 'signin' : 'signup');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState(initialPassword || '');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageBlocked, setStorageBlocked] = useState(false);

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
    if (initialEmail) {
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
        onClose();
        resetForm();
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
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
