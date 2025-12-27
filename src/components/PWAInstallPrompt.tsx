import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(isInStandaloneMode);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        if (iOS) {
            // iOS doesn't support beforeinstallprompt, so we check purely based on platform logic
            setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-install-dismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }, 3000); // 3 seconds delay for iOS
        }

        // Listen for install prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Don't show immediately - wait a bit for better UX
            setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-install-dismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }, 5000); // Show after 5 seconds
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success('EventTix installed successfully!');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if already installed or dismissed
    if (isStandalone || !showPrompt) return null;

    // iOS Install Instructions
    if (isIOS) {
        return (
            <Card className="fixed bottom-4 left-4 right-4 z-50 border-2 border-primary/30 bg-card/95 backdrop-blur-lg shadow-neon-cyan animate-in slide-in-from-bottom-5">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Smartphone className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-base">Install App</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        App Store experience, no download required.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={handleDismiss}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-sm space-y-3 bg-muted/50 p-3 rounded-lg border border-white/10">
                                <p className="font-semibold text-primary">Tap the buttons below:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                                        <span className="flex-1">Tap Share <svg className="inline w-4 h-4 mx-1 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg> in menu</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                                        <span className="flex-1">Scroll & Tap 'Add to Home Screen' <svg className="inline w-4 h-4 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Android/Desktop Install Prompt
    return (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-2 border-primary/30 bg-card/95 backdrop-blur-lg shadow-neon-cyan animate-in slide-in-from-bottom-5">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold">Install EventTix</h3>
                                <p className="text-xs text-muted-foreground">
                                    Install our app for faster access and offline support
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 -mr-2"
                                onClick={handleDismiss}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600"
                                onClick={handleInstallClick}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDismiss}
                            >
                                Not now
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PWAInstallPrompt;
