import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/safeClient';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

export const GDPRDataManagement = () => {
    const { user } = useAuth();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleExportData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('export_user_data', {
                target_user_id: user.id
            });

            if (error) throw error;

            // Fetch the exported data
            const { data: exportData, error: fetchError } = await supabase
                .from('user_data_exports')
                .select('export_data')
                .eq('id', data)
                .single();

            if (fetchError) throw fetchError;

            // Download as JSON
            const dataStr = JSON.stringify(exportData.export_data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestDeletion = async () => {
        if (!user?.email) return;

        setLoading(true);
        try {
            const { error } = await supabase.rpc('request_data_deletion', {
                requester_email: user.email
            });

            if (error) throw error;

            toast.success('Deletion request submitted. Your data will be deleted in 30 days.');
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Deletion request error:', error);
            toast.error('Failed to submit deletion request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Data Privacy & GDPR
                </CardTitle>
                <CardDescription>
                    Manage your personal data in compliance with GDPR regulations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Export Data */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Export Your Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Download a complete copy of all your data including events, tickets, and comments.
                    </p>
                    <Button onClick={handleExportData} disabled={loading} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Exporting...' : 'Export Data'}
                    </Button>
                </div>

                {/* Delete Account */}
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <h3 className="font-semibold mb-2 text-destructive">Delete All Data</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        Permanently delete your account and all associated data.
                    </p>
                    <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                        <li>• All your events and tickets will be deleted</li>
                        <li>• Your profile and comments will be removed</li>
                        <li>• Action cannot be undone after 30 days</li>
                        <li>• You'll receive a data export before deletion</li>
                    </ul>
                    <Button
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={loading}
                        variant="destructive"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Request Data Deletion
                    </Button>
                </div>

                {/* Deletion Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will schedule your data for permanent deletion.
                                <br /><br />
                                <strong>What happens next:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Your data will be exported automatically</li>
                                    <li>You have 30 days to cancel this request</li>
                                    <li>After 30 days, all data is permanently deleted</li>
                                    <li>You'll receive email confirmations</li>
                                </ul>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRequestDeletion();
                                }}
                                disabled={loading}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {loading ? 'Processing...' : 'Yes, Delete My Data'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
};
