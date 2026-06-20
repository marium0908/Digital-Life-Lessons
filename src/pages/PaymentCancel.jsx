/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldX, RefreshCcw, ArrowRight } from 'lucide-react';

export default function PaymentCancel({ onNavigate }) {
  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen py-16 flex items-center justify-center transition-colors">
      <div className="w-full max-w-md mx-auto px-4">
        
        {/* Box layout */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          
          <div className="p-4 rounded-full bg-brand-steel/10 text-brand-steel w-max mx-auto animate-bounce">
            <ShieldX className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white">Payment Cancelled</h1>
            <p className="text-sm text-brand-steel leading-relaxed">
              The Stripe checkout session was cancelled before completing. Your payment has not been processed, and no charges were made.
            </p>
          </div>

          <div className="p-4 bg-brand-steel/5 rounded-xl border border-brand-steel/20 text-xs text-brand-charcoal dark:text-brand-steel text-left">
            If you experienced an error with your credit card details or experienced regional issues, please select "Retry Upgrade" or contact customer support.
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate('/pricing')}
              className="px-5 py-3 text-xs font-bold text-white bg-brand-ocean hover:bg-brand-steel rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-ocean/15"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Retry Upgrade
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-3 text-xs font-bold text-brand-charcoal dark:text-brand-white hover:bg-brand-steel/10 rounded-xl cursor-pointer flex items-center gap-1.5 border border-brand-steel/20"
            >
              Browse Home
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
