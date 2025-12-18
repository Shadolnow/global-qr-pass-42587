import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdateNotification = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const handleUpdate = () => {
        updateServiceWorker(true);
        toast.success('App updated! Refreshing...');
    };

    if (!needRefresh) return null;

    return (
        <Card className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-2 border-green-500/30 bg-card/95 backdrop-blur-lg shadow-lg animate-in slide-in-from-top-5">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold mb-1">Update Available</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            A new version of EventTix is available. Update now for the latest features and improvements.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                onClick={handleUpdate}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Update Now
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setNeedRefresh(false)}
                            >
                                Later
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PWAUpdateNotification;
