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

        // Listen for install prompt
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
                            <Smartphone className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm">Install EventTix</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Add to your home screen for the best experience
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
                            <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-lg">
                                <p className="font-medium">How to install:</p>
                                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                    <li>Tap the Share button (square with arrow)</li>
                                    <li>Scroll down and tap "Add to Home Screen"</li>
                                    <li>Tap "Add" to confirm</li>
                                </ol>
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
