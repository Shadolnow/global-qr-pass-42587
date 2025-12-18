import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';
import { toast } from 'sonner';

const PushNotificationManager = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const sub = await registration.pushManager.getSubscription();
                setSubscription(sub);
            } catch (error) {
                console.error('Error checking subscription:', error);
            }
        }
    };

    const requestPermission = async () => {
        setLoading(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                await subscribeToPush();
                toast.success('Notifications enabled!', {
                    description: 'You\'ll receive updates about your events and tickets.'
                });
            } else {
                toast.error('Notifications blocked', {
                    description: 'You can enable them later in your browser settings.'
                });
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            toast.error('Failed to enable notifications');
        } finally {
            setLoading(false);
        }
    };

    const subscribeToPush = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;

                // Generate VAPID keys at: https://vapidkeys.com/
                // For now, using a placeholder - you'll need to replace this
                const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                });

                setSubscription(subscription);

                // TODO: Send subscription to your backend
                // await fetch('/api/push-subscribe', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(subscription)
                // });

                console.log('Push subscription:', subscription);
            } catch (error) {
                console.error('Error subscribing to push:', error);
            }
        }
    };

    const unsubscribeFromPush = async () => {
        if (subscription) {
            setLoading(true);
            try {
                await subscription.unsubscribe();
                setSubscription(null);
                toast.success('Notifications disabled');
            } catch (error) {
                console.error('Error unsubscribing:', error);
                toast.error('Failed to disable notifications');
            } finally {
                setLoading(false);
            }
        }
    };

    const sendTestNotification = () => {
        if (permission === 'granted') {
            new Notification('EventTix', {
                body: 'Your event "Summer Music Festival" starts in 1 hour!',
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: 'event-reminder',
                requireInteraction: false,
                data: {
                    url: '/events'
                }
            });
        }
    };

    // Helper function to convert VAPID key
    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    if (!('Notification' in window)) {
        return null; // Browser doesn't support notifications
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Push Notifications
                </CardTitle>
                <CardDescription>
                    Get notified about event updates, ticket sales, and reminders
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {permission === 'granted' ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <BellOff className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium">
                                {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {permission === 'granted'
                                    ? 'You\'ll receive event notifications'
                                    : permission === 'denied'
                                        ? 'Enable in browser settings'
                                        : 'Enable to get updates'}
                            </p>
                        </div>
                    </div>
                    {permission === 'granted' && subscription ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={unsubscribeFromPush}
                            disabled={loading}
                        >
                            Disable
                        </Button>
                    ) : permission !== 'denied' && (
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600"
                            onClick={requestPermission}
                            disabled={loading}
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Enable
                        </Button>
                    )}
                </div>

                {permission === 'granted' && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Notification Types:</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Event reminders (24h, 1h before)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Ticket sales updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Event changes & cancellations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>New events from followed organizers</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={sendTestNotification}
                        >
                            Send Test Notification
                        </Button>
                    </div>
                )}

                {permission === 'denied' && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                            Notifications are blocked. To enable them:
                        </p>
                        <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                            <li>Click the lock icon in your browser's address bar</li>
                            <li>Find "Notifications" in the permissions list</li>
                            <li>Change it to "Allow"</li>
                            <li>Refresh this page</li>
                        </ol>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PushNotificationManager;
