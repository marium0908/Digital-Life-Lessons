/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Check, X, ShieldAlert, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Pricing({ onNavigate }) {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user) {
      onNavigate('/login');
      return;
    }
    const isPremiumActive = user?.isPremium || user?.role === 'admin';
    if (isPremiumActive) {
      showToast('You are already on the Premium plan!', 'info');
      onNavigate('/');
    }
  }, [user, onNavigate]);

  // Stripe Session Redirect initiator
  const handleUpgradeClick = async () => {
    if (!user || !token) {
      showToast('Please sign in to proceed with payment upgrades.', 'info');
      onNavigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.url) {
        showToast('Redirecting to Stripe payment checkout...', 'success');
        onNavigate(data.url); // Use our beautiful Stripe payment gateway/simulator link
      } else {
        showToast(data.error || 'Failed to create Checkout session', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { name: 'Number of lessons you can compile', free: 'Up to 3 Lessons', premium: 'Unlimited Lessons' },
    { name: 'Premium (locked) lesson creation', free: false, premium: true },
    { name: 'Ad-free meditation & reading interface', free: false, premium: true },
    { name: 'Priority catalog listing', free: false, premium: true },
    { name: 'Access to other users Premium content', free: false, premium: true },
    { name: 'Verified Scholar community badge', free: false, premium: true },
    { name: 'Estimated reading indicators', free: true, premium: true },
    { name: 'Export lessons as premium PDFs', free: false, premium: true },
  ];

  const isPremium = user?.isPremium || user?.role === 'admin';

  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-brand-steel uppercase tracking-widest bg-brand-steel/10 px-3 py-1 rounded-full border border-brand-steel/20">
            Membership Plans
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-midnight dark:text-brand-white">Upgrade to Premium Academy</h1>
          <p className="text-sm text-brand-steel max-w-md mx-auto">
            Become a Premium scholar. Build private guides, access high-stakes career blueprints, and support the philosophy archive.
          </p>
        </div>

        {/* Pricing Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <p className="text-xs font-mono font-bold uppercase text-brand-steel">Standard Tier</p>
              <h2 className="text-2xl font-bold">Free Scholar</h2>
              <p className="text-xs text-brand-steel">Basic reading catalog and minor self-record keeping tools.</p>
              
              <div className="py-2">
                <span className="text-3xl font-extrabold">৳0</span>
                <span className="text-brand-steel font-mono text-xs">/ Forever Free</span>
              </div>
            </div>

            <button
              disabled={true}
              className="w-full mt-8 py-3 text-xs font-bold rounded-xl text-brand-steel bg-brand-steel/15 select-none cursor-not-allowed"
            >
              Checked Default
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-brand-midnight text-white border-2 border-brand-steel rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <span className="absolute top-4 right-4 bg-brand-steel/10 border border-brand-steel/40 text-[10px] uppercase font-bold text-brand-steel font-mono px-2 py-0.5 rounded-md">
              Most Popular
            </span>
            <div className="space-y-4 z-10">
              <p className="text-xs font-mono font-bold text-brand-steel flex items-center gap-1 uppercase">
                Premium Scholar
              </p>
              <h2 className="text-2xl font-bold text-white">Lifetime Executive</h2>
              <p className="text-xs text-brand-steel/80">The complete high-stakes intelligence network with zero barriers.</p>
              
              <div className="py-2">
                <span className="text-3xl font-extrabold text-brand-steel">৳1500</span>
                <span className="text-brand-steel font-mono text-xs">/ One-time Lifetime Fee</span>
              </div>
            </div>

            {isPremium ? (
              <div className="w-full mt-8 py-3 rounded-xl border border-brand-ocean/20 bg-brand-ocean/10 dark:border-brand-steel/20 dark:bg-brand-steel/10 text-center text-xs font-bold text-brand-ocean dark:text-brand-steel flex items-center justify-center gap-2">
                Premium Active
              </div>
            ) : (
              <button
                onClick={handleUpgradeClick}
                disabled={loading}
                className="w-full mt-8 py-3 text-xs font-bold text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-40 rounded-xl transition-all shadow-md shadow-brand-ocean/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                {loading ? 'Booting Gateway...' : 'Upgrade to Premium'}
              </button>
            )}
          </div>

        </div>

        {/* Comparison Table */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl overflow-hidden shadow-sm animate-pulse-slow">
          <div className="p-6 border-b border-brand-steel/25">
            <h3 className="text-md font-bold font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-steel" />
              Comprehensive Feature Comparison
            </h3>
          </div>
          
          <table className="w-full text-left border-collapse text-sm text-brand-charcoal dark:text-brand-white">
            <thead>
              <tr className="bg-brand-steel/10 dark:bg-brand-midnight/40 border-b border-brand-steel/25 text-xs font-mono text-brand-steel uppercase">
                <th className="py-4 px-6 font-semibold">Features Include</th>
                <th className="py-4 px-6 text-center font-semibold">Free Plan</th>
                <th className="py-4 px-6 text-center font-semibold">Premium Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steel/10 font-sans">
              {features.map((f, idx) => (
                <tr key={idx} className="hover:bg-brand-steel/5">
                  <td className="py-4 px-6 font-medium font-sans text-brand-charcoal dark:text-brand-white">{f.name}</td>
                  
                  {/* Free column */}
                  <td className="py-4 px-6 text-center font-mono text-xs">
                    {typeof f.free === 'boolean' ? (
                      f.free ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />
                    ) : (
                      <span className="text-brand-steel">{f.free}</span>
                    )}
                  </td>
 
                  {/* Premium column */}
                  <td className="py-4 px-6 text-center font-mono text-xs font-bold text-brand-ocean dark:text-brand-steel">
                    {typeof f.premium === 'boolean' ? (
                      f.premium ? <Check className="w-4.5 h-4.5 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />
                    ) : (
                      <span>{f.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
