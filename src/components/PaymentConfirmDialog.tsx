import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';

interface PaymentConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    ticketId: string;
    contactPhone: string;
}

export const PaymentConfirmDialog = ({ open, onClose, ticketId, contactPhone }: PaymentConfirmDialogProps) => {
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!paymentProof) {
            toast.info('Proof uploaded successfully, or you can submit later');
            onClose();
            return;
        }

        setUploading(true);
        try {
            // Upload to Supabase Storage
            const fileExt = paymentProof.name.split('.').pop();
            const fileName = `payment-proofs/${ticketId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('event-images')
                .upload(fileName, paymentProof);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('event-images')
                .getPublicUrl(fileName);

            // Update ticket with payment proof URL
            const { error: updateError } = await supabase
                .from('tickets')
                .update({
                    payment_ref_id: publicUrl
                })
                .eq('id', ticketId);

            if (updateError) throw updateError;

            toast.success('Payment proof uploaded successfully!');
            onClose();
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error('Failed to upload payment proof');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        🎉 Thank You for Your Payment!
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-3 pt-4">
                        <p className="text-base">
                            Your ticket has been generated and sent to your email.
                        </p>
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                            <p className="font-semibold text-foreground flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                Call to Confirm: <span className="text-primary">{contactPhone}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Or wait a few hours and come back to see your ticket status changed to 'Paid'
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="payment-proof" className="text-base font-semibold">
                            Upload Payment Screenshot (Optional)
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            This helps us verify your payment faster
                        </p>
                        <Input
                            id="payment-proof"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                        {paymentProof && (
                            <p className="text-xs text-primary mt-1">
                                ✓ {paymentProof.name} selected
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onClose()}
                            className="flex-1"
                        >
                            Skip for Now
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="flex-1 bg-gradient-to-r from-primary to-accent"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : paymentProof ? 'Submit Proof' : 'Done'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
