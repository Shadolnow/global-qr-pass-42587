import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface SimpleTier {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    capacity?: number;
    ticketsSold?: number;
}

interface SimpleMultiTicketProps {
    tiers: SimpleTier[];
    onProceed: (cart: { tierId: string; tierName: string; quantity: number; price: number }[]) => void;
}

export const SimpleMultiTicket = ({ tiers, onProceed }: SimpleMultiTicketProps) => {
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const updateQuantity = (tierId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[tierId] || 0;
            const newQty = Math.max(0, Math.min(10, current + delta)); // Max 10 per tier
            const updated = { ...prev };
            if (newQty === 0) {
                delete updated[tierId];
            } else {
                updated[tierId] = newQty;
            }
            return updated;
        });
    };

    const calculateTotal = () => {
        return Object.entries(quantities).reduce((sum, [tierId, qty]) => {
            const tier = tiers.find(t => t.id === tierId);
            return sum + (tier?.price || 0) * qty;
        }, 0);
    };

    const calculateSavings = () => {
        return Object.entries(quantities).reduce((sum, [tierId, qty]) => {
            const tier = tiers.find(t => t.id === tierId);
            if (!tier?.originalPrice) return sum;
            return sum + (tier.originalPrice - tier.price) * qty;
        }, 0);
    };

    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const total = calculateTotal();
    const savings = calculateSavings();

    const handleProceed = () => {
        const cart = Object.entries(quantities).map(([tierId, quantity]) => {
            const tier = tiers.find(t => t.id === tierId)!;
            return {
                tierId,
                tierName: tier.name,
                quantity,
                price: tier.price
            };
        });
        onProceed(cart);
    };

    const getAvailable = (tier: SimpleTier) => {
        if (!tier.capacity) return 999;
        return tier.capacity - (tier.ticketsSold || 0);
    };

    return (
        <div className="space-y-4">
            {/* Tier Cards with Quantity Selectors */}
            {tiers.map(tier => {
                const qty = quantities[tier.id] || 0;
                const available = getAvailable(tier);
                const isSoldOut = available <= 0;

                return (
                    <Card key={tier.id} className={`${isSoldOut ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                {/* Left: Tier Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg truncate">{tier.name}</h3>
                                        {tier.originalPrice && tier.originalPrice > tier.price && (
                                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                                SAVE ₹{tier.originalPrice - tier.price}
                                            </Badge>
                                        )}
                                    </div>

                                    {tier.description && (
                                        <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                                    )}

                                    <div className="flex items-baseline gap-2">
                                        {tier.originalPrice && tier.originalPrice > tier.price && (
                                            <span className="text-sm text-muted-foreground line-through">₹{tier.originalPrice}</span>
                                        )}
                                        <span className="text-xl font-bold text-primary">₹{tier.price}</span>
                                        <span className="text-xs text-muted-foreground">per ticket</span>
                                    </div>

                                    {available < 10 && available > 0 && (
                                        <p className="text-xs text-amber-500 mt-1">Only {available} left!</p>
                                    )}
                                    {isSoldOut && (
                                        <p className="text-xs text-red-500 mt-1 font-semibold">SOLD OUT</p>
                                    )}
                                </div>

                                {/* Right: Quantity Selector */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(tier.id, -1)}
                                            disabled={qty === 0 || isSoldOut}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>

                                        <div className="w-12 text-center">
                                            <span className="text-2xl font-bold">{qty}</span>
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(tier.id, 1)}
                                            disabled={qty >= Math.min(10, available) || isSoldOut}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {qty > 0 && (
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Subtotal</p>
                                            <p className="text-lg font-bold text-primary">₹{tier.price * qty}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Sticky Bottom Summary */}
            {totalItems > 0 && (
                <Card className="sticky bottom-4 border-2 border-primary/30 shadow-2xl bg-gradient-to-r from-card via-card to-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{totalItems} ticket{totalItems > 1 ? 's' : ''}</p>
                                    <p className="text-2xl font-black">₹{total}</p>
                                    {savings > 0 && (
                                        <p className="text-xs text-green-500 font-semibold">Saving ₹{savings}</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleProceed}
                                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 min-w-[140px]"
                            >
                                Proceed
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {totalItems === 0 && (
                <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Select tickets to continue</p>
                </div>
            )}
        </div>
    );
};
