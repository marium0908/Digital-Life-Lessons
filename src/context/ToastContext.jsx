/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((text, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast overlay portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(toast => {
            let bgClass = 'bg-white dark:bg-brand-midnight border-l-4 border-l-emerald-500 border border-slate-200 dark:border-brand-ocean/40 text-[#242424] dark:text-zinc-100 shadow-xl';
            let iconColor = 'text-emerald-500 dark:text-emerald-400';
            let Icon = CheckCircle2;
            
            if (toast.type === 'error') {
              bgClass = 'bg-white dark:bg-brand-midnight border-l-4 border-l-rose-500 border border-slate-200 dark:border-brand-ocean/40 text-[#242424] dark:text-zinc-100 shadow-xl';
              iconColor = 'text-rose-500 dark:text-rose-400';
              Icon = AlertCircle;
            } else if (toast.type === 'info') {
              bgClass = 'bg-white dark:bg-brand-midnight border-l-4 border-l-brand-steel border border-slate-200 dark:border-brand-ocean/40 text-[#242424] dark:text-zinc-100 shadow-xl';
              iconColor = 'text-brand-steel dark:text-[#8BA3AC]';
              Icon = Info;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={`flex items-center gap-3 p-4 rounded-xl select-none pointer-events-auto cursor-pointer transition-all duration-200 ${bgClass}`}
                onClick={() => removeToast(toast.id)}
              >
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-medium leading-tight flex-1">{toast.text}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-zinc-200 p-0.5 rounded transition-colors duration-150 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
