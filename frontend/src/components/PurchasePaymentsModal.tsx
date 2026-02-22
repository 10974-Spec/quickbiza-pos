import { useState, useEffect } from "react";
import { Check, Plus as PlusIcon } from "lucide-react";
import { DraggableModal } from "./DraggableModal";
import { purchasesAPI } from "@/services/api";
import { toast } from "sonner";

interface Payment {
    id: number;
    amount: number;
    method: string;
    notes: string;
    reference: string;
    paid_at: string;
    recorded_by_name: string;
}

interface PurchasePaymentsModalProps {
    open: boolean;
    onClose: () => void;
    purchaseId: number;
    totalAmount: number;
    amountPaid: number;
    onSuccess: () => void;
}

export default function PurchasePaymentsModal({
    open,
    onClose,
    purchaseId,
    totalAmount,
    amountPaid: initialAmountPaid,
    onSuccess
}: PurchasePaymentsModalProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [amountPaid, setAmountPaid] = useState(initialAmountPaid);

    // New Payment Form
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("cash");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const balanceDue = totalAmount - amountPaid;

    useEffect(() => {
        if (open && purchaseId) {
            fetchPayments();
            setAmountPaid(initialAmountPaid);
        }
    }, [open, purchaseId, initialAmountPaid]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await purchasesAPI.getPayments(purchaseId);
            setPayments(data);
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (parseFloat(amount) > balanceDue) {
            toast.error(`Amount cannot exceed the balance due (KES ${balanceDue})`);
            return;
        }

        try {
            setSubmitting(true);
            await purchasesAPI.addPayment(purchaseId, {
                amount: parseFloat(amount),
                method,
                reference,
                notes
            });

            toast.success("Payment added successfully");
            setAmount("");
            setReference("");
            setNotes("");
            fetchPayments();
            // Update local state to reflect new balance
            setAmountPaid(prev => prev + parseFloat(amount));
            onSuccess();
        } catch (error: any) {
            console.error("Error adding payment:", error);
            toast.error(error.response?.data?.error || "Failed to add payment");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="Payment History"
            width="672px" // max-w-2xl equivalent
        >
            <div className="flex flex-col h-full bg-white">
                <div className="p-4 border-b border-border bg-background">
                    <div className="text-sm text-muted-foreground">
                        Purchase #{purchaseId} • Total: <span className="font-mono font-bold text-foreground">KES {totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-4 bg-muted/20 border-b border-border/50">
                    <div className="text-center p-2 bg-background rounded border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase font-bold">Total</div>
                        <div className="font-mono font-bold">KES {totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase font-bold">Paid</div>
                        <div className="font-mono font-bold text-green-600">KES {amountPaid.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase font-bold">Balance</div>
                        <div className="font-mono font-bold text-destructive">KES {balanceDue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Add Payment Form */}
                    {balanceDue > 0 && (
                        <div className="neo-card p-4 border-dashed bg-muted/10">
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <PlusIcon className="w-4 h-4" /> Record New Payment
                            </h3>
                            <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold block mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="neo-input w-full text-sm"
                                        placeholder={`Max: ${balanceDue}`}
                                        max={balanceDue}
                                        min="0.1"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1">Method</label>
                                    <select
                                        value={method}
                                        onChange={e => setMethod(e.target.value)}
                                        className="neo-input w-full text-sm"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1">Reference (Optional)</label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={e => setReference(e.target.value)}
                                        className="neo-input w-full text-sm"
                                        placeholder="e.g. Transaction ID"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1">Notes (Optional)</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="neo-input w-full text-sm"
                                        placeholder="Additional details"
                                    />
                                </div>
                                <div className="md:col-span-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="neo-button w-full bg-primary text-primary-foreground text-sm py-2"
                                    >
                                        {submitting ? "Recording..." : "Record Payment"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {balanceDue <= 0 && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-800 flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            <span className="font-bold">Fully Paid</span>
                        </div>
                    )}

                    {/* Payment List */}
                    <div>
                        <h3 className="font-bold text-sm mb-3">Payment History</h3>
                        {loading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading...</div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm italic">
                                No payments recorded yet.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {payments.map(payment => (
                                    <div key={payment.id} className="flex justify-between items-center p-3 bg-background rounded border border-border/50 text-sm">
                                        <div>
                                            <div className="font-bold">KES {payment.amount.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(payment.paid_at).toLocaleString()} via {payment.method}
                                            </div>
                                            {payment.reference && (
                                                <div className="text-xs text-primary mt-0.5">Ref: {payment.reference}</div>
                                            )}
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            Recorded by<br />{payment.recorded_by_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DraggableModal>
    );
}
