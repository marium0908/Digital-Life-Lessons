/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrandLogo from '../components/BrandLogo';

export default function Login({ onNavigate }) {
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both your email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        showToast('Successfully logged in! Welcome back.', 'success');
        onNavigate('/');
      } else {
        showToast(result.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await googleLogin();
      if (result.success) {
        showToast('Successfully authenticated via Google!', 'success');
        onNavigate('/');
      } else {
        showToast(result.error || 'Google login failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen py-20 flex items-center justify-center transition-colors">
      <div className="w-full max-w-md mx-auto px-4">
        
        {/* Core Layout box */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl p-8 sm:p-10 shadow-lg space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center items-center">
              <BrandLogo className="w-16 h-16 animate-pulse-slow" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white">Welcome Back</h1>
            <p className="text-xs text-brand-steel">Explore authentic shared life lessons and preserve your wisdom portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-steel">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lifelessons.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border border-brand-steel/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-steel text-brand-charcoal dark:text-brand-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-steel">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password123"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border border-brand-steel/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-steel text-brand-charcoal dark:text-brand-white"
                />
              </div>
            </div>

            {/* Login control */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 text-sm font-bold text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-40 rounded-xl transition-all shadow-md shadow-brand-ocean/20 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-brand-steel/20" />
            <span className="flex-shrink mx-4 text-xs font-mono text-brand-steel uppercase">Or Continue with</span>
            <div className="flex-grow border-t border-brand-steel/20" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-brand-white dark:bg-brand-midnight hover:bg-brand-steel/10 border border-brand-steel/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold text-brand-charcoal dark:text-brand-white"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-center text-brand-steel">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="font-bold text-brand-ocean hover:underline cursor-pointer dark:text-brand-steel"
            >
              Sign Up Free
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
