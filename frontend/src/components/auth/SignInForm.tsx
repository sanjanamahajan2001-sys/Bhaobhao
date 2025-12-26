import React from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';

interface SignInFormProps {
  identifier: string; // email or phone
  setIdentifier: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  cooldownTime: number;
}

const SignInForm: React.FC<SignInFormProps> = ({
  identifier,
  setIdentifier,
  onSubmit,
  loading,
  cooldownTime,
}) => {
  // Check if input has alphabets → email
  const hasAlphabet = /[a-zA-Z]/.test(identifier);

  // Email validation (basic)
  const isValidEmail = /\S+@\S+\.\S+/.test(identifier);

  // Phone validation (allow +country and 10 digits)
  const isValidPhone = /^\+?[0-9]{10}$/.test(identifier);

  // Mode detection
  const isEmail = hasAlphabet || isValidEmail;

  // Overall validity
  const isValid = isEmail ? isValidEmail : isValidPhone;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {isEmail ? 'Email' : 'Phone Number'}
        </label>
        <div className="relative">
          {isEmail ? (
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          ) : (
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          )}
          <input
            id="identifier"
            type={isEmail ? 'email' : 'tel'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            // placeholder={
            //   isEmail ? 'Enter your email' : 'Enter your phone number'
            // }
            placeholder={'Enter your phone number or email'}
          />
        </div>
        {!isValid && identifier.length > 0 && (
          <p className="mt-2 text-sm text-red-500">
            {isEmail
              ? 'Please enter a valid email address'
              : 'Please enter a valid 10-digit phone number'}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || cooldownTime > 0 || !isValid}
        className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : cooldownTime > 0 ? (
          <span>Wait {cooldownTime}s</span>
        ) : (
          <>
            <span>Send Verification Code</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {cooldownTime > 0 && (
        <div className="text-center text-sm text-gray-600">
          You can request a new code in {cooldownTime} seconds
        </div>
      )}
    </form>
  );
};

export default SignInForm;
