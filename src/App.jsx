import { lazy, Suspense } from "react";
import { ThemeLanguageProvider, useThemeLanguage } from "./contexts/ThemeLanguageContext";
import ThemeLanguageControls from "./components/ThemeLanguageControls";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { translations } from "./lib/translations";

// Lazy load route components for better performance
const LandingPage = lazy(() => import("./components/LandingPage"));
const ExperimentalVideoGenerator = lazy(() => import("./components/ExperimentalVideoGenerator"));

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


function App() {
  return (
    <ErrorBoundary>
      <ThemeLanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background font-sans antialiased text-foreground transition-colors duration-300">
            <ThemeLanguageControls />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/generate" element={<ExperimentalVideoGenerator />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </BrowserRouter>
      </ThemeLanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
