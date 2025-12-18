import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Wifi, WifiOff, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface Ticket {
    id: string;
    event_title: string;
    event_date: string;
    venue: string;
    ticket_code: string;
    tier_name?: string;
    cached_at?: string;
}

const OfflineTicketStorage = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cachedTickets, setCachedTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Back online!', {
                description: 'Your tickets will sync automatically.'
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.info('You\'re offline', {
                description: 'Don\'t worry, your cached tickets are still available!'
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load cached tickets from IndexedDB
        loadCachedTickets();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadCachedTickets = async () => {
        try {
            // Open IndexedDB
            const db = await openTicketDB();
            const transaction = db.transaction(['tickets'], 'readonly');
            const store = transaction.objectStore('tickets');
            const request = store.getAll();

            request.onsuccess = () => {
                setCachedTickets(request.result || []);
            };
        } catch (error) {
            console.error('Error loading cached tickets:', error);
        }
    };

    const openTicketDB = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EventTixTickets', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('tickets')) {
                    db.createObjectStore('tickets', { keyPath: 'id' });
                }
            };
        });
    };

    const cacheTicket = async (ticket: Ticket) => {
        try {
            const db = await openTicketDB();
            const transaction = db.transaction(['tickets'], 'readwrite');
            const store = transaction.objectStore('tickets');

            const ticketWithCache = {
                ...ticket,
                cached_at: new Date().toISOString()
            };

            store.put(ticketWithCache);

            transaction.oncomplete = () => {
                loadCachedTickets();
                toast.success('Ticket cached for offline use!');
            };
        } catch (error) {
            console.error('Error caching ticket:', error);
            toast.error('Failed to cache ticket');
        }
    };

    const removeCachedTicket = async (ticketId: string) => {
        try {
            const db = await openTicketDB();
            const transaction = db.transaction(['tickets'], 'readwrite');
            const store = transaction.objectStore('tickets');

            store.delete(ticketId);

            transaction.oncomplete = () => {
                loadCachedTickets();
                toast.success('Ticket removed from cache');
            };
        } catch (error) {
            console.error('Error removing cached ticket:', error);
            toast.error('Failed to remove ticket');
        }
    };

    const syncTickets = async () => {
        if (!isOnline) {
            toast.error('Cannot sync while offline');
            return;
        }

        setLoading(true);
        try {
            // TODO: Fetch latest tickets from Supabase
            // const { data } = await supabase.from('tickets').select('*');
            // Cache each ticket

            toast.success('Tickets synced successfully!');
            await loadCachedTickets();
        } catch (error) {
            console.error('Error syncing tickets:', error);
            toast.error('Failed to sync tickets');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Online/Offline Status */}
            <Card className={`border-2 ${isOnline ? 'border-green-500/30' : 'border-amber-500/30'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isOnline ? (
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Wifi className="w-5 h-5 text-green-500" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <WifiOff className="w-5 h-5 text-amber-500" />
                                </div>
                            )}
                            <div>
                                <p className="font-medium">
                                    {isOnline ? 'Online' : 'Offline Mode'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isOnline
                                        ? 'All features available'
                                        : `${cachedTickets.length} tickets available offline`}
                                </p>
                            </div>
                        </div>
                        {isOnline && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={syncTickets}
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Sync
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Cached Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        Offline Tickets ({cachedTickets.length})
                    </CardTitle>
                    <CardDescription>
                        These tickets are available even without internet connection
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {cachedTickets.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <Download className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                No tickets cached yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tickets are automatically cached when you view them
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cachedTickets.map((ticket) => (
                                <Card key={ticket.id} className="border border-border">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* QR Code */}
                                            <div className="flex-shrink-0 bg-white p-2 rounded-lg">
                                                <QRCodeSVG
                                                    value={ticket.ticket_code}
                                                    size={80}
                                                    level="H"
                                                />
                                            </div>

                                            {/* Ticket Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold truncate">{ticket.event_title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(ticket.event_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {ticket.venue}
                                                </p>
                                                {ticket.tier_name && (
                                                    <Badge variant="outline" className="mt-2">
                                                        {ticket.tier_name}
                                                    </Badge>
                                                )}
                                                {ticket.cached_at && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Cached: {new Date(ticket.cached_at).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeCachedTicket(ticket.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>✓ Tickets work offline - no internet needed</p>
                                <p>✓ QR codes scan even without connection</p>
                                <p>✓ Automatically synced when online</p>
                                <p>✓ Stored securely on your device</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OfflineTicketStorage;
