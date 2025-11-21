import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Ticket, QrCode, Sparkles, LogOut, ExternalLink, Shield, Terminal, Cpu, Globe } from 'lucide-react';
import heroImage from '@/assets/eventtix-hero.jpg';
import eventtixLogoUrl from '@/assets/eventtix-logo.svg';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AgencyHero } from '@/components/agency/AgencyHero';
import { useNeuralInterface } from '@/hooks/useNeuralInterface';

const Index = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PUBLIC_BASE_URL = (import.meta as any).env?.VITE_PUBLIC_SITE_URL || window.location.origin;
  const qrRef = useRef<SVGSVGElement | null>(null);
  const neural = useNeuralInterface();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/public-events');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold text-white">EventTix</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/events">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">My Events</Button>
            </Link>
            <Link to="/create-event">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Event</Button>
            </Link>
            <Link to="/scan">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                <QrCode className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-gray-300 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </header>

      <AgencyHero />

      {/* Neural Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Terminal,
                title: "Algorithmic Ticketing",
                desc: "Quantum-resistant QR generation protocols ensure absolute security for your events."
              },
              {
                icon: Globe,
                title: "Global Neural Network",
                desc: "Distributed event management across all timezones with real-time synchronization."
              },
              {
                icon: Cpu,
                title: "Smart Analytics",
                desc: "Deep learning insights into your attendee demographics and engagement metrics."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500"
                style={{
                  transform: `translateY(${neural.scroll_pressure * (i + 1) * 20}px)`
                }}
              >
                <feature.icon className="w-12 h-12 mb-6 text-indigo-500 group-hover:text-white transition-colors" />
                <h3 className="text-2xl font-bold mb-4 font-mono">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/10 bg-gradient-to-b from-black to-indigo-950/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            <span className="text-indigo-500">System</span> Capabilities
          </h2>

          {/* Public Events QR Code Card */}
          <Card className="max-w-md mx-auto mb-12 border border-white/10 bg-black/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white">Share Public Events Page</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <QRCodeSVG
                  value={`${PUBLIC_BASE_URL}/public-events`}
                  size={200}
                  level="H"
                  includeMargin
                  className="border-4 border-white/10 rounded-lg p-2 bg-white"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={qrRef as any}
                />
                {/* Centered overlay logo with white rounded backing to preserve QR module contrast */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="rounded-lg bg-white/95 p-1 shadow-sm">
                    <img src={eventtixLogoUrl} alt="EventTix logo" className="h-12 w-12 object-contain" />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400">
                Anyone can scan this QR code to view all your events
              </p>
              <p className="text-center text-sm mt-1">
                <a
                  href={`${PUBLIC_BASE_URL}/public-events`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
                >
                  Click here to go to the event page
                </a>
              </p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    const url = `${PUBLIC_BASE_URL}/public-events`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    const url = `${PUBLIC_BASE_URL}/public-events`;
                    window.open(url, '_blank', 'noopener');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Page
                </Button>
              </div>
              {/* Download controls: SVG, PNG, PDF */}
              <div className="flex gap-2 w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    const svgEl = qrRef.current;
                    if (!svgEl) return;
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(svgEl);
                    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'eventtix-public-events-qr.svg';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  SVG
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={async () => {
                    const svgEl = qrRef.current;
                    if (!svgEl) return;
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(svgEl);
                    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      // Add 10% quiet zone around exported PNG
                      const qSize = 220; // approximate drawing size
                      const quiet = Math.round(qSize * 0.10);
                      canvas.width = qSize + quiet * 2;
                      canvas.height = qSize + quiet * 2;
                      const ctx = canvas.getContext('2d')!;
                      ctx.fillStyle = '#ffffff';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, quiet, quiet, qSize, qSize);
                      const pngUrl = canvas.toDataURL('image/png');
                      const a = document.createElement('a');
                      a.href = pngUrl;
                      a.download = 'eventtix-public-events-qr.png';
                      a.click();
                      URL.revokeObjectURL(url);
                    };
                    img.onerror = () => URL.revokeObjectURL(url);
                    img.src = url;
                  }}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={async () => {
                    try {
                      const { jsPDF } = await import('jspdf');
                      const svgEl = qrRef.current;
                      if (!svgEl) return;
                      const serializer = new XMLSerializer();
                      const svgString = serializer.serializeToString(svgEl);
                      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                      const url = URL.createObjectURL(svgBlob);
                      const img = new Image();
                      img.onload = () => {
                        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
                        const pageW = pdf.internal.pageSize.getWidth();
                        const qSize = 300; // printed size in points
                        const quiet = Math.round(qSize * 0.10);
                        const x = (pageW - (qSize + quiet * 2)) / 2;
                        // Draw white background (quiet zone)
                        pdf.setFillColor(255, 255, 255);
                        pdf.rect(x, 72, qSize + quiet * 2, qSize + quiet * 2, 'F');
                        pdf.addImage(img, 'PNG', x + quiet, 72 + quiet, qSize, qSize);
                        pdf.text('EventTix – Public Events QR', x, 72 + qSize + quiet * 2 + 24);
                        pdf.save('eventtix-public-events-qr.pdf');
                        URL.revokeObjectURL(url);
                      };
                      img.onerror = () => URL.revokeObjectURL(url);
                      img.src = url;
                    } catch (e) {
                      toast.error('PDF export requires jspdf. Please run: npm install jspdf');
                    }
                  }}
                >
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Ticket className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Custom Tickets</h3>
              <p className="text-gray-400">
                Design beautiful digital tickets with your event details, dates, and promotions.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <QrCode className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">QR Validation</h3>
              <p className="text-gray-400">
                Secure QR codes that can be validated instantly at your event entrance.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Sparkles className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Global Ready</h3>
              <p className="text-gray-400">
                Create events for any location worldwide with full customization options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 font-mono text-xs text-gray-600 text-center">
        <p>SYSTEM_VERSION: 2.0.4 // SECURE_CONNECTION_ESTABLISHED</p>
        <p className="mt-2">© {new Date().getFullYear()} EVENT_TIX_PROTOCOLS</p>
      </footer>
    </div>
  );
};

export default Index;