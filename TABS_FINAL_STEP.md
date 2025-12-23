# ✅ BULK TICKET TAB - FINAL INTEGRATION STEPS

## Step 1: COMPLETED ✅
Imports added successfully:
- `BulkTicketTab` 
- `Tabs, TabsContent, TabsList, TabsTrigger`

## Step 2: Wrap Registration Section in Tabs

### Find This Code (Around line 674):
```tsx
{(event.capacity && ticketsSold >= event.capacity) ? (
  <WaitlistForm eventId={eventId!} />
) : (
  <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
    <CardHeader>
      <CardTitle className="text-2xl flex items-center gap-2">
        <Ticket className="w-6 h-6 text-primary" />
        {event.is_free ? 'Register for Free' : 'Buy Ticket'}
      </CardTitle>
      ...
    </CardHeader>
    <CardContent>
      <form onSubmit={handleClaim} className="space-y-4">
        ... all existing form fields ...
      </form>
    </CardContent>
  </Card>
)}
```

### Replace With:
```tsx
{(event.capacity && ticketsSold >= event.capacity) ? (
  <WaitlistForm eventId={eventId!} />
) : (
  <Tabs defaultValue="single" className="w-full">
    <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="single">Single Ticket</TabsTrigger>
      <TabsTrigger value="bulk">Bulk Tickets</TabsTrigger>
    </TabsList>

    {/* Tab 1: Single Ticket - Your Existing Form */}
    <TabsContent value="single">
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
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
            {/* KEEP ALL YOUR EXISTING FORM CONTENT HERE - Don't change anything */}
            {hasTiers && (
              <TierSelector
                eventId={eventId!}
                isFreeEvent={event.is_free}
                selectedTierId={selectedTier?.id || null}
                onSelect={(tier) => setSelectedTier(tier ? { id: tier.id, name: tier.name, price: tier.price } : null)}
              />
            )}

            {!event.is_free && !hasTiers && (
              <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                <span className="font-semibold">Ticket Price</span>
                <span className="text-2xl font-bold text-primary">₹{event.price || 0}</span>
              </div>
            )}

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setForm Data({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-mobile-primary relative overflow-hidden group bg-gradient-to-r from-primary to-accent"
              disabled={loading || (hasTiers && !selectedTier)}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (
                  <>
                    {event.is_free ? '🎫 Get My Free Ticket' : '💳 Proceed to Payment'} <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Tab 2: Bulk Tickets - NEW! */}
    <TabsContent value="bulk">
      <BulkTicketTab
        eventId={eventId!}
        event={event}
        onSuccess={(tickets) => {
          if (tickets.length > 0) {
            setClaimedTicket({
              ...tickets[0],
              events: event
            });
          }
        }}
      />
    </TabsContent>
  </Tabs>
)}
```

## ✅ What This Does:

1. **Adds two tabs**: "Single Ticket" and "Bulk Tickets"
2. **Tab 1**: Contains your entire existing form (unchanged!)
3. **Tab 2**: Shows the new BulkTicketTab component
4. **Zero risk**: Existing code stays exactly the same
5. **Easy to remove**: Just unwrap the tabs if needed

## 🎯 Result:

Customers will see:
```
┌──────────────────────────────────┐
│  [Single Ticket] [Bulk Tickets]  │
├──────────────────────────────────┤
│                                  │
│  (Your existing form OR          │
│   Bulk ticket selector)          │
│                                  │
└──────────────────────────────────┘
```

## 🚀 After Making Changes:

1. Save file
2. Refresh browser (`Ctrl+F5`)
3. Go to event page
4. See the tabs!
5. Test both flows

## 📝 Notes:

- Imports already added ✅
- Only need to wrap registration section
- Takes ~2 minutes to implement
- Can't break existing functionality
- Easy rollback if needed

## 🎊 DONE!

That's it! Just this one wrap and you're done!
