/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowLeft, HeartPulse } from 'lucide-react';

export default function NotFound({ onNavigate }) {
  return (
    <div className="bg-slate-50 dark:bg-[#011425] text-slate-800 dark:text-zinc-100 min-h-screen py-20 flex items-center justify-center transition-colors">
      <div className="w-full max-w-md mx-auto px-4 text-center space-y-6">
        
        {/* Animated Icon Frame */}
        <div className="p-4 rounded-full bg-brand-steel/10 text-brand-steel w-max mx-auto animate-bounce">
          <HeartPulse className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight font-sans text-brand-ocean dark:text-brand-steel">404 - Lessons Not Gathered</h1>
          <h2 className="text-lg font-bold text-slate-700 dark:text-zinc-350">Philosophical Space-Time Oversight</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            The particular wisdom insight, narrative, or URL parameter path you searched for does not exist on this network instance. Please return back safely.
          </p>
        </div>

        {/* Navigation back buttons */}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-3 text-xs font-bold text-white bg-brand-ocean hover:bg-brand-steel rounded-xl transition-all shadow-md shadow-brand-ocean/15 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Safeland (Home)
          </button>
          
          <button
            onClick={() => onNavigate('/public-lessons')}
            className="px-5 py-3 text-xs font-bold text-brand-ocean hover:text-white hover:bg-brand-ocean border border-brand-ocean/20 dark:text-brand-steel dark:hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            See Popular Archive
          </button>
        </div>

      </div>
    </div>
  );
}
