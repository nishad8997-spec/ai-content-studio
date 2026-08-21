import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ROUTES } from './config/constants';
import { ROLES } from './config/roles';

// Application Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ExploreToolsPage } from './pages/ExploreToolsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ToolsPage } from './pages/ToolsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PricingPage } from './pages/PricingPage';

// Resource Pages
import { HelpCenterPage } from './pages/resources/HelpCenterPage';
import { GettingStartedPage } from './pages/resources/GettingStartedPage';
import { GuidesPage } from './pages/resources/GuidesPage';

// Legal Pages
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { CookiesPage } from './pages/legal/CookiesPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.pathname || ROUTES.HOME;
  });

  const navigate = (path) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || ROUTES.HOME);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderCurrentView = () => {
    switch (currentRoute) {
      case ROUTES.AUTH:
        return <AuthPage onNavigate={navigate} />;

      case ROUTES.PRICING:
        return <PricingPage onNavigate={navigate} />;

      case ROUTES.EXPLORE_TOOLS:
        return <ExploreToolsPage onNavigate={navigate} />;

      case ROUTES.HELP_CENTER:
        return <HelpCenterPage onNavigate={navigate} />;

      case ROUTES.GETTING_STARTED:
        return <GettingStartedPage onNavigate={navigate} />;

      case ROUTES.GUIDES:
        return <GuidesPage onNavigate={navigate} />;

      case ROUTES.TERMS:
        return <TermsPage onNavigate={navigate} />;

      case ROUTES.PRIVACY:
        return <PrivacyPage onNavigate={navigate} />;

      case ROUTES.COOKIES:
        return <CookiesPage onNavigate={navigate} />;

      case ROUTES.DASHBOARD:
        return (
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]} onNavigate={navigate}>
            <AppLayout activeRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
              <DashboardPage onNavigate={navigate} />
            </AppLayout>
          </ProtectedRoute>
        );

      case ROUTES.TOOLS:
        return (
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]} onNavigate={navigate}>
            <AppLayout activeRoute={ROUTES.TOOLS} onNavigate={navigate}>
              <ToolsPage onNavigate={navigate} />
            </AppLayout>
          </ProtectedRoute>
        );

      case ROUTES.HISTORY:
        return (
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]} onNavigate={navigate}>
            <AppLayout activeRoute={ROUTES.HISTORY} onNavigate={navigate}>
              <HistoryPage onNavigate={navigate} />
            </AppLayout>
          </ProtectedRoute>
        );

      case ROUTES.PROFILE:
        return (
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]} onNavigate={navigate}>
            <AppLayout activeRoute={ROUTES.PROFILE} onNavigate={navigate}>
              <ProfilePage onNavigate={navigate} />
            </AppLayout>
          </ProtectedRoute>
        );

      case ROUTES.HOME:
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {renderCurrentView()}
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
