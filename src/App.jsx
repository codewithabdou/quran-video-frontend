import { ThemeLanguageProvider } from "./contexts/ThemeLanguageContext";
import ThemeLanguageControls from "./components/ThemeLanguageControls";
import VideoGeneratorForm from "./components/VideoGeneratorForm";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeLanguageProvider>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground transition-colors duration-300">
        <ThemeLanguageControls />
        <VideoGeneratorForm />
        <Toaster />
      </div>
    </ThemeLanguageProvider>
  );
}

export default App;
