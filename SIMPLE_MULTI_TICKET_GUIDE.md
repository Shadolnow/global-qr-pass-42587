# SimpleMultiTicket Integration Guide - STEP BY STEP

## ✅ Component Already Created:
- `src/components/SimpleMultiTicket.tsx` - Ready to use!

## 📝 INTEGRATION STEPS:

### Step 1: Add Import to PublicEvent.tsx
**Location:** Line 30 (after existing imports)
**Add:**
```tsx
import { SimpleMultiTicket } from '@/components/SimpleMultiTicket';
```

### Step 2: Add State Variables
**Location:** After line 64 (after `const [transactionId, setTransactionId] = useState("");`)
**Add:**
```tsx
  // Multi-ticket state
  const [ticketCart, setTicketCart] = useState<any[]>([]);
  const [showMultiTicket, setShowMultiTicket] = useState(false);
  const [tiersData, setTiersData] = useState<any[]>([]);
```

### Step 3: Update Tier Loading in fetchEvent
**Location:** Around line 84-91
**REPLACE:**
```tsx
const { data: tiers } = await supabase
  .from('ticket_tiers')
  .select('id')
  .eq('event_id', eventId)
  .eq('is_active', true)
  .limit(1);

setHasTiers(tiers && tiers.length > 0);
```

**WITH:**
```tsx
const { data: tiersData, error: tiersError } = await supabase
  .from('ticket_tiers')
  .select('*')
  .eq('event_id', eventId)
  .eq('is_active', true)
  .order('sort_order');

if (tiersData && tiersData.length > 0) {
  setHasTiers(true);
  setTiersData(tiersData);
} else {
  setHasTiers(false);
  setTiersData([]);
}
```

### Step 4: Add Multi-Ticket Section
**Location:** Around line 690 (inside the registration form, RIGHT AFTER TierSelector)
**ADD THIS AFTER the TierSelector:**

```tsx
{/* Multi-Ticket Option */}
{hasTiers && tiersData.length > 0 && !showMultiTicket && (
  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/30">
    <p className="text-sm font-semibold mb-2">💡 Buying tickets for a group?</p>
    <Button
      type="button"
      onClick={() => setShowMultiTicket(true)}
      variant="outline"
      className="w-full"
    >
      Select Multiple Tickets
    </Button>
  </div>
)}

{/* Show Multi-Ticket Selector */}
{showMultiTicket && hasTiers && (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Select Tickets</h3>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMultiTicket(false)}
      >
        ← Back to Single
      </Button>
    </div>
    
    <SimpleMultiTicket
      tiers={tiersData.map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        originalPrice: tier.original_price,
        capacity: tier.capacity,
        ticketsSold: tier.tickets_sold
      }))}
      onProceed={(cart) => {
        setTicketCart(cart);
        setShowPaymentDialog(true);
      }}
    />
  </div>
)}
```

### Step 5: Create Multiple Tickets Function
**Location:** After createTicket function (around line 357)
**ADD THIS NEW FUNCTION:**

```tsx
const createMultipleTickets = async (paymentType: 'upi' | 'cash' = 'upi') => {
  if (ticketCart.length === 0) {
    toast.error('No tickets in cart');
    return;
  }

  try {
    setLoading(true);
    const allTickets = [];

    // Create tickets for each item in cart
    for (const item of ticketCart) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        const status = event.is_free ? 'paid' : 'pending';
        const refId = paymentType === 'upi' 
          ? (transactionId || `UPI_${Date.now()}_${i}`) 
          : `CASH_${Date.now()}_${i}`;

        const { data, error } = await supabase
          .from('tickets')
          .insert({
            event_id: eventId,
            attendee_name: formData.name,
            attendee_phone: formData.phone,
            attendee_email: formData.email.toLowerCase(),
            ticket_code: ticketCode,
            tier_id: item.tierId,
            payment_ref_id: refId,
            payment_status: status,
            payment_method: paymentType
          })
          .select()
          .single();

        if (!error && data) {
          allTickets.push(data);
        }
      }
    }

    if (allTickets.length === 0) {
      throw new Error('Failed to create any tickets');
    }

    toast.success(`🎉 ${allTickets.length} ticket(s) created successfully!`);
    
    // Show first ticket
    setClaimedTicket({ 
      ...allTickets[0], 
      events: event,
      tier_name: ticketCart[0].tierName 
    });
    
    setShowPaymentDialog(false);
    setShowMultiTicket(false);
    setTicketCart([]);

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

### Step 6: Update Payment Buttons
**Location:** Around line 940 (UPI button) and line 965 (Cash button)

**UPDATE UPI Button onClick:**
```tsx
<Button
  onClick={() => {
    if (ticketCart.length > 0) {
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

**UPDATE Cash Button onClick:**
```tsx
<button
  onClick={() => {
    if (ticketCart.length > 0) {
      createMultipleTickets('cash');
    } else {
      createTicket('cash');
    }
  }}
  disabled={loading}
  className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center gap-3 group"
>
  {/* Keep existing button content */}
</button>
```

---

## 🎯 HOW IT WORKS:

1. **User fills name, email, phone**
2. **Clicks "Select Multiple Tickets"** (new button appears)
3. **Sees all tiers with +/- buttons**
4. **Adds quantities** (e.g., 2 VIP, 3 Regular)
5. **Sticky bottom shows total** and "Proceed" button
6. **Clicks Proceed** → Opens payment dialog
7. **Chooses UPI or Cash**
8. **All tickets created** with same customer info
9. **Success! Confetti!** 🎉

---

## ✅ BENEFITS:

- **Simpler** - Only 6 small code additions
- **Cleaner UX** - Inline quantity selectors
- **Mobile-ready** - Works great on phones
- **Smart** - Shows stock, savings, sold out states
- **Fast** - Creates all tickets in one go

---

## 🚀 READY TO TEST:

After making these changes:
1. Refresh browser (`Ctrl+F5`)
2. Go to public event page
3. Fill in your details
4. Click "Select Multiple Tickets"
5. Add quantities
6. Click Proceed!

---

## 📝 NOTES:

- Single ticket flow still works normally
- Multi-ticket is optional (button activates it)
- All tickets share same customer info
- Each ticket gets unique code
- Max 10 tickets per tier (prevents abuse)
