import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next';
import App from "./App.tsx";
import "./index.css";
import i18n from './i18n/config' // Initialize i18n

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </QueryClientProvider>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
