import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/safeClient';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface ReactionBarProps {
    eventId: string;
}

interface ReactionCount {
    type: string;
    count: number;
    userReacted: boolean;
}

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'party', emoji: '🎉', label: 'Party' }
];

export const ReactionBar = ({ eventId }: ReactionBarProps) => {
    const { user } = useAuth();
    const [reactions, setReactions] = useState<ReactionCount[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReactions();
    }, [eventId, user]);

    const fetchReactions = async () => {
        const { data, error } = await supabase
            .from('event_reactions')
            .select('reaction_type, user_id')
            .eq('event_id', eventId);

        if (error) {
            console.error('Error fetching reactions:', error);
            return;
        }

        // Count reactions by type
        const counts: Record<string, ReactionCount> = {};

        REACTIONS.forEach(r => {
            counts[r.type] = {
                type: r.type,
                count: 0,
                userReacted: false
            };
        });

        data?.forEach(reaction => {
            if (counts[reaction.reaction_type]) {
                counts[reaction.reaction_type].count++;
                if (user && reaction.user_id === user.id) {
                    counts[reaction.reaction_type].userReacted = true;
                }
            }
        });

        setReactions(Object.values(counts));
    };

    const toggleReaction = async (reactionType: string) => {
        if (!user) {
            toast.error('Please sign in to react');
            return;
        }

        setLoading(true);

        const reactionData = reactions.find(r => r.type === reactionType);

        if (reactionData?.userReacted) {
            // Remove reaction
            const { error } = await supabase
                .from('event_reactions')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', user.id)
                .eq('reaction_type', reactionType);

            if (error) {
                toast.error('Failed to remove reaction');
                console.error(error);
            } else {
                toast.success('Reaction removed');
            }
        } else {
            // Add reaction
            const { error } = await supabase
                .from('event_reactions')
                .insert({
                    event_id: eventId,
                    user_id: user.id,
                    reaction_type: reactionType
                });

            if (error) {
                toast.error('Failed to add reaction');
                console.error(error);
            } else {
                toast.success('Reaction added!');
            }
        }

        await fetchReactions();
        setLoading(false);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {REACTIONS.map(reaction => {
                const reactionData = reactions.find(r => r.type === reaction.type);
                const isActive = reactionData?.userReacted || false;
                const count = reactionData?.count || 0;

                return (
                    <Button
                        key={reaction.type}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleReaction(reaction.type)}
                        disabled={loading}
                        className={`transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                    >
                        <span className="text-lg mr-1">{reaction.emoji}</span>
                        {count > 0 && <span className="ml-1">{count}</span>}
                    </Button>
                );
            })}
        </div>
    );
};
