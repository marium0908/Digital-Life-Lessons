/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, ShieldCheck, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function PaymentSimulate({ onNavigate }) {
  const { showToast } = useToast();
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  // Read URLs from viewport location query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSuccessUrl(params.get('success_url') || '');
    setCancelUrl(params.get('cancel_url') || '');
    setUserId(params.get('userId') || '');
  }, []);

  const handlePayConfirm = async (e) => {
    e.preventDefault();
    if (!userId) {
      showToast('Missing user context. Please sign in.', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate database upgrade call
      const res = await fetch('/api/payment/simulate-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        showToast('Payment processed by Stripe Gateway! Upgrade confirmed.', 'success');
        // Redirect directly to the success callback URI
        window.location.href = successUrl;
      } else {
        const d = await res.json();
        showToast(d.error || 'Payment validation failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showToast('Payment submission cancelled by user.', 'info');
    window.location.href = cancelUrl;
  };

  return (
    <div className="bg-brand-white text-brand-charcoal dark:bg-brand-midnight dark:text-brand-white min-h-screen py-16 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg mx-auto px-4 space-y-6">
        
        {/* Header stripe look */}
        <div className="flex justify-between items-center px-2">
          <button
            onClick={handleCancel}
            className="text-xs font-semibold text-brand-steel hover:text-brand-charcoal dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Cancel and Back
          </button>
          
          <div className="flex items-center gap-1 text-brand-steel font-mono text-[10px] uppercase font-bold tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            Secure Stripe Test SandBox
          </div>
        </div>

        {/* Emulated core stripe widget container */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl shadow-xl overflow-hidden divide-y divide-brand-steel/10">
          
          {/* Top invoice header */}
          <div className="p-8 space-y-3 bg-brand-midnight text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-steel uppercase tracking-widest font-mono">Digital Life Lessons Academics</span>
              <span className="font-mono text-xs text-brand-steel">TEST CHARGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Lifetime Executive Scholar Plan</h2>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-brand-steel">Total Due Today</span>
              <span className="text-2xl sm:text-3.5xl font-extrabold text-brand-steel">৳1500 BD</span>
            </div>
          </div>

          {/* Form fields widget */}
          <form onSubmit={handlePayConfirm} className="p-8 space-y-6">
            
            <div className="space-y-4">
              
              {/* Fake credit card number */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wide block">Card details</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-steel">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    defaultValue="4242 •••• •••• 4242"
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border rounded-xl select-none cursor-default font-mono border-brand-steel/20 text-brand-charcoal dark:text-brand-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Exp / Cvc */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wide block">Expiration</label>
                  <input
                    type="text"
                    required
                    defaultValue="12 / 29"
                    readOnly
                    className="w-full px-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border rounded-xl select-none cursor-default font-mono border-brand-steel/20 text-brand-charcoal dark:text-brand-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wide block">CVC</label>
                  <input
                    type="text"
                    required
                    defaultValue="***"
                    readOnly
                    className="w-full px-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border rounded-xl select-none cursor-default font-mono border-brand-steel/20 text-brand-charcoal dark:text-brand-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Cardholder name */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-steel uppercase tracking-wide block">Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue="Stripe Test Customer"
                  readOnly
                  className="w-full px-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border rounded-xl select-none cursor-default font-sans border-brand-steel/20 text-brand-charcoal dark:text-brand-white focus:outline-none"
                />
              </div>

            </div>

            {/* Test disclaimer alerts */}
            <div className="p-4 rounded-xl bg-brand-steel/10 border border-brand-steel/20 text-xs text-brand-charcoal dark:text-brand-white leading-relaxed space-y-1">
              <p className="font-bold">⚠️ Stripe Sandbox Test Mode</p>
              <p className="text-brand-steel">No actual funds will be transferred. Click confirm to invoke the database premium webhook to elevate the user's role status to premium immediately.</p>
            </div>

            {/* Pay Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 text-sm font-semibold rounded-xl text-brand-steel hover:bg-brand-steel/10 border border-brand-steel/25 cursor-pointer bg-brand-white dark:bg-brand-charcoal"
              >
                Declined Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-40 rounded-xl transition-all shadow-md shadow-brand-ocean/20 cursor-pointer"
              >
                {loading ? 'Validating details...' : 'Confirm Test Payment'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
