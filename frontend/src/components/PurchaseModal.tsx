import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DraggableModal } from "./DraggableModal";
import { purchasesAPI, suppliersAPI, inventoryAPI } from "@/services/api";
import { toast } from "sonner";

interface PurchaseModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface PurchaseItem {
    ingredient_id: number;
    quantity: number;
    unit_cost: number;
    subtotal: number;
}

export default function PurchaseModal({ open, onClose, onSuccess }: PurchaseModalProps) {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [notes, setNotes] = useState("");
    const [initialPayment, setInitialPayment] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");

    // Calculated total
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    useEffect(() => {
        if (open) {
            fetchData();
            // Reset form
            setSupplierId("");
            setItems([]);
            setNotes("");
            setInitialPayment("");
            setPaymentMethod("cash");
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const [suppliersData, ingredientsData] = await Promise.all([
                suppliersAPI.getAll(),
                inventoryAPI.getRaw()
            ]);
            setSuppliers(suppliersData);
            setIngredients(ingredientsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load form data");
        }
    };

    const handleAddItem = () => {
        setItems([...items, { ingredient_id: 0, quantity: 1, unit_cost: 0, subtotal: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Recalculate subtotal
        if (field === 'quantity' || field === 'unit_cost') {
            item.subtotal = item.quantity * item.unit_cost;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supplierId) {
            toast.error("Please select a supplier");
            return;
        }

        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        const validItems = items.filter(i => i.ingredient_id > 0 && i.quantity > 0 && i.unit_cost >= 0);
        if (validItems.length !== items.length) {
            toast.error("Please ensure all items have valid ingredients and quantities");
            return;
        }

        try {
            setLoading(true);

            await purchasesAPI.create({
                supplier_id: parseInt(supplierId),
                items: validItems,
                total_amount: totalAmount,
                notes: notes || undefined,
                amount_paid: initialPayment ? parseFloat(initialPayment) : 0,
                payment_method: paymentMethod
            });

            toast.success("Purchase order created successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating purchase:", error);
            toast.error(error.response?.data?.error || "Failed to create purchase");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="New Purchase Order"
            width="800px" // increased width for better layout
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Supplier <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="neo-input w-full"
                            required
                            disabled={loading}
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Total Amount</label>
                        <div className="neo-input w-full bg-muted font-mono font-bold">
                            KES {totalAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Initial Payment (Optional)</label>
                        <input
                            type="number"
                            value={initialPayment}
                            onChange={(e) => setInitialPayment(e.target.value)}
                            min="0"
                            max={totalAmount}
                            step="0.01"
                            className="neo-input w-full"
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="neo-input w-full"
                            disabled={loading || !initialPayment || parseFloat(initialPayment) <= 0}
                        >
                            <option value="cash">Cash</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold">
                            Purchase Items <span className="text-destructive">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.length === 0 && (
                            <div className="text-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground text-sm">
                                No items added. Click "Add Item" to start.
                            </div>
                        )}

                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 bg-muted/20 rounded-lg border border-border/50">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-xs mb-1 block opacity-70">Ingredient</label>
                                    <select
                                        value={item.ingredient_id}
                                        onChange={(e) => handleItemChange(index, 'ingredient_id', parseInt(e.target.value))}
                                        className="neo-input w-full text-sm py-1"
                                        required
                                    >
                                        <option value={0}>Select...</option>
                                        {ingredients.map(ing => (
                                            <option key={ing.ingredient_id} value={ing.ingredient_id}>
                                                {ing.name} ({ing.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-24">
                                    <label className="text-xs mb-1 block opacity-70">Qty</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        className="neo-input w-full text-sm py-1"
                                        min="0.1"
                                        step="0.1"
                                        required
                                    />
                                </div>

                                <div className="w-28">
                                    <label className="text-xs mb-1 block opacity-70">Unit Cost</label>
                                    <input
                                        type="number"
                                        value={item.unit_cost}
                                        onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                        className="neo-input w-full text-sm py-1"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="w-28">
                                    <label className="text-xs mb-1 block opacity-70">Subtotal</label>
                                    <div className="neo-input w-full text-sm py-1 bg-muted text-right font-mono">
                                        {item.subtotal.toFixed(2)}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                                        title="Remove item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="neo-input w-full resize-none"
                        placeholder="Optional notes about this purchase..."
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-foreground">
                    <button type="button" onClick={onClose} className="neo-button flex-1" disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="neo-button bg-primary text-primary-foreground flex-1"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Order"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
