import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EnquiryFormProps {
  eventId?: string;
  ticketId?: string;
  maxWords?: number; // default 50
}

// A minimal enquiry form that limits words and stores messages in Supabase 'enquiries' table.
export const EnquiryForm = ({ eventId, ticketId, maxWords = 50 }: EnquiryFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    // Enforce word limit in UI
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > maxWords) {
      setMessage(words.slice(0, maxWords).join(' '));
    } else {
      setMessage(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Please sign in', description: 'You need to be logged in to leave a message.' });
      return;
    }
    const words = countWords(message);
    if (words === 0) {
      toast({ variant: 'destructive', title: 'Message required', description: 'Please enter a short message.' });
      return;
    }
    setSubmitting(true);
    try {
      // Try direct insert first. If RLS blocks, show a helpful message.
      const { error } = await supabase.from('enquiries').insert({
        user_id: user.id,
        event_id: eventId ?? null,
        ticket_id: ticketId ?? null,
        message,
      });

      if (error) throw error;

      toast({ title: 'Message sent', description: 'Thank you! We will get back to you soon.' });
      setMessage('');
    } catch (err: any) {
      // Fallback note for projects with strict RLS
      toast({
        variant: 'destructive',
        title: 'Could not submit message',
        description: err?.message || 'Submission blocked. Please contact support or WhatsApp for assistance.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6 space-y-3">
        <p className="font-semibold">For business enquiry, leave a message here</p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <Label htmlFor="enquiry-message">Message (max {maxWords} words)</Label>
            <Textarea
              id="enquiry-message"
              value={message}
              onChange={handleChange}
              placeholder="Type a short message..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {countWords(message)} / {maxWords} words
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnquiryForm;