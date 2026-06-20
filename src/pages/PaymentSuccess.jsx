/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Star, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PaymentSuccess({ onNavigate }) {
  const { user, setIsPremiumInState, fetchProfile } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // 1. Mark premium active in context state
    setIsPremiumInState(true);
    
    // 2. Fetch fresh profile from DB to synch user cookies
    fetchProfile();

    showToast('Lifetime Premium tier activated successfully! 🎉', 'success');
  }, []);

  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen py-16 flex items-center justify-center transition-colors">
      <div className="w-full max-w-md mx-auto px-4">
        
        {/* Box layout */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          
          <div className="relative inline-block">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 w-max mx-auto">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 p-1 bg-brand-steel text-white rounded-full animate-bounce">
              <Star className="w-4 h-4 fill-white" />
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white">Upgrade Confirmed!</h1>
            <p className="text-sm text-brand-steel">
              Welcome, <span className="font-bold text-brand-midnight dark:text-brand-steel">{user?.name || 'Scholar'}</span>. Your lifetime Premium membership has been activated successfully.
            </p>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 leading-relaxed text-xs text-emerald-700 dark:text-emerald-400 font-mono text-left space-y-1">
            <p className="font-bold">✓ Transaction verified by Stripe</p>
            <p>✓ Premium scholar badges activated</p>
            <p>✓ Priority support and ad-free experience live</p>
            <p>✓ Gated content barrier removed</p>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
               onClick={() => onNavigate('/dashboard')}
               className="px-5 py-3 text-xs font-bold text-white bg-brand-ocean hover:bg-brand-steel rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('/public-lessons')}
              className="px-5 py-3 text-xs font-bold text-brand-charcoal dark:text-brand-white hover:bg-brand-steel/10 rounded-xl cursor-pointer flex items-center gap-1.5 border border-brand-steel/20"
            >
              <Compass className="w-3.5 h-3.5" />
              Browse Premium Feeds
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
