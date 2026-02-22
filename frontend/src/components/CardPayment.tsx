import { useState } from 'react';
import { paymentsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CardPaymentProps {
    saleId: number;
    total: number;
    onComplete: () => void;
}

export default function CardPayment({ saleId, total, onComplete }: CardPaymentProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            await paymentsAPI.card({
                sale_id: saleId,
                amount: total,
            });

            toast.success('Card payment completed successfully!');
            onComplete();
        } catch (error: any) {
            console.error('Card payment error:', error);
            toast.error('Payment failed', {
                description: error.response?.data?.error || 'Please try again',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-foreground/10">
                <p className="text-sm mb-2">
                    <span className="font-semibold">Amount:</span> KES {total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                    Process the card payment using your card terminal, then confirm below.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="neo-button bg-info text-info-foreground w-full py-3 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Confirm Card Payment'
                )}
            </button>
        </form>
    );
}
