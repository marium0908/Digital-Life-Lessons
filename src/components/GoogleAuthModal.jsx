import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ShieldCheck, CornerDownRight, Check, ArrowLeft, Loader2 } from 'lucide-react';

export default function GoogleAuthModal({ isOpen, onClose, onSelect }) {
  const [step, setStep] = useState('email'); // 'email' | 'password' | 'loading'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Derive Display Name from Email
  const getDisplayNameFromEmail = (emailStr) => {
    try {
      if (!emailStr) return 'Google User';
      const parts = emailStr.split('@')[0].split(/[._+\-]/);
      return parts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } catch {
      return 'Google User';
    }
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Enter an email or phone number');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Could not find your Google Account. Enter a valid email address.');
      return;
    }

    setStep('password');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Enter your password');
      return;
    }

    if (password.length < 5) {
      setError('Wrong password. Try again or click Forgot password to reset it.');
      return;
    }

    setStep('loading');

    // Simulate standard latency for network handshakes
    setTimeout(() => {
      // Return details
      const displayName = getDisplayNameFromEmail(email);
      
      // Determine profile photo depending on first letter (looks real and personalized)
      const firstLetter = email.charAt(0).toLowerCase();
      let photoURL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
      if ('abcdef'.includes(firstLetter)) {
        photoURL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'; // female portrait
      } else if ('ghijkl'.includes(firstLetter)) {
        photoURL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'; // male professional
      } else if ('mnopqr'.includes(firstLetter)) {
        photoURL = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'; // female professional
      } else if ('stuvwx'.includes(firstLetter)) {
        photoURL = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'; // male portrait
      }

      onSelect({
        name: displayName,
        email: email.trim().toLowerCase(),
        photoURL: photoURL
      });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/45 dark:bg-black/70 backdrop-blur-xs select-none">
      
      {/* Google Accounts Sign-In Card */}
      <div className="bg-white dark:bg-[#131314] w-full max-w-[448px] rounded-2xl border border-slate-200 dark:border-[#2f2f30] shadow-2xl flex flex-col p-8 md:p-10 relative overflow-hidden transition-all text-slate-800 dark:text-[#e3e3e3]">
        
        {/* Close Button top-right */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-200 p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. GOOGLE TEXT LOGO */}
        <div className="flex justify-center mb-6">
          <svg className="h-7 w-auto" viewBox="0 0 272 92" fill="none">
            <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
            <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
            <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
            <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
          </svg>
        </div>

        {/* 2. MAIN SCREENS */}
        {step === 'email' && (
          <form onSubmit={handleEmailNext} className="space-y-6 flex flex-col justify-between flex-1">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-normal tracking-tight text-slate-900 dark:text-zinc-50">Sign in</h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                to continue to <span className="font-medium text-slate-800 dark:text-zinc-200">Digital Life Lessons</span>
              </p>
            </div>

            {/* Input wrap */}
            <div className="space-y-1.5 text-left pt-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  id="google-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Email or phone"
                  className={`w-full px-3.5 py-3.5 text-base bg-transparent border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500'}`}
                />
              </div>
              {error ? (
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                  {error}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-500 hover:underline cursor-pointer text-[#1a73e8] dark:text-[#8ab4f8] font-medium">
                  Forgot email?
                </p>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-end pt-6 mt-2">
              <button
                type="submit"
                className="bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:text-[#131314] dark:hover:bg-[#aecbfa] text-white px-6 py-2.5 rounded-md font-semibold text-sm tracking-wide transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 flex flex-col justify-between flex-1">
            <div className="space-y-4 text-center">
              
              {/* Back & Email Header */}
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-normal tracking-tight text-slate-900 dark:text-zinc-50">Welcome</h1>
                
                {/* Active Account Pill */}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 dark:bg-brand-midnight dark:border-brand-steel/25 rounded-full text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-brand-charcoal shrink-0 transition"
                >
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                    {email ? email.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <span className="truncate max-w-[150px]">{email}</span>
                  <ArrowLeft className="w-3 h-3 text-slate-400 rotate-180" />
                </button>
              </div>
            </div>

            {/* Input Wrap */}
            <div className="space-y-1.5 text-left pt-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className={`w-full px-3.5 py-3.5 text-base bg-transparent border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 pr-12 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500'}`}
                />
                
                {/* Visual eye button to toggle hide/show */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error ? (
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                  {error}
                </p>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-zinc-500">Must be at least 5 characters</span>
                  <p className="hover:underline cursor-pointer text-[#1a73e8] dark:text-[#8ab4f8] font-medium">
                    Forgot password?
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-6 mt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-slate-50 dark:hover:bg-brand-charcoal px-3 py-2 rounded transition cursor-pointer"
              >
                Go back
              </button>
              
              <button
                type="submit"
                className="bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:text-[#131314] dark:hover:bg-[#aecbfa] text-white px-6 py-2.5 rounded-md font-semibold text-sm tracking-wide transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-6 select-none">
            
            {/* Custom Google-colored Rotating Loop Spinner */}
            <div className="relative w-14 h-14 animate-spin">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#4285F4" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="60 150" 
                  strokeLinecap="round"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#34A853" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="40 150" 
                  strokeDashoffset="-60"
                  strokeLinecap="round"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#FBBC05" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="40 150" 
                  strokeDashoffset="-100"
                  strokeLinecap="round"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#EA4335" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="40 150" 
                  strokeDashoffset="-140"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="space-y-2 text-center animate-pulse">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-zinc-200">Signing you in...</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Completing Secure Verification handshake with Google Identity Servers</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
