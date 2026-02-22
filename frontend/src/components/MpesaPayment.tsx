import { useState } from 'react';
import { paymentsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface MpesaPaymentProps {
    saleId: number;
    total: number;
    allowPartial?: boolean;
    onComplete: (amountPaid: number) => void;
}

export default function MpesaPayment({ saleId, total, allowPartial = false, onComplete }: MpesaPaymentProps) {
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState(total.toString());
    const [loading, setLoading] = useState(false);
    const [paymentId, setPaymentId] = useState<number | null>(null);

    const formatPhoneNumber = (value: string) => {
        // Remove non-digits
        let cleaned = value.replace(/\D/g, '');

        // If starts with 0, replace with 254
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }

        // If doesn't start with 254, add it
        if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }

        return cleaned;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            toast.error('Please enter phone number');
            return;
        }

        const payAmount = parseFloat(amount);
        if (!payAmount || payAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!allowPartial && payAmount < total) {
            toast.error('Amount must be at least the total amount');
            return;
        }

        const formattedPhone = formatPhoneNumber(phone);

        if (formattedPhone.length !== 12) {
            toast.error('Invalid phone number format');
            return;
        }

        setLoading(true);

        try {
            const response = await paymentsAPI.mpesa({
                sale_id: saleId,
                phone: formattedPhone,
                amount: payAmount,
            });

            setPaymentId(response.payment_id);

            toast.success('STK Push sent!', {
                description: 'Please check your phone and enter M-Pesa PIN',
            });

            // Poll for payment status
            const checkInterval = setInterval(async () => {
                try {
                    const status = await paymentsAPI.checkStatus(response.payment_id);

                    if (status.status === 'completed') {
                        clearInterval(checkInterval);
                        toast.success('Payment completed successfully!', {
                            description: `Receipt: ${status.mpesa_receipt}`,
                        });
                        onComplete(payAmount);
                    } else if (status.status === 'failed') {
                        clearInterval(checkInterval);
                        toast.error('Payment failed', {
                            description: 'Please try again',
                        });
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error);
                }
            }, 3000); // Check every 3 seconds

            // Stop checking after 2 minutes
            setTimeout(() => {
                clearInterval(checkInterval);
                if (loading) {
                    toast.warning('Payment timeout', {
                        description: 'Please verify payment manually',
                    });
                    setLoading(false);
                }
            }, 120000);

        } catch (error: any) {
            console.error('M-Pesa payment error:', error);
            toast.error('Failed to initiate payment', {
                description: error.response?.data?.error || 'Please try again',
            });
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-display font-semibold mb-2">
                    M-Pesa Phone Number
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="neo-input w-full text-lg"
                    placeholder="0712345678 or 254712345678"
                    disabled={loading}
                    autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Enter phone number registered with M-Pesa
                </p>
            </div>

            <div>
                <label className="block text-sm font-display font-semibold mb-2">
                    Amount
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="neo-input w-full text-lg"
                    placeholder="Amount to pay"
                    disabled={loading}
                />
            </div>

            {loading && (
                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm font-display font-semibold text-primary">
                        Waiting for payment confirmation...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Check your phone and enter M-Pesa PIN
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !phone}
                className="neo-button bg-primary text-primary-foreground w-full py-3 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        Send STK Push
                    </>
                )}
            </button>
        </form>
    );
}
