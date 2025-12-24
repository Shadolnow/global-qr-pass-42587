import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/safeClient';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    attendee_id?: string;
    event_attendees?: {
        display_name: string;
        profile_photo_url?: string;
    };
}

interface EventCommentsProps {
    eventId: string;
}

export const EventComments = ({ eventId }: EventCommentsProps) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();

        // Subscribe to real-time comments
        const subscription = supabase
            .channel('event_comments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'event_comments',
                    filter: `event_id=eq.${eventId}`
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [eventId]);

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('event_comments')
            .select(`
        *,
        event_attendees(display_name, profile_photo_url)
      `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data || []);
        }
        setLoading(false);
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please sign in to comment');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from('event_comments')
            .insert({
                event_id: eventId,
                user_id: user.id,
                content: newComment.trim()
            });

        if (error) {
            toast.error('Failed to post comment');
            console.error(error);
        } else {
            toast.success('Comment posted!');
            setNewComment('');
        }

        setSubmitting(false);
    };

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            {user && (
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmitComment} className="space-y-4">
                            <Textarea
                                placeholder="Share your thoughts about this event..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[100px]"
                                disabled={submitting}
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    <MessageCircle className="w-4 h-4 inline mr-1" />
                                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                </p>
                                <Button type="submit" disabled={submitting || !newComment.trim()}>
                                    <Send className="w-4 h-4 mr-2" />
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-muted-foreground">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                        </CardContent>
                    </Card>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.id}>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {comment.event_attendees?.profile_photo_url ? (
                                            <img
                                                src={comment.event_attendees.profile_photo_url}
                                                alt={comment.event_attendees.display_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="text-sm font-semibold">
                                                    {comment.event_attendees?.display_name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">
                                                {comment.event_attendees?.display_name || 'Anonymous'}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
