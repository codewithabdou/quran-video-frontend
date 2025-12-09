import { ThemeLanguageProvider } from "./contexts/ThemeLanguageContext";
import ThemeLanguageControls from "./components/ThemeLanguageControls";
import LandingPage from "./components/LandingPage";
import ExperimentalVideoGenerator from "./components/ExperimentalVideoGenerator"; // Using this as main now
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ThemeLanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground transition-colors duration-300">
          <ThemeLanguageControls />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/generate" element={<ExperimentalVideoGenerator />} />
            {/* Legacy route hidden <Route path="/" element={<VideoGeneratorForm />} /> */}
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </ThemeLanguageProvider>
  );
}

export default App;
