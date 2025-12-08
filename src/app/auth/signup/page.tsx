'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Create user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        setError('Account created but sign in failed. Please sign in manually.');
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        router.push('/courses');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/courses' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 p-12 items-center justify-center">
        <div className="max-w-md">
          <div className="mb-8">
            <svg
              className="w-full h-auto"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Illustration SVG - Student with laptop */}
              <g>
                {/* Plant */}
                <rect x="40" y="320" width="30" height="20" rx="5" fill="#6B7280" />
                <path d="M50 320 Q45 300 48 285" stroke="#10B981" strokeWidth="2" fill="none" />
                <circle cx="48" cy="285" r="8" fill="#10B981" />
                <path d="M55 320 Q60 305 58 290" stroke="#10B981" strokeWidth="2" fill="none" />
                <circle cx="58" cy="290" r="6" fill="#10B981" />
                
                {/* Papers/Documents */}
                <rect x="120" y="280" width="70" height="90" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <line x1="130" y1="295" x2="180" y2="295" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="130" y1="305" x2="175" y2="305" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="130" y1="315" x2="180" y2="315" stroke="#D1D5DB" strokeWidth="2" />
                
                <rect x="140" y="260" width="70" height="90" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <line x1="150" y1="275" x2="200" y2="275" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="150" y1="285" x2="195" y2="285" stroke="#D1D5DB" strokeWidth="2" />
                
                {/* Person */}
                <circle cx="280" cy="200" r="30" fill="#FCA5A5" />
                <path d="M260 200 L250 210" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                
                <rect x="250" y="230" width="60" height="70" rx="8" fill="#10B981" />
                
                {/* Laptop */}
                <rect x="230" y="290" width="100" height="60" rx="4" fill="#374151" />
                <rect x="235" y="295" width="90" height="50" rx="2" fill="#60A5FA" />
                <line x1="245" y1="305" x2="315" y2="305" stroke="white" strokeWidth="1" />
                <line x1="245" y1="315" x2="310" y2="315" stroke="white" strokeWidth="1" />
                <line x1="245" y1="325" x2="305" y2="325" stroke="white" strokeWidth="1" />
                
                {/* Legs */}
                <rect x="255" y="300" width="20" height="50" fill="#1F2937" />
                <rect x="285" y="300" width="20" height="50" fill="#1F2937" />
                
                {/* Backpack */}
                <rect x="315" y="260" width="40" height="50" rx="8" fill="#10B981" />
                <circle cx="335" cy="275" r="8" fill="#34D399" />
                
                {/* Floating icons */}
                <circle cx="80" cy="120" r="20" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M80 110 L80 130 M70 120 L90 120" stroke="#10B981" strokeWidth="2" />
                
                <circle cx="350" cy="100" r="20" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M345 100 L350 110 L355 100" stroke="#F59E0B" strokeWidth="2" fill="none" />
                
                <circle cx="180" cy="80" r="18" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <circle cx="180" cy="80" r="10" fill="none" stroke="#3B82F6" strokeWidth="2" />
                
                <rect x="320" y="180" width="30" height="30" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M330 185 L330 200 L340 195 Z" fill="#10B981" />
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join NextClass Hub</h1>
          <p className="text-gray-600 text-lg">
            Create your account and start your learning journey today
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold">
              <span className="text-gray-900">NEXT</span>
              <span className="text-green-600">CLASS</span>{' '}
              <span className="text-gray-600">HUB</span>
            </h1>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold hidden lg:block">
              <span className="text-gray-900">NEXT</span>
              <span className="text-green-600">CLASS</span>{' '}
              <span className="text-gray-600">HUB</span>
            </h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.smith@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Sign up with Google</span>
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
