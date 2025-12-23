import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Tv, Disc3, Users, Plus, Minus } from 'lucide-react';
import { IndianRupee } from 'lucide-react';

interface TierOption {
    id: string;
    name: string;
    icon: any;
    description: string[];
    couplePrice: number;
    stagPrice?: number;
    originalCouplePrice: number;
    originalStagPrice?: number;
    maxCapacity?: number;
    color: string;
}

interface TicketSelection {
    tierId: string;
    tierName: string;
    type: 'couple' | 'stag';
    quantity: number;
    price: number;
    originalPrice: number;
}

interface MultiTicketSelectorProps {
    tiers: TierOption[];
    onContinue: (selections: TicketSelection[]) => void;
}

export const MultiTicketSelector = ({ tiers, onContinue }: MultiTicketSelectorProps) => {
    const [selections, setSelections] = useState<Map<string, TicketSelection>>(new Map());

    const updateQuantity = (tierId: string, type: 'couple' | 'stag', delta: number, tier: TierOption) => {
        const key = `${tierId}-${type}`;
        const newSelections = new Map(selections);
        const current = newSelections.get(key);

        if (current) {
            const newQty = Math.max(0, current.quantity + delta);
            if (newQty === 0) {
                newSelections.delete(key);
            } else {
                newSelections.set(key, { ...current, quantity: newQty });
            }
        } else if (delta > 0) {
            const price = type === 'couple' ? tier.couplePrice : tier.stagPrice!;
            const originalPrice = type === 'couple' ? tier.originalCouplePrice : tier.originalStagPrice!;
            newSelections.set(key, {
                tierId,
                tierName: tier.name,
                type,
                quantity: 1,
                price,
                originalPrice
            });
        }

        setSelections(newSelections);
    };

    const getQuantity = (tierId: string, type: 'couple' | 'stag'): number => {
        return selections.get(`${tierId}-${type}`)?.quantity || 0;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let originalSubtotal = 0;

        selections.forEach((selection) => {
            subtotal += selection.price * selection.quantity;
            originalSubtotal += selection.originalPrice * selection.quantity;
        });

        const savings = originalSubtotal - subtotal;
        const savingsPercent = originalSubtotal > 0 ? Math.round((savings / originalSubtotal) * 100) : 0;

        return { subtotal, originalSubtotal, savings, savingsPercent };
    };

    const { subtotal, savings, savingsPercent } = calculateTotals();
    const selectionsArray = Array.from(selections.values());

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,400px] gap-6">
                {/* Left: Ticket Selection */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🎫 Select Your Tickets
                    </h2>

                    {tiers.map((tier) => (
                        <Card key={tier.id} className={`border-2 ${tier.color} bg-card/50 backdrop-blur-sm overflow-hidden`}>
                            <div className="p-4">
                                {/* Tier Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.color.replace('border-', 'from-')}/20`}>
                                        <tier.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{tier.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {tier.description.map((desc, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {desc}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Couple Option */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-2">
                                    <div className="flex-1">
                                        <p className="font-semibold">Couple</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-muted-foreground line-through">
                                                ₹{tier.originalCouplePrice}
                                            </span>
                                            <span className="text-lg font-bold text-green-500">
                                                ₹{tier.couplePrice}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(tier.id, 'couple', -1, tier)}
                                            disabled={getQuantity(tier.id, 'couple') === 0}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center font-bold">
                                            {getQuantity(tier.id, 'couple')}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(tier.id, 'couple', 1, tier)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Stag Option (if available) */}
                                {tier.stagPrice && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex-1">
                                            <p className="font-semibold">Stag</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ₹{tier.originalStagPrice}
                                                </span>
                                                <span className="text-lg font-bold text-green-500">
                                                    ₹{tier.stagPrice}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => updateQuantity(tier.id, 'stag', -1, tier)}
                                                disabled={getQuantity(tier.id, 'stag') === 0}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center font-bold">
                                                {getQuantity(tier.id, 'stag')}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => updateQuantity(tier.id, 'stag', 1, tier)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Right: Order Summary */}
                <div className="lg:sticky lg:top-4 h-fit">
                    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                🛒 Order Summary
                            </h3>

                            {/* Selected Items */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectionsArray.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No tickets selected yet
                                    </p>
                                ) : (
                                    selectionsArray.map((sel) => (
                                        <div key={`${sel.tierId}-${sel.type}`} className="flex justify-between text-sm">
                                            <div>
                                                <p className="font-semibold">{sel.tierName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sel.type === 'couple' ? 'Couple' : 'Stag'} × {sel.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground line-through">
                                                    ₹{sel.originalPrice * sel.quantity}
                                                </p>
                                                <p className="font-bold">₹{sel.price * sel.quantity}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectionsArray.length > 0 && (
                                <>
                                    {/* Divider */}
                                    <div className="h-px bg-border" />

                                    {/* Subtotal */}
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{subtotal}</span>
                                    </div>

                                    {/* Savings */}
                                    {savings > 0 && (
                                        <div className="flex justify-between text-sm text-green-500">
                                            <span className="flex items-center gap-1">
                                                🎉 Early Bird Savings
                                            </span>
                                            <span className="font-bold">-₹{savings}</span>
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="flex justify-between items-baseline pt-2 border-t border-border">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-3xl font-black text-primary">₹{subtotal}</span>
                                    </div>

                                    {/* Savings Badge */}
                                    {savingsPercent > 0 && (
                                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                                            <p className="text-sm font-bold text-green-400">
                                                🎉 You're saving ₹{savings} ({savingsPercent}% off)!
                                            </p>
                                        </div>
                                    )}

                                    {/* Continue Button */}
                                    <Button
                                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                                        onClick={() => onContinue(selectionsArray)}
                                    >
                                        Continue →
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
