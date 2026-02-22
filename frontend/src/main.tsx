import { createRoot } from "react-dom/client";
import { useState, useCallback } from "react";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./services/analytics";
import { SyncProvider } from "./context/SyncContext";
import SplashScreen from "./pages/SplashScreen";

// Initialize all analytics tools before the app renders
initAnalytics();

function Root() {
    const [showSplash, setShowSplash] = useState(true);
    const handleDone = useCallback(() => setShowSplash(false), []);

    return (
        <>
            {showSplash && <SplashScreen onDone={handleDone} />}
            <SyncProvider>
                <App />
            </SyncProvider>
        </>
    );
}

createRoot(document.getElementById("root")!).render(<Root />);


