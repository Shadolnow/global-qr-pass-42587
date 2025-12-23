import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Ticket, IndianRupee, Music, Tv, Users, Disc3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TicketTier {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity: number | null;
  tickets_sold?: number;
  is_active: boolean;
  sort_order: number;
}

interface TicketTiersManagerProps {
  eventId: string;
  isFreeEvent: boolean;
}

// Premium tier templates
const TIER_TEMPLATES = [
  {
    icon: Music,
    name: 'VIP BAR AREA',
    description: '• Live Band Inside\n• Max 40 Couples\n• +₹500 DJ Floor Access (FREE in Early Bird)',
    price: 3199,
    originalPrice: 3999,
    couplable: true,
    style: 'border-cyan-500 bg-cyan-500/5'
  },
  {
    icon: Tv,
    name: 'BAR CLASSIC ZONE',
    description: '• Live Band on Screen\n• Stags Welcome\n• +₹500 DJ Floor Access (FREE in Early Bird)',
    price: 2799,
    originalPrice: 3499,
    stagPrice: 1999,
    originalStagPrice: 2499,
    couplable: true,
    style: 'border-pink-500 bg-pink-500/5'
  },
  {
    icon: Disc3,
    name: 'DJ+ AREA',
    description: '• High-Energy DJ Floor\n• Dancing Paradise\n• DJ Floor Included - No Extra Charge',
    price: 2799,
    originalPrice: 3499,
    stagPrice: 1999,
    originalStagPrice: 2499,
    couplable: true,
    style: 'border-purple-500 bg-purple-500/5'
  },
  {
    icon: Users,
    name: 'FAMILY EXCLUSIVE',
    description: '• Solo Music\n• Kid-Friendly\n• +₹500 DJ Floor Access (FREE in Early Bird)',
    price: 3199,
    originalPrice: 3999,
    couplable: true,
    style: 'border-green-500 bg-green-500/5'
  },
];

