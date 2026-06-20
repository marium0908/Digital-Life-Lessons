/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, ChevronDown, User as UserIcon, Layout, Compass, PlusCircle, Star, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

export default function Navbar({ currentRoute, onNavigate }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLinkClick = (route) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    onNavigate('/');
  };

  const handleAdminToggle = () => {
    setDropdownOpen(false);
    if (user?.role === 'admin') {
      onNavigate('/dashboard/admin');
    } else {
      onNavigate('/dashboard');
    }
  };

  const isFree = user && !user.isPremium && user.role !== 'admin';

  return (
    <nav className="sticky top-0 z-40 w-full border-b backdrop-blur bg-white/95 text-brand-charcoal border-brand-steel/15 dark:bg-brand-midnight/95 dark:text-brand-white dark:border-brand-ocean/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 group cursor-pointer font-sans"
            >
              <div className="p-1 rounded-xl bg-transparent">
                <BrandLogo className="w-8 h-8 transition-transform group-hover:scale-105" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-brand-midnight dark:text-brand-white transition-colors">
                Digital Life Lessons
              </span>
            </button>
          </div>

          {/* Desktop Right Hand Nav */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            
            {/* Standard Public Navigation Links */}
            <button
              onClick={() => handleLinkClick('/')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentRoute === '/'
                  ? 'bg-brand-steel/15 text-brand-ocean dark:bg-brand-ocean/25 dark:text-brand-steel'
                  : 'hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 text-brand-steel dark:text-brand-steel/90'
              }`}
            >
              Home
            </button>
            
            <button
              onClick={() => handleLinkClick('/public-lessons')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentRoute === '/public-lessons'
                  ? 'bg-brand-steel/15 text-brand-ocean dark:bg-brand-ocean/25 dark:text-brand-steel'
                  : 'hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 text-brand-steel dark:text-brand-steel/90'
              }`}
            >
              Public Lessons
            </button>

            {/* Auth Protected / Conditional Links */}
            {user && (
              <>
                <button
                  onClick={() => handleLinkClick('/dashboard/add-lesson')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    currentRoute === '/dashboard/add-lesson'
                      ? 'bg-brand-steel/15 text-brand-ocean dark:bg-brand-ocean/25 dark:text-brand-steel'
                      : 'hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 text-brand-steel dark:text-brand-steel/90'
                  }`}
                >
                  Add Lesson
                </button>
                <button
                  onClick={() => handleLinkClick('/dashboard/my-lessons')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    currentRoute === '/dashboard/my-lessons'
                      ? 'bg-brand-steel/15 text-brand-ocean dark:bg-brand-ocean/25 dark:text-brand-steel'
                      : 'hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 text-brand-steel dark:text-brand-steel/90'
                  }`}
                >
                  My Lessons
                </button>
                
                {isFree ? (
                  <button
                    onClick={() => handleLinkClick('/pricing')}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-lg bg-brand-ocean text-white hover:bg-brand-steel shadow-sm flex items-center gap-1.5 cursor-pointer`}
                  >
                    <Star className="w-4 h-4 fill-white" />
                    Upgrade
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-brand-ocean/10 text-brand-ocean dark:bg-brand-steel/15 dark:text-brand-steel border border-brand-ocean/20 dark:border-brand-steel/20 shadow-sm">
                    Premium
                  </span>
                )}
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-1 text-brand-steel hover:text-brand-charcoal dark:hover:text-brand-white transition-colors rounded-lg hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Block */}
            {!user ? (
              <div className="flex items-center gap-2 border-l pl-4 border-brand-steel/15 ml-2">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="px-3.5 py-2 text-sm font-semibold text-brand-ocean hover:text-brand-steel dark:text-brand-steel dark:hover:text-brand-white cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleLinkClick('/register')}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-midnight hover:bg-brand-charcoal text-white dark:bg-brand-white dark:hover:bg-brand-steel/10 dark:text-brand-charcoal cursor-pointer border border-brand-steel/20"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              /* User Dropdown */
              <div className="relative ml-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-brand-steel/20 hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 transition-all cursor-pointer"
                >
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-steel/20"
                    referrerPolicy="no-referrer"
                  />
                  <ChevronDown className={`w-4 h-4 text-brand-steel transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-brand-white dark:bg-brand-charcoal shadow-lg border border-brand-steel/20 py-2 divide-y divide-brand-steel/10 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-4 py-2.5">
                      <p className="text-xs text-brand-steel font-mono">Signed in as</p>
                      <p className="text-sm font-bold text-brand-charcoal dark:text-brand-white truncate">{user.name}</p>
                      <p className="text-xs text-brand-steel truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => { setDropdownOpen(false); onNavigate('/dashboard/profile'); }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-brand-charcoal dark:text-brand-steel hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-brand-steel" />
                        My Profile
                      </button>
                      
                      <button
                        onClick={handleAdminToggle}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-brand-charcoal dark:text-brand-steel hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
                      >
                        <Layout className="w-4 h-4 text-brand-steel" />
                        {user.role === 'admin' ? 'Admin Board' : 'User Dashboard'}
                      </button>

                      <button
                        onClick={() => { setDropdownOpen(false); onNavigate('/dashboard/my-favorites'); }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-brand-charcoal dark:text-brand-steel hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
                      >
                        <Star className="w-4 h-4 text-brand-steel" />
                        Saved Favorites
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden gap-2">
            
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-steel rounded-lg hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-steel hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t py-2 shadow-inner bg-brand-white dark:bg-[#011425] border-brand-steel/15 text-brand-charcoal dark:text-brand-white">
          <div className="px-4 pt-2 pb-3 space-y-1.5">
            <button
              onClick={() => handleLinkClick('/')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50"
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('/public-lessons')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50"
            >
              Public Lessons
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleLinkClick('/dashboard/add-lesson')}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50"
                >
                  Add Lesson
                </button>
                <button
                  onClick={() => handleLinkClick('/dashboard/my-lessons')}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold hover:bg-brand-steel/5 dark:hover:bg-brand-charcoal/50"
                >
                  My Lessons
                </button>
                
                {isFree ? (
                  <button
                    onClick={() => handleLinkClick('/pricing')}
                    className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold bg-brand-ocean text-white hover:bg-brand-steel"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    Upgrade to Premium
                  </button>
                ) : (
                  <div className="px-3 py-1.5 flex items-center font-bold text-brand-ocean dark:text-brand-steel border border-brand-ocean/20 dark:border-brand-steel/20 bg-brand-ocean/10 dark:bg-brand-steel/15 rounded-lg text-xs max-w-max">
                    Premium Active
                  </div>
                )}
              </>
            )}

            {!user ? (
              <div className="pt-3 border-t border-brand-steel/15 flex gap-2">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="flex-1 text-center py-2.5 font-bold text-brand-ocean dark:text-brand-steel border border-brand-steel/15 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => handleLinkClick('/register')}
                  className="flex-1 text-center py-2.5 font-bold bg-brand-midnight text-white dark:bg-brand-white dark:text-brand-charcoal rounded-lg border border-brand-steel/20"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-brand-steel/15 space-y-1">
                <div className="px-3 py-1 flex items-center gap-2">
                  <img src={user.photoURL} className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-brand-charcoal dark:text-brand-white">{user.name}</p>
                    <p className="text-xs text-brand-steel">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/dashboard/profile'); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-brand-steel"
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleAdminToggle(); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-brand-steel"
                >
                  {user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/dashboard/my-favorites'); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-brand-steel"
                >
                  Saved Favorites
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-rose-500 font-semibold"
                >
                  Log Out
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}
