/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, MessageSquare } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useToast } from '../context/ToastContext';

export default function Footer({ onNavigate }) {
  const { toast } = useToast();

  return (
    <footer className="w-full bg-[#011425] border-t border-brand-ocean/30 text-brand-steel py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top block */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-brand-ocean/20">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1 rounded-lg bg-transparent">
                <BrandLogo className="w-8 h-8" />
              </div>
              <span className="text-md font-bold tracking-tight text-white">Digital Life Lessons</span>
            </div>
            <p className="text-sm font-sans text-brand-steel leading-relaxed opacity-90">
              Preserving personal wisdom, empowering growth, and encouraging mindful reflection by exchanging meaningful life lessons across a supportive global community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">Platform Links</h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-brand-steel cursor-pointer">
                  Browse Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/public-lessons')} className="hover:text-brand-steel cursor-pointer">
                  Public Archive
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-brand-steel cursor-pointer">
                  Premium & Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-steel" />
                <span className="hover:text-white truncate">support@lifelessons.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-steel" />
                <span>+880 1712-345678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-steel animate-pulse" />
                <span>Sofia, Bulgaria / Dhaka, BD</span>
              </li>
            </ul>
          </div>

          {/* Legal / Terms */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">Intellectual & Legal</h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <a href="#terms" onClick={(e) => {e.preventDefault(); toast.info("Users retain copyrights over individual life lessons shared.");}} className="hover:text-brand-steel">
                  Terms of Service & IP
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => {e.preventDefault(); toast.info("We respect your privacy. No user tracking data is harvested.");}} className="hover:text-brand-steel">
                  Cookie & Privacy Policy
                </a>
              </li>
              <li>
                <a href="#rules" onClick={(e) => {e.preventDefault(); toast.info("All public content is moderated by our Compliance Admins.");}} className="hover:text-brand-steel">
                  Community Rules
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Social & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-steel font-mono opacity-80">
            &copy; {new Date().getFullYear()} Digital Life Lessons. All wisdom is peer-reviewed.
          </p>

          <div className="flex items-center gap-4">
            
            {/* The Brand New Rebranded X logo (instead of old twitter bird) */}
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="X (formerly Twitter)" 
              className="text-brand-steel hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-brand-steel hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>

            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-brand-steel hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-brand-steel hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

          </div>
        </div>

      </div>
    </footer>
  );
}
