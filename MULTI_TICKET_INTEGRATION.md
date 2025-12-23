# Multi-Ticket Selector Integration Guide

## Step 1: Add Import
At the top of `PublicEvent.tsx` (around line 15), add:
```tsx
import { MultiTicketSelector } from '@/components/MultiTicketSelector';
import { Music, Tv, Disc3, Users } from 'lucide-react';
```

## Step 2: Add State Variables
After line 56 (with other state), add:
```tsx
const [ticketSelections, setTicketSelections] = useState<any[]>([]);
const [showMultiTicketSelector, setShowMultiTicketSelector] = useState(false);
const [tiers, setTiers] = useState<any[]>([]);
```

## Step 3: Load Tiers Data
Modify the tier fetching (around line 84-91) to load full tier data:

```tsx
// Load full tier data
const { data: tiersData } = await supabase
  .from('ticket_tiers')
  .select('*')
  .eq('event_id', eventId)
  .eq('is_active', true)
  .order('sort_order');

if (tiersData && tiersData.length > 0) {
  setHasTiers(true);
  setTiers(tiersData);
} else {
  setHasTiers(false);
  setTiers([]);
}
```

## Step 4: Replace the Registration Form Section
Find the registration card (around line 674-697) and replace with:

```tsx
{(event.capacity && ticketsSold >= event.capacity) ? (
  <WaitlistForm eventId={eventId!} />
) : showMultiTicketSelector && hasTiers ? (
  <MultiTicketSelector
    tiers={tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      icon: tier.name.includes('VIP') ? Music : tier.name.includes('BAR') ? Tv : tier.name.includes('DJ') ? Disc3 : Users,
      description: tier.description?.split(',') || [],
      couplePrice: tier.price || 0,
      stagPrice: tier.stag_price || null,
      originalCouplePrice: tier.original_price || tier.price,
      originalStagPrice: tier.original_stag_price || tier.stag_price,
      maxCapacity: tier.capacity,
      color: tier.name.includes('VIP') ? 'border-cyan-500' : tier.name.includes('BAR') ? 'border-pink-500' : 'border-purple-500'
    }))}
    onContinue={(selections) => {
      setTicketSelections(selections);
      setShowPaymentDialog(true);
    }}
  />
) : (
  <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
    {/* Keep existing single ticket form */}
    <CardHeader>
      <CardTitle className="text-2xl flex items-center gap-2">
        <Ticket className="w-6 h-6 text-primary" />
        {event.is_free ? 'Register for Free' : 'Buy Ticket'}
      </CardTitle>
      <CardDescription>
        Enter your details to book your spot.
      </CardDescription>
      <CheckoutProgress
        currentStep={claimedTicket ? 'confirm' : 'details'}
      />
    </CardHeader>
    <CardContent>
      <form onSubmit={handleClaim} className="space-y-4">
        {hasTiers && (
          <div className="mb-4">
            <Button
              type="button"
              onClick={() => setShowMultiTicketSelector(true)}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600"
            >
              🎫 Select Multiple Tickets
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Or continue below for single ticket purchase
            </p>
          </div>
        )}
        
        {/* Keep existing TierSelector and form fields */}
        {hasTiers && (
          <TierSelector
            eventId={eventId!}
            isFreeEvent={event.is_free}
            selectedTierId={selectedTier?.id || null}
            onSelect={(tier) => setSelectedTier(tier ? { id: tier.id, name: tier.name, price: tier.price } : null)}
          />
        )}
        
        {/* Rest of the existing form continues... */}
      </form>
    </CardContent>
  </Card>
)}
```

## Step 5: Update Payment Dialog
Modify the payment dialog to handle multiple tickets.

## Step 6: Create Multiple Tickets
Add a function to create multiple tickets:

```tsx
const createMultipleTickets = async (paymentType: 'upi' | 'cash' = 'upi') => {
  try {
    setLoading(true);
    
    const ticketPromises = ticketSelections.flatMap(selection => {
      const tickets = [];
      for (let i = 0; i < selection.quantity; i++) {
        const ticketCode = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        tickets.push(
          supabase.from('tickets').insert({
            event_id: eventId,
            attendee_name: formData.name,
            attendee_phone: formData.phone,
            attendee_email: formData.email.toLowerCase(),
            ticket_code: ticketCode,
            tier_id: selection.tierId,
            payment_ref_id: paymentType === 'upi' ? `UPI_${Date.now()}` : `CASH_${Date.now()}`,
            payment_status: event.is_free ? 'paid' : 'pending',
            payment_method: paymentType
          }).select().single()
        );
      }
      return tickets;
    });
    
    const results = await Promise.all(ticketPromises);
    
    toast.success(`${ticketPromises.length} ticket(s) created successfully!`);
    setShowPaymentDialog(false);
    
    // Show first ticket in success view
    if (results[0].data) {
      setClaimedTicket({ ...results[0].data, events: event });
    }
    
  } catch (error: any) {
    console.error('Multi-ticket error:', error);
    toast.error('Failed to create tickets: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

## Testing:
1. Refresh browser
2. Go to public event page
3. Click "Select Multiple Tickets"
4. Add quantities for different tiers
5. See order summary update in real-time
6. Click Continue
7. Complete payment

## Notes:
- Customers can still use single-ticket flow
- Multi-ticket selector is optional (button to activate)
- All tickets share same customer details
- Each ticket gets unique code
- Payment is combined (single transaction)
