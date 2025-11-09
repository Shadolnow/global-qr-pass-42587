import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Ticket, DollarSign, Search, Filter, Users } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'music', label: '🎵 Music' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'conference', label: '💼 Conference' },
  { value: 'workshop', label: '🎓 Workshop' },
  { value: 'festival', label: '🎪 Festival' },
  { value: 'networking', label: '🤝 Networking' },
  { value: 'general', label: '📅 General' },
];

const PublicEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      
      if (data) {
        setEvents(data);
        setFilteredEvents(data);
      }
      setLoading(false);
    };
    
    fetchEvents();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(event => event.is_free);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(event => !event.is_free);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate <= weekFromNow;
      });
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate <= monthFromNow;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, priceFilter, dateFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient-cyber mb-4">Upcoming Events</h1>
          <p className="text-xl text-muted-foreground">Discover and claim your tickets</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by title, venue, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free Only</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</span>
                {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all' || dateFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setPriceFilter('all');
                      setDateFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                {events.length === 0 ? 'No upcoming events at the moment' : 'No events match your filters'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {events.length === 0 ? 'Check back soon!' : 'Try adjusting your search or filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card 
                key={event.id} 
                className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-neon-cyan cursor-pointer"
                onClick={() => navigate(`/e/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                      {event.category && event.category !== 'general' && (
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIES.find(c => c.value === event.category)?.label || event.category}
                        </Badge>
                      )}
                    </div>
                    {event.is_free ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {event.ticket_price} {event.currency}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.event_date), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{event.tickets_issued} / {event.capacity} tickets claimed</span>
                    </div>
                  )}
                  {event.promotion_text && (
                    <div className="bg-primary/10 border border-primary/20 rounded p-2">
                      <p className="text-xs text-primary font-semibold">🎉 {event.promotion_text}</p>
                    </div>
                  )}
                  <Button
                    variant={event.is_free ? "default" : "outline"} 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/e/${event.id}`);
                    }}
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    {event.is_free ? 'Get Free Ticket' : 'Buy Tickets'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEvents;