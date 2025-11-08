import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Ticket } from 'lucide-react';

interface EventStatsProps {
  totalTickets: number;
  validatedTickets: number;
  pendingTickets: number;
  attendees: any[];
}

export const EventStats = ({ totalTickets, validatedTickets, pendingTickets, attendees }: EventStatsProps) => {
  const stats = [
    {
      title: 'Total Tickets',
      value: totalTickets,
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Validated',
      value: validatedTickets,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Pending',
      value: pendingTickets,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Attendees',
      value: attendees.length,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-2 border-border/50 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};