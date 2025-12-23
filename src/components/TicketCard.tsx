import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, Download, Share2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { LocationQR } from './LocationQR';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface TicketCardProps {
  ticket: {
    id: string;
    ticket_code: string;
    attendee_name: string;
    attendee_email: string;
    attendee_phone?: string;
    is_validated: boolean;
    tier_id?: string;
    tier_name?: string;
    ticket_tiers?: {
      name: string;
      price: number;
    };
    events: {
      title: string;
      venue: string;
      event_date: string;
      promotion_text?: string;
    };
  };
  compact?: boolean;
  showActions?: boolean;
}

export const TicketCard = ({ ticket, compact = false, showActions = true }: TicketCardProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null,
        scale: 3,
      });
      const link = document.createElement("a");
      link.download = `EventTix-${ticket.ticket_code}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("Ticket downloaded!");
    } catch (error) {
      toast.error("Failed to download ticket");
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null,
        scale: 3,
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `EventTix-${ticket.ticket_code}.png`, { type: "image/png" });
          await navigator.share({
            title: `${ticket.events.title} Ticket`,
            text: `My ticket for ${ticket.events.title}!`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `${ticket.events.title} Ticket`,
            text: `Check out my ticket for ${ticket.events.title}! Code: ${ticket.ticket_code}`,
          });
        } else {
          await navigator.clipboard.writeText(`Ticket for ${ticket.events.title}\nCode: ${ticket.ticket_code}`);
          toast.info("Ticket info copied to clipboard!");
        }
      });
    } catch (error) {
      toast.error("Failed to share ticket");
      console.error(error);
    }
  };

  const tierName = ticket.tier_name || ticket.ticket_tiers?.name || 'GENERAL ADMISSION';

  return (
    <div className="space-y-4">
      <Card ref={ticketRef} className="relative overflow-hidden border-0 shadow-2xl">
        {/* Main Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />

        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
        }} />

        <div className="relative">
          {/* Header Section */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Tier Badge - Top Right */}
            <div className="absolute top-6 right-6">
              <Badge className="px-4 py-1.5 text-xs font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/50">
                <Ticket className="w-3 h-3 mr-1" />
                {tierName}
              </Badge>
            </div>

            {/* Event Title */}
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 mb-1 pr-32">
              {ticket.events.title}
            </h2>

            {/* Attendee Name */}
            <p className="text-lg font-semibold text-cyan-100">{ticket.attendee_name}</p>

            {/* Validation Status */}
            {ticket.is_validated && (
              <div className="absolute top-6 left-6">
                <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/50 text-green-300 text-xs font-bold backdrop-blur-sm">
                  ✓ VALIDATED
                </div>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="px-6 pb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-medium">{format(new Date(ticket.events.event_date), 'PPP p')}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{ticket.events.venue}</span>
            </div>
          </div>

          {/* Divider with Glow */}
          <div className="relative px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm" />
          </div>

          {/* QR Codes Section */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Ticket QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50" />

                  {/* QR Container */}
                  <div className="relative p-4 rounded-2xl bg-white shadow-xl">
                    <QRCodeSVG
                      value={ticket.ticket_code}
                      size={compact ? 100 : 120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Ticket Code */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Ticket Code</p>
                  <p className="text-xs font-bold tracking-widest text-cyan-300 font-mono">
                    {ticket.ticket_code}
                  </p>
                </div>
              </div>

              {/* Venue QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-50" />

                  {/* QR Container */}
                  <div className="relative">
                    <LocationQR
                      address={ticket.events.venue}
                      size={compact ? 100 : 120}
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Location Label */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Venue Location</p>
                  <p className="text-xs font-semibold text-pink-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Get Directions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Gradient */}
          <div className="h-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
        </div>
      </Card>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3 no-print">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
};