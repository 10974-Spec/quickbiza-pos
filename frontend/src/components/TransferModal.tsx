
import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { DraggableModal } from "./DraggableModal";
import { transfersAPI, branchesAPI } from "@/services/api";
import api from "@/services/api";
import { toast } from "sonner";

interface TransferModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TransferModal({ open, onClose, onSuccess }: TransferModalProps) {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [itemType, setItemType] = useState<'product' | 'ingredient'>('product');
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [stock, setStock] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        from_branch_id: "",
        to_branch_id: "",
        item_id: "",
        quantity: "",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchBranches();
            fetchItems(itemType);
        }
    }, [open, itemType]);

    // Reset selection when type changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, item_id: "", quantity: "" }));
        setSelectedItem(null);
        setStock(null);
    }, [itemType]);

    const fetchBranches = async () => {
        try {
            const data = await branchesAPI.getAll();
            setBranches(data.filter((b: any) => b.status === 'active'));
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

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
        setStock(item ? item.quantity : 0);
        setFormData(prev => ({ ...prev, item_id: itemId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.from_branch_id || !formData.to_branch_id || !formData.item_id || !formData.quantity) {
            toast.error("All fields are required");
            return;
        }

        if (formData.from_branch_id === formData.to_branch_id) {
            toast.error("Cannot transfer to the same branch");
            return;
        }

        const qty = parseInt(formData.quantity);
        if (stock !== null && qty > stock) {
            toast.error(`Cannot transfer more than available stock (${stock})`);
            return;
        }

        try {
            setLoading(true);

            // Construct readable items string for backward compatibility
            const itemName = itemType === 'product' ? selectedItem.name : selectedItem.name;
            const itemsString = `${qty}x ${itemName}`;

            await transfersAPI.create({
                from_branch_id: parseInt(formData.from_branch_id),
                to_branch_id: parseInt(formData.to_branch_id),
                items: itemsString,
                quantity: qty,
                type: itemType,
                item_id: parseInt(formData.item_id),
                notes: formData.notes || undefined,
            });

            toast.success("Transfer request created successfully!");
            setFormData({ from_branch_id: "", to_branch_id: "", item_id: "", quantity: "", notes: "" });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating transfer:", error);
            toast.error(error.response?.data?.error || "Failed to create transfer");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (

        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="New Stock Transfer"
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            From Branch <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={formData.from_branch_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, from_branch_id: e.target.value }))}
                            className="neo-select w-full border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
                            required
                            disabled={loading}
                        >
                            <option value="">Select branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            To Branch <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={formData.to_branch_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, to_branch_id: e.target.value }))}
                            className="neo-select w-full border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
                            required
                            disabled={loading}
                        >
                            <option value="">Select branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-bold mb-1">Item Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="itemType"
                                checked={itemType === 'product'}
                                onChange={() => setItemType('product')}
                                className="accent-primary w-4 h-4"
                            />
                            <span className="font-medium">Finished Product</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="itemType"
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
                        className="neo-select w-full border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
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
                    {stock !== null && (
                        <p className={`text-xs mt-1 font-medium ${stock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Available Stock: {stock}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Quantity</label>
                    <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        min="1"
                        max={stock !== null ? stock : undefined}
                        className="neo-input w-full border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        required
                        disabled={loading}
                    />
                    {stock !== null && parseInt(formData.quantity) > stock && (
                        <div className="flex items-center gap-1 text-destructive text-xs mt-1 font-bold">
                            <AlertCircle className="w-3 h-3" />
                            <span>Exceeds available stock!</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        className="neo-input w-full resize-none border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-black bg-muted/10 -mx-6 px-6 -mb-2 pb-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 font-bold border-2 border-black rounded-lg hover:bg-black/5 transition-colors"
                        style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-2 font-bold border-2 border-black rounded-lg bg-primary text-primary-foreground hover:-translate-y-1 transition-transform"
                        style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                        disabled={loading || (stock !== null && parseInt(formData.quantity) > stock)}
                    >
                        {loading ? "Creating..." : "Create Transfer"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
