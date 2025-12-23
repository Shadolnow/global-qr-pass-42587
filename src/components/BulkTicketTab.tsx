import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface BulkTicketTabProps {
    eventId: string;
    event: any;
    onSuccess: (tickets: any[]) => void;
}

export const BulkTicketTab = ({ eventId, event, onSuccess }: BulkTicketTabProps) => {
    const [tiers, setTiers] = useState<any[]>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [tiersLoaded, setTiersLoaded] = useState(false);

    // Load tiers
    const loadTiers = async () => {
        if (tiersLoaded) return;

        const { data, error } = await supabase
            .from('ticket_tiers')
            .select('*')
            .eq('event_id', eventId)
            .eq('is_active', true)
            .order('sort_order');

        if (data && !error) {
            setTiers(data);
            setTiersLoaded(true);
        }
    };

    // Update quantity
    const updateQuantity = (tierId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[tierId] || 0;
            const newQty = Math.max(0, Math.min(50, current + delta));
            if (newQty === 0) {
                const { [tierId]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [tierId]: newQty };
        });
    };

    // Calculate totals
    const calculateTotal = () => {
        return Object.entries(quantities).reduce((sum, [tierId, qty]) => {
            const tier = tiers.find(t => t.id === tierId);
            return sum + (tier?.price || 0) * qty;
        }, 0);
    };

    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const total = calculateTotal();

    // Create bulk tickets
    const handlePurchase = async (paymentMethod: 'upi' | 'cash') => {
        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill in all your details');
            return;
        }

        if (totalItems === 0) {
            toast.error('Please select at least one ticket');
            return;
        }

        try {
            setLoading(true);
            const createdTickets = [];

            // Create tickets for each tier quantity
            for (const [tierId, quantity] of Object.entries(quantities)) {
                for (let i = 0; i < quantity; i++) {
                    const ticketCode = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

                    const status = event.is_free ? 'paid' : 'pending';
                    const refId = paymentMethod === 'upi'
                        ? `UPI_BULK_${Date.now()}_${i}`
                        : `CASH_BULK_${Date.now()}_${i}`;

                    const { data, error } = await supabase
                        .from('tickets')
                        .insert({
                            event_id: eventId,
                            attendee_name: formData.name,
                            attendee_phone: formData.phone,
                            attendee_email: formData.email.toLowerCase(),
                            ticket_code: ticketCode,
                            tier_id: tierId,
                            payment_ref_id: refId,
                            payment_status: status,
                            payment_method: paymentMethod
                        })
                        .select()
                        .single();

                    if (data && !error) {
                        createdTickets.push(data);
                    } else {
                        console.error('Error creating ticket:', error);
                    }
                }
            }

            if (createdTickets.length === 0) {
                throw new Error('Failed to create any tickets');
            }

            // Success!
            toast.success(`🎉 ${createdTickets.length} tickets created successfully!`);

            // Confetti
            confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00E5FF', '#B400FF', '#FFFFFF']
            });

            // Reset form
            setQuantities({});
            setFormData({ name: '', email: '', phone: '' });

            // Callback with tickets
            onSuccess(createdTickets);

        } catch (error: any) {
            console.error('Bulk ticket error:', error);
            toast.error('Failed to create tickets: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Load tiers on mount
    if (!tiersLoaded) {
        loadTiers();
    }

    if (tiers.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No ticket tiers available for bulk purchase</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Customer Details */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Your Details</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="bulk-name">Full Name *</Label>
                            <Input
                                id="bulk-name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bulk-email">Email *</Label>
                            <Input
                                id="bulk-email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bulk-phone">Phone *</Label>
                            <Input
                                id="bulk-phone"
                                placeholder="+91 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        All tickets will be registered under this name and sent to this email.
                    </p>
                </CardContent>
            </Card>

            {/* Ticket Selection */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg">Select Tickets</h3>

                {tiers.map(tier => {
                    const qty = quantities[tier.id] || 0;
                    const available = tier.capacity ? tier.capacity - (tier.tickets_sold || 0) : 999;

                    return (
                        <Card key={tier.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Tier Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg">{tier.name}</h4>
                                            {tier.original_price && tier.original_price > tier.price && (
                                                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                                    Save ₹{tier.original_price - tier.price}
                                                </Badge>
                                            )}
                                        </div>

                                        {tier.description && (
                                            <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                                        )}

                                        <div className="flex items-baseline gap-2">
                                            {tier.original_price && (
                                                <span className="text-sm line-through text-muted-foreground">₹{tier.original_price}</span>
                                            )}
                                            <span className="text-xl font-bold text-primary">₹{tier.price}</span>
                                            <span className="text-xs text-muted-foreground">per ticket</span>
                                        </div>

                                        {available < 20 && available > 0 && (
                                            <p className="text-xs text-amber-500 mt-1">Only {available} left!</p>
                                        )}
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => updateQuantity(tier.id, -1)}
                                                disabled={qty === 0}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>

                                            <div className="w-16 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={Math.min(50, available)}
                                                    value={qty}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setQuantities(prev => ({ ...prev, [tier.id]: Math.max(0, Math.min(50, val)) }));
                                                    }}
                                                    className="text-center text-lg font-bold h-9"
                                                />
                                            </div>

                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => updateQuantity(tier.id, 1)}
                                                disabled={qty >= Math.min(50, available)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>

                                            {qty > 0 && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9"
                                                    onClick={() => setQuantities(prev => {
                                                        const { [tier.id]: removed, ...rest } = prev;
                                                        return rest;
                                                    })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>

                                        {qty > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Subtotal</p>
                                                <p className="text-lg font-bold">₹{tier.price * qty}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Cart Summary & Checkout */}
            {totalItems > 0 && (
                <Card className="sticky bottom-4 border-2 border-primary/30 shadow-2xl bg-gradient-to-r from-card to-primary/5">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{totalItems} ticket{totalItems > 1 ? 's' : ''}</p>
                                    <p className="text-3xl font-black">₹{total}</p>
                                </div>
                            </div>
                        </div>

                        {!event.is_free && (
                            <div className="grid gap-3 md:grid-cols-2">
                                <Button
                                    onClick={() => handlePurchase('upi')}
                                    disabled={loading}
                                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    {loading ? 'Processing...' : '💳 Pay via UPI'}
                                </Button>

                                <Button
                                    onClick={() => handlePurchase('cash')}
                                    disabled={loading}
                                    variant="outline"
                                    className="h-12 border-2"
                                >
                                    {loading ? 'Processing...' : '💵 Pay Cash at Venue'}
                                </Button>
                            </div>
                        )}

                        {event.is_free && (
                            <Button
                                onClick={() => handlePurchase('upi')}
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                            >
                                {loading ? 'Processing...' : '🎉 Get Free Tickets'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {totalItems === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Select tickets using the +/- buttons above</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
