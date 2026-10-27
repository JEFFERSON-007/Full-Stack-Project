import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AllNotesPage } from './pages/AllNotesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { MindMapsPage } from './pages/MindMapsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RecentPage } from './pages/RecentPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookOpen } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-paper-100 text-charcoal-700">
        <div className="animate-spin w-8 h-8 border-3 border-olive-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-mono text-charcoal-500">Opening Folio Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const NotFoundPage: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-paper-100">
    <BookOpen className="w-12 h-12 text-charcoal-300 mb-3" />
    <h2 className="text-xl font-editorial font-bold text-charcoal-900">
      404 — Page Not Found
    </h2>
    <p className="text-xs text-charcoal-500 max-w-sm mt-1 mb-5">
      The requested artifact or workspace section does not exist.
    </p>
    <a
      href="/"
      className="px-4 py-2 rounded-lg bg-olive-500 text-white text-xs font-semibold hover:bg-olive-600"
    >
      Return to Dashboard
    </a>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="notes" element={<AllNotesPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="graph" element={<KnowledgeGraphPage />} />
            <Route path="mindmaps" element={<MindMapsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="recent" element={<RecentPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
