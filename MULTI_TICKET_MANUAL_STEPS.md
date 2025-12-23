# Multi-Ticket Integration - Code Snippets to Add

## ✅ COMPLETED:
1. Icons imported (Music, Tv, Disc3) - Line 10
2. MultiTicketSelector imported - Line 30

## 📝 TO ADD MANUALLY:

### Step 1: Add State Variables
**Location:** After line 64 (after `const [transactionId, setTransactionId] = useState("");`)
**Add these lines:**

```tsx
  // Multi-Ticket States
  const [ticketSelections, setTicketSelections] = useState<any[]>([]);
  const [showMultiTicketSelector, setShowMultiTicketSelector] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);
```

### Step 2: Update Tier Loading
**Location:** Around line 84-91 (in the fetchEvent function)
**Replace:**
```tsx
const { data: tiers } = await supabase
  .from('ticket_tiers')
  .select('id')
  .eq('event_id', eventId)
  .eq('is_active', true)
  .limit(1);

setHasTiers(tiers && tiers.length > 0);
```

**With:**
```tsx
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

### Step 3: Add Multi-Ticket Button
**Location:** Around line 690 (inside the form, after TierSelector)
**Add after the existing TierSelector:**

```tsx
{hasTiers && !showMultiTicketSelector && (
  <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-primary/30">
    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
      <Users className="w-4 h-4" />
      Buying for a group?
    </p>
    <Button
      type="button"
      onClick={() => setShowMultiTicketSelector(true)}
      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
    >
      🎫 Select Multiple Tickets
    </Button>
  </div>
)}
```

### Step 4: Add Multi-Ticket Selector Component
**Location:** Around line 674 (in the registration section, BEFORE the existing Card)
**Add this BEFORE the existing registration Card:**

```tsx
{showMultiTicketSelector && hasTiers ? (
  <Card className="border-2 border-primary/20 shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl">Select Your Tickets</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMultiTicketSelector(false)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Single Ticket
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <MultiTicketSelector
        tiers={tiers.map(tier => ({
          id: tier.id,
          name: tier.name,
          icon: tier.name.toUpperCase().includes('VIP') ? Music : 
                tier.name.toUpperCase().includes('BAR') ? Tv : 
                tier.name.toUpperCase().includes('DJ') ? Disc3 : Users,
          description: tier.description ? tier.description.split(',').map((d: string) => d.trim()) : [],
          couplePrice: tier.price || 0,
          stagPrice: tier.stag_price || null,
          originalCouplePrice: tier.original_price || tier.price,
          originalStagPrice: tier.original_stag_price || tier.stag_price,
          maxCapacity: tier.capacity,
          color: tier.name.toUpperCase().includes('VIP') ? 'border-cyan-500' : 
                 tier.name.toUpperCase().includes('BAR') ? 'border-pink-500' : 'border-purple-500'
        }))}
        onContinue={(selections) => {
          setTicketSelections(selections);
          // Store form data first
          if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill in your details first');
            setShowMultiTicketSelector(false);
            return;
          }
          setShowPaymentDialog(true);
        }}
      />
    </CardContent>
  </Card>
) : (
  // Your existing Card component stays here...
  <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
    {/* Keep all existing content */}
  </Card>
)}
```

### Step 5: Create Multiple Tickets Function
**Location:** After the `createTicket` function (around line 357)
**Add this new function:**

```tsx
const createMultipleTickets = async (paymentType: 'upi' | 'cash' = 'upi') => {
  try {
    setLoading(true);
    
    const ticketPromises = ticketSelections.flatMap(selection => {
      const tickets = [];
      for (let i = 0; i < selection.quantity; i++) {
        const ticketCode = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        const status = event.is_free ? 'paid' : 'pending';
        const refId = paymentType === 'upi' ? `UPI_${Date.now()}_${i}` : `CASH_${Date.now()}_${i}`;
        
        tickets.push(
          supabase.from('tickets').insert({
            event_id: eventId,
            attendee_name: formData.name,
            attendee_phone: formData.phone,
            attendee_email: formData.email.toLowerCase(),
            ticket_code: ticketCode,
            tier_id: selection.tierId,
            payment_ref_id: transactionId || refId,
            payment_status: status,
            payment_method: paymentType
          }).select().single()
        );
      }
      return tickets;
    });
    
    const results = await Promise.all(ticketPromises);
    const successfulTickets = results.filter(r => r.data && !r.error);
    
    if (successfulTickets.length === 0) {
      throw new Error('Failed to create any tickets');
    }
    
    toast.success(`🎉 ${successfulTickets.length} ticket(s) created successfully!`);
    setShowPaymentDialog(false);
    setShowMultiTicketSelector(false);
    
    // Show first ticket in success view
    if (successfulTickets[0].data) {
      setClaimedTicket({ 
        ...successfulTickets[0].data, 
        events: event,
        tier_name: ticketSelections[0].tierName 
      });
    }
    
    // Confetti!
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 }
    });
    
  } catch (error: any) {
    console.error('Multi-ticket error:', error);
    toast.error('Failed to create tickets: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 6: Update Payment Dialog Button
**Location:** Around line 907 (the UPI payment button in the dialog)
**Modify the onClick:**

```tsx
<Button
  onClick={() => {
    if (ticketSelections.length > 0) {
      createMultipleTickets('upi');
    } else {
      createTicket('upi');
    }
  }}
  disabled={loading}
  className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 min-h-[48px]"
>
  {loading ? 'Processing...' : '✅ I\'ve Paid'}
</Button>
```

### Step 7: Update Cash Payment Button
**Location:** Around  line 924 (cash payment button)
**Modify the onClick:**

```tsx
<button
  onClick={() => {
    if (ticketSelections.length > 0) {
      createMultipleTickets('cash');
    } else {
      createTicket('cash');
    }
  }}
  disabled={loading}
  className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center gap-3 group"
>
  {/* Keep existing content */}
</button>
```

## 🎯 Testing Steps:
1. Go to event page
2. Fill in your details (name, email, phone)
3. Click "Select Multiple Tickets" button
4. Add quantities for different tiers
5. Click "Continue"
6. Complete payment
7. Multiple tickets created! 🎉

## 📝 Notes:
- The multi-selector only shows when you click the button
- Single ticket flow still works normally
- All tickets share the same customer info
- Each ticket gets a unique code
