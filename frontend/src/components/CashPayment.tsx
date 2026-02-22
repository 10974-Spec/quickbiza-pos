import { useState } from 'react';
import { paymentsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CashPaymentProps {
    saleId: number;
    total: number;
    allowPartial?: boolean;
    onComplete: (amountPaid: number) => void;
}

export default function CashPayment({ saleId, total, allowPartial = false, onComplete }: CashPaymentProps) {
    const [amountTendered, setAmountTendered] = useState('');
    const [loading, setLoading] = useState(false);

    const tendered = parseFloat(amountTendered) || 0;
    const change = tendered > total ? tendered - total : 0;
    const amountToPay = tendered > total ? total : tendered;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tendered || tendered <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!allowPartial && tendered < total) {
            toast.error('Amount tendered must be at least the total amount');
            return;
        }

        setLoading(true);

        try {
            await paymentsAPI.cash({
                sale_id: saleId,
                amount: amountToPay,
                amount_tendered: tendered,
            });

            toast.success('Payment recorded successfully!', {
                description: change > 0 ? `Change: KES ${change.toLocaleString()}` : undefined,
            });

            onComplete(amountToPay);
        } catch (error: any) {
            console.error('Cash payment error:', error);
            toast.error('Payment failed', {
                description: error.response?.data?.error || 'Please try again',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-display font-semibold mb-2">
                    Amount Tendered
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="neo-input w-full text-lg"
                    placeholder="Enter amount"
                    disabled={loading}
                    autoFocus
                />
            </div>

            {change > 0 && (
                <div className="p-3 bg-success/10 rounded-lg border-2 border-success">
                    <p className="text-sm font-display font-semibold text-success">
                        Change: KES {change.toLocaleString()}
                    </p>
                </div>
            )}

            {change < 0 && amountTendered && !allowPartial && (
                <div className="p-3 bg-destructive/10 rounded-lg border-2 border-destructive">
                    <p className="text-sm font-display font-semibold text-destructive">
                        Insufficient amount
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !amountTendered || (!allowPartial && change < 0)}
                className="neo-button bg-success text-success-foreground w-full py-3 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Complete Payment'
                )}
            </button>
        </form>
    );
}
