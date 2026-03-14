import { lazy, Suspense, useState } from "react";
import { ThemeLanguageProvider, useThemeLanguage } from "./contexts/ThemeLanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { translations } from "./lib/translations";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load route components for better performance
const LandingPage = lazy(() => import("./components/LandingPage"));
const ExperimentalVideoGenerator = lazy(() => import("./components/ExperimentalVideoGenerator"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const HistoryPage = lazy(() => import("./components/HistoryPage"));
const AuthCallback = lazy(() => import("./components/AuthCallback"));

// Loading fallback component with translation support
const LoadingFallback = () => {
  const { language } = useThemeLanguage();
  const t = (key) => translations[language]?.[key] || translations.en[key];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
};


function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground transition-colors duration-300">
      <Navbar onAuthRequired={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage onAuthRequired={() => setIsAuthModalOpen(true)} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/generate"
              element={
                <ProtectedRoute onAuthRequired={() => setIsAuthModalOpen(true)}>
                  <ExperimentalVideoGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute onAuthRequired={() => setIsAuthModalOpen(true)}>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly onAuthRequired={() => setIsAuthModalOpen(true)}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeLanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeLanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