export const TicketTiersManager = ({ eventId, isFreeEvent }: TicketTiersManagerProps) => {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, [eventId]);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Failed to load ticket tiers');
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    const newTier: TicketTier = {
      name: '',
      description: '',
      price: isFreeEvent ? 0 : 100,
      currency: 'INR',
      capacity: null,
      is_active: true,
      sort_order: tiers.length
    };
    setTiers([...tiers, newTier]);
  };

  const addFromTemplate = (template: typeof TIER_TEMPLATES[0]) => {
    const newTier: TicketTier = {
      name: template.name,
      description: template.description,
      price: isFreeEvent ? 0 : template.price,
      currency: 'INR',
      capacity: null,
      is_active: true,
      sort_order: tiers.length
    };
    setTiers([...tiers, newTier]);
    setShowTemplates(false);
    toast.success(`Added ${template.name} tier`);
  };

  const updateTier = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...tiers];
    (updated[index] as any)[field] = value;
    setTiers(updated);
  };

  const removeTier = async (index: number) => {
    const tier = tiers[index];
    if (tier.id) {
      if (tier.tickets_sold && tier.tickets_sold > 0) {
        toast.error('Cannot delete tier with existing tickets');
        return;
      }

      try {
        const { error } = await supabase
          .from('ticket_tiers')
          .delete()
          .eq('id', tier.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting tier:', error);
        toast.error('Failed to delete tier');
        return;
      }
    }
    setTiers(tiers.filter((_, i) => i !== index));
    toast.success('Tier removed');
  };

  const saveTiers = async () => {
    setSaving(true);
    try {
      for (const tier of tiers) {
        if (!tier.name.trim()) {
          toast.error('All tiers must have a name');
          setSaving(false);
          return;
        }
        if (tier.price < 0) {
          toast.error('Price cannot be negative');
          setSaving(false);
          return;
        }
      }

      const newTiers = tiers.filter(t => !t.id);
      const existingTiers = tiers.filter(t => t.id);

      for (const tier of existingTiers) {
        const { error } = await supabase
          .from('ticket_tiers')
          .update({
            name: tier.name.trim(),
            description: tier.description?.trim() || null,
            price: tier.price,
            currency: tier.currency,
            capacity: tier.capacity,
            is_active: tier.is_active,
            sort_order: tier.sort_order
          })
          .eq('id', tier.id);

        if (error) throw error;
      }

      if (newTiers.length > 0) {
        const { error } = await supabase
          .from('ticket_tiers')
          .insert(
            newTiers.map(t => ({
              event_id: eventId,
              name: t.name.trim(),
              description: t.description?.trim() || null,
              price: t.price,
              currency: t.currency,
              capacity: t.capacity,
              is_active: t.is_active,
              sort_order: t.sort_order
            }))
          );

        if (error) throw error;
      }

      toast.success('Ticket tiers saved successfully!');
      fetchTiers();
    } catch (error) {
      console.error('Error saving tiers:', error);
      toast.error('Failed to save ticket tiers');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading ticket tiers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Ticket Tiers & Pricing
            </CardTitle>
            <CardDescription className="mt-1">
              Create different ticket options with various prices and capacities
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Ticket className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/30">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                    SELECT YOUR ZONE
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Choose from our premium ticket tiers - Click any zone to add it
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TIER_TEMPLATES.map((template, idx) => (
                    <div
                      key={template.name}
                      className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                        bg-gradient-to-br from-card/80 via-card to-card/60 backdrop-blur-sm
                        border-2 ${template.style} hover:shadow-primary/20`}
                      onClick={() => addFromTemplate(template)}
                    >
                      {/* Animated background glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                      {/* Icon and Title */}
                      <div className="relative flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-cyan-500/20' :
                            idx === 1 ? 'bg-pink-500/20' :
                              idx === 2 ? 'bg-purple-500/20' :
                                'bg-green-500/20'
                          }`}>
                          <template.icon className={`w-8 h-8 ${idx === 0 ? 'text-cyan-400' :
                              idx === 1 ? 'text-pink-400' :
                                idx === 2 ? 'text-purple-400' :
                                  'text-green-400'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold tracking-wide uppercase mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.couplable && !template.stagPrice && 'Couples Only (40 seats)'}
                            {template.stagPrice && 'Stag Entry Allowed'}
                            {template.name.includes('FAMILY') && 'Children Allowed'}
                            {template.name.includes('DJ') && 'High-Energy DJ Floor'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="relative mb-4">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className={`text-4xl font-bold ${idx === 0 ? 'text-cyan-400' :
                              idx === 1 ? 'text-pink-400' :
                                idx === 2 ? 'text-purple-400' :
                                  'text-green-400'
                            }`}>
                            ₹{template.price.toLocaleString()}
                          </span>
                          <span className="text-base text-muted-foreground line-through">
                            ₹{template.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-primary/20 text-primary border-primary/50 text-xs px-2 py-0.5">
                            Early Bird
                          </Badge>
                        </div>
                        {template.stagPrice && (
                          <div className="flex items-baseline gap-3 text-sm">
                            <span className="text-xl font-bold">₹{template.stagPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground line-through">₹{template.originalStagPrice?.toLocaleString()}</span>
                            <span className="text-muted-foreground">/stag</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="relative space-y-2">
                        {template.description.split('\n').map((line, i) => (
                          line.trim() && (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${idx === 0 ? 'bg-cyan-400' :
                                  idx === 1 ? 'bg-pink-400' :
                                    idx === 2 ? 'bg-purple-400' :
                                      'bg-green-400'
                                }`} />
                              <span className="text-muted-foreground">{line.replace('•', '').trim()}</span>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={addTier}>
              <Plus className="w-4 h-4 mr-2" />
              Custom Tier
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tiers.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No ticket tiers created yet. Choose from templates or create custom tiers.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowTemplates(true)} variant="outline">
                <Ticket className="w-4 h-4 mr-2" />
                View Templates
              </Button>
              <Button onClick={addTier}>
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Tier
              </Button>
            </div>
          </div>
        ) : (
          <>
            {tiers.map((tier, index) => (
              <div
                key={tier.id || `new-${index}`}
                className="p-4 border rounded-lg space-y-4 bg-card"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    <span className="font-medium">Tier {index + 1}</span>
                    {tier.tickets_sold && tier.tickets_sold > 0 && (
                      <Badge variant="secondary">
                        {tier.tickets_sold} sold
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tier.is_active}
                        onCheckedChange={(checked) => updateTier(index, 'is_active', checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {tier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTier(index)}
                      disabled={tier.tickets_sold && tier.tickets_sold > 0}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tier Name *</Label>
                    <Input
                      placeholder="e.g., VIP BAR AREA, DJ+ AREA"
                      value={tier.name}
                      onChange={(e) => updateTier(index, 'name', e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0.00"
                        value={tier.price}
                        onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value) || 0)}
                        className="pl-9"
                        disabled={isFreeEvent}
                      />
                    </div>
                    {isFreeEvent && (
                      <p className="text-xs text-muted-foreground">
                        This is a free event. Tiers are for categorization only.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description & Features</Label>
                  <Textarea
                    placeholder="What's included? Use bullet points:&#10;• Live Band Inside&#10;• Max 40 Couples&#10;• +₹500 DJ Floor Access (FREE in Early Bird)"
                    value={tier.description}
                    onChange={(e) => updateTier(index, 'description', e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Capacity (leave empty for unlimited)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={tier.capacity || ''}
                    onChange={(e) => updateTier(index, 'capacity', e.target.value ? parseInt(e.target.value) : null)}
                  />
                  {tier.capacity && tier.tickets_sold !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {tier.capacity - tier.tickets_sold} remaining
                    </p>
                  )}
                </div>
              </div>
            ))}

            <Button onClick={saveTiers} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Ticket Tiers'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
