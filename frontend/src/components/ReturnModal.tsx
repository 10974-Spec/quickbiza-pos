import { useState, useEffect } from "react";
import { RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { DraggableModal } from "./DraggableModal";
import api, { returnsAPI } from "@/services/api";

interface ReturnModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReturnModal({ open, onClose, onSuccess }: ReturnModalProps) {
    const [loading, setLoading] = useState(false);
    const [itemType, setItemType] = useState<'product' | 'ingredient'>('product');
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [formData, setFormData] = useState({
        item_id: "",
        quantity: "",
        reason: "",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchItems(itemType);
        }
    }, [open, itemType]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, item_id: "", quantity: "" }));
        setSelectedItem(null);
    }, [itemType]);

    const fetchItems = async (type: 'product' | 'ingredient') => {
        try {
            const endpoint = type === 'product' ? '/inventory/finished' : '/inventory/raw';
            const response = await api.get(endpoint);
            setAvailableItems(response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("Failed to load inventory items");
        }
    };

    const handleItemChange = (itemId: string) => {
        const item = availableItems.find(i =>
            (itemType === 'product' ? i.product_id : i.ingredient_id) === parseInt(itemId)
        );

        setSelectedItem(item);
        setFormData(prev => ({ ...prev, item_id: itemId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.item_id || !formData.quantity || !formData.reason) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            await returnsAPI.create({
                type: itemType,
                item_id: parseInt(formData.item_id),
                quantity: parseFloat(formData.quantity),
                reason: formData.reason,
                notes: formData.notes
            });

            toast.success("Return processed successfully");
            setFormData({ item_id: "", quantity: "", reason: "", notes: "" });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating return:", error);
            toast.error(error.response?.data?.error || "Failed to process return");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="Process Return"
            width="500px"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-3">
                    <label className="block text-sm font-bold mb-1">Item Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="returnItemType"
                                checked={itemType === 'product'}
                                onChange={() => setItemType('product')}
                                className="accent-primary w-4 h-4"
                            />
                            <span className="font-medium">Finished Product</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="returnItemType"
                                checked={itemType === 'ingredient'}
                                onChange={() => setItemType('ingredient')}
                                className="accent-primary w-4 h-4"
                            />
                            <span className="font-medium">Raw Ingredient</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">
                        Select Item <span className="text-destructive">*</span>
                    </label>
                    <select
                        value={formData.item_id}
                        onChange={(e) => handleItemChange(e.target.value)}
                        className="neo-select w-full"
                        required
                        disabled={loading}
                    >
                        <option value="">Select {itemType}...</option>
                        {availableItems.map(item => (
                            <option key={itemType === 'product' ? item.product_id : item.ingredient_id}
                                value={itemType === 'product' ? item.product_id : item.ingredient_id}>
                                {item.name} ({itemType === 'product' ? item.emoji : item.unit})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Quantity Returned</label>
                    <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        min="0.1"
                        step="0.1"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">This quantity will be added back to inventory.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Reason for Return</label>
                    <select
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        className="neo-select w-full"
                        required
                        disabled={loading}
                    >
                        <option value="">Select reason...</option>
                        <option value="Customer Return">Customer Return</option>
                        <option value="Delivery Failure">Delivery Failure</option>
                        <option value="Excess Stock">Excess Stock (from Branch)</option>
                        <option value="Quality Adjustment">Quality Check (Pass)</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        placeholder="Additional details..."
                        className="neo-input w-full resize-none"
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-foreground">
                    <button
                        type="button"
                        onClick={onClose}
                        className="neo-button flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="neo-button bg-primary text-primary-foreground flex-1"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Process Return"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
