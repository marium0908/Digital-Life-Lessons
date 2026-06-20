/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PublicLessons from './pages/PublicLessons';
import LessonDetails from './pages/LessonDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import PaymentSimulate from './pages/PaymentSimulate';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';

function MainRouterCoordinator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  
  // Custom micromapped state router
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname + window.location.search);
  const [selectedAuthorEmail, setSelectedAuthorEmail] = useState('');

  // Handle forward/back pops
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Soft push navigates
  const navigate = (route) => {
    window.history.pushState(null, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global loading spinner
  if (loading) {
    return (
      <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-steel mx-auto"></div>
          <p className="text-xs font-mono text-brand-steel">Loading your Scholar Identity...</p>
        </div>
      </div>
    );
  }

  // Route URL resolvers
  const urlPath = currentRoute.split('?')[0];

  // Pattern checks
  const isLessonDetailsRoute = urlPath.startsWith('/lessons/');
  const lessonId = isLessonDetailsRoute ? urlPath.replace('/lessons/', '') : '';

  const isStripeSimulateRoute = urlPath === '/payment/simulate-stripe';
  const isPaymentSuccessRoute = urlPath === '/payment/success';
  const isPaymentCancelRoute = urlPath === '/payment/cancel';

  const isDashboardRoute = urlPath.startsWith('/dashboard');

  // Guards
  const requiresAuth = isDashboardRoute || isLessonDetailsRoute || urlPath === '/pricing';

  // Let's decide which inner view to render
  let elementToRender = <Home onNavigate={navigate} />;

  if (requiresAuth && !user) {
    // Immediate auth defense
    elementToRender = <Login onNavigate={navigate} />;
  } else if (urlPath === '/' || urlPath === '/home') {
    elementToRender = <Home onNavigate={navigate} />;
  } else if (urlPath === '/public-lessons') {
    elementToRender = <PublicLessons onNavigate={navigate} />;
  } else if (isLessonDetailsRoute && lessonId) {
    elementToRender = (
      <LessonDetails
        lessonId={lessonId}
        onNavigate={navigate}
        onSelectAuthorEmail={(email) => setSelectedAuthorEmail(email)}
      />
    );
  } else if (urlPath === '/login') {
    elementToRender = <Login onNavigate={navigate} />;
  } else if (urlPath === '/register') {
    elementToRender = <Register onNavigate={navigate} />;
  } else if (urlPath === '/pricing') {
    elementToRender = <Pricing onNavigate={navigate} />;
  } else if (isStripeSimulateRoute) {
    elementToRender = <PaymentSimulate onNavigate={navigate} />;
  } else if (isPaymentSuccessRoute) {
    elementToRender = <PaymentSuccess onNavigate={navigate} />;
  } else if (isPaymentCancelRoute) {
    elementToRender = <PaymentCancel onNavigate={navigate} />;
  } else if (isDashboardRoute) {
    // Match specific subpages within dashboard
    let initialTab = 'overview';
    if (urlPath === '/dashboard/add-lesson') initialTab = 'add-lesson';
    if (urlPath === '/dashboard/my-lessons') initialTab = 'my-lessons';
    if (urlPath === '/dashboard/my-favorites') initialTab = 'my-favorites';
    if (urlPath === '/dashboard/profile') initialTab = 'profile';
    if (urlPath === '/dashboard/admin') initialTab = 'admin';
    if (urlPath === '/dashboard/admin/manage-users') initialTab = 'admin-users';
    if (urlPath === '/dashboard/admin/manage-lessons') initialTab = 'admin-lessons';
    if (urlPath === '/dashboard/admin/reported-lessons') initialTab = 'admin-reports';
    if (urlPath === '/dashboard/admin/profile') initialTab = 'admin-profile';

    elementToRender = <Dashboard initialTab={initialTab} onNavigate={navigate} />;
  } else {
    elementToRender = <NotFound onNavigate={navigate} />;
  }

  // Decide whether header/footers should be displayed (skip if full emulated stripe checkout screen or 404 page)
  const isHeaderFooterHidden = isStripeSimulateRoute || elementToRender.type === NotFound;

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white transition-colors duration-200`}>
      {!isHeaderFooterHidden && <Navbar onNavigate={navigate} currentRoute={urlPath} />}
      
      <main className="flex-grow">
        {elementToRender}
      </main>

      {!isHeaderFooterHidden && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainRouterCoordinator />
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
