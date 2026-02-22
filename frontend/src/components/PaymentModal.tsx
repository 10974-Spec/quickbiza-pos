import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';
import CashPayment from './CashPayment';
import MpesaPayment from './MpesaPayment';
import CardPayment from './CardPayment';
import { salesAPI } from '@/services/api';
import { toast } from 'sonner';
import { DraggableModal } from './DraggableModal';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    saleId: number;
    total: number;
    onPaymentComplete: () => void;
}

export default function PaymentModal({ open, onClose, saleId, total, onPaymentComplete }: PaymentModalProps) {
    const [activeTab, setActiveTab] = useState('cash');
    const [payments, setPayments] = useState<{ method: string; amount: number; time: Date }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && saleId) {
            fetchPayments();
        } else {
            setPayments([]);
        }
    }, [open, saleId]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const sale = await salesAPI.getById(saleId);
            if (sale.payments) {
                setPayments(sale.payments.map((p: any) => ({
                    method: p.method,
                    amount: p.amount,
                    time: new Date(p.created_at || Date.now())
                })));
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);

    const handlePayment = (amountPaid: number) => {
        const newPayments = [...payments, { method: activeTab, amount: amountPaid, time: new Date() }];
        setPayments(newPayments);

        const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);

        if (total - newTotalPaid <= 1) { // Tolerance for rounding
            setTimeout(() => {
                onPaymentComplete();
                setPayments([]); // Reset
                onClose();
            }, 1000);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={() => {
                if (payments.length > 0 && remaining > 1) {
                    if (window.confirm("Transaction is partially paid. Are you sure you want to close?")) {
                        onClose();
                    }
                } else {
                    onClose();
                }
            }}
            title="Complete Payment"
            width="500px"
        >
            <div className="p-4">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold">KES {total.toLocaleString()}</span>
                    </div>
                    {payments.length > 0 && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid So Far:</span>
                                <span className="font-bold text-success">KES {totalPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg border-t pt-2 mt-1">
                                <span className="font-bold">Remaining:</span>
                                <span className="font-bold text-primary">KES {remaining.toLocaleString()}</span>
                            </div>
                        </>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid grid-cols-3 gap-2 bg-transparent">
                        <TabsTrigger
                            value="cash"
                            className="neo-button data-[state=active]:bg-success data-[state=active]:text-success-foreground"
                        >
                            <Banknote className="w-4 h-4 mr-2" />
                            Cash
                        </TabsTrigger>
                        <TabsTrigger
                            value="mpesa"
                            className="neo-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Smartphone className="w-4 h-4 mr-2" />
                            M-Pesa
                        </TabsTrigger>
                        <TabsTrigger
                            value="card"
                            className="neo-button data-[state=active]:bg-info data-[state=active]:text-info-foreground"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Card
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cash" className="mt-4">
                        <CashPayment
                            saleId={saleId}
                            total={remaining}
                            allowPartial={true}
                            onComplete={handlePayment}
                        />
                    </TabsContent>

                    <TabsContent value="mpesa" className="mt-4">
                        <MpesaPayment
                            saleId={saleId}
                            total={remaining}
                            allowPartial={true}
                            onComplete={handlePayment}
                        />
                    </TabsContent>

                    <TabsContent value="card" className="mt-4">
                        <CardPayment
                            saleId={saleId}
                            total={remaining}
                            onComplete={() => handlePayment(remaining)}
                        />
                    </TabsContent>
                </Tabs>

                {payments.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Payment History</h4>
                        {payments.map((p, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="capitalize flex items-center gap-2">
                                    {p.method === 'cash' && <Banknote className="w-3 h-3" />}
                                    {p.method === 'mpesa' && <Smartphone className="w-3 h-3" />}
                                    {p.method === 'card' && <CreditCard className="w-3 h-3" />}
                                    {p.method}
                                </span>
                                <span>KES {p.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DraggableModal>
    );
}
