import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { customersAPI, ordersAPI } from "@/services/api";
import { toast } from "sonner";
import { DraggableModal } from "./DraggableModal";

interface NewOrderModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
}

export default function NewOrderModal({ open, onClose, onSuccess }: NewOrderModalProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: "",
        product_name: "",
        quantity: "1",
        unit_price: "",
        total_price: "",
        deposit_paid: "0",
        pickup_date: "",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchCustomers();
        }
    }, [open]);

    // Auto-calculate total price when quantity or unit price changes
    useEffect(() => {
        const quantity = parseFloat(formData.quantity) || 0;
        const unitPrice = parseFloat(formData.unit_price) || 0;
        const calculatedTotal = quantity * unitPrice;

        if (calculatedTotal > 0 && formData.total_price !== calculatedTotal.toString()) {
            setFormData(prev => ({ ...prev, total_price: calculatedTotal.toString() }));
        }
    }, [formData.quantity, formData.unit_price]);

    const fetchCustomers = async () => {
        try {
            const data = await customersAPI.getAll({ limit: 100 });
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to load customers");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.customer_id || !formData.product_name || !formData.quantity ||
            !formData.total_price || !formData.pickup_date) {
            toast.error("Please fill in all required fields");
            return;
        }

        const quantity = parseFloat(formData.quantity);
        const totalPrice = parseFloat(formData.total_price);
        const depositPaid = parseFloat(formData.deposit_paid);

        if (quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        if (totalPrice <= 0) {
            toast.error("Total price must be greater than 0");
            return;
        }

        if (depositPaid < 0 || depositPaid > totalPrice) {
            toast.error("Deposit must be between 0 and total price");
            return;
        }

        const pickupDate = new Date(formData.pickup_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (pickupDate < today) {
            toast.error("Pickup date cannot be in the past");
            return;
        }

        try {
            setLoading(true);

            const orderData = {
                customer_id: parseInt(formData.customer_id),
                product_name: formData.product_name,
                quantity: quantity,
                unit_price: formData.unit_price ? parseFloat(formData.unit_price) : totalPrice / quantity,
                total_price: totalPrice,
                deposit_paid: depositPaid,
                pickup_date: formData.pickup_date,
                notes: formData.notes || undefined,
            };

            await ordersAPI.create(orderData);
            toast.success("Order created successfully!");

            // Reset form
            setFormData({
                customer_id: "",
                product_name: "",
                quantity: "1",
                unit_price: "",
                total_price: "",
                deposit_paid: "0",
                pickup_date: "",
                notes: "",
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error(error.response?.data?.error || "Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="New Custom Order"
            width="600px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Customer <span className="text-destructive">*</span>
                    </label>
                    <select
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Product Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleChange}
                        placeholder="e.g., Custom Birthday Cake"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Quantity <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            className="neo-input w-full"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Unit Price (KES)
                        </label>
                        <input
                            type="number"
                            name="unit_price"
                            value={formData.unit_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                            className="neo-input w-full"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Total Price and Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Total Price (KES) <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="number"
                            name="total_price"
                            value={formData.total_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="neo-input w-full"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Deposit Paid (KES)
                        </label>
                        <input
                            type="number"
                            name="deposit_paid"
                            value={formData.deposit_paid}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="neo-input w-full"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Balance Due (Read-only) */}
                <div className="p-3 bg-muted rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Balance Due:</span>
                        <span className="text-lg font-display font-bold text-warning">
                            KES {(parseFloat(formData.total_price || "0") - parseFloat(formData.deposit_paid || "0")).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Pickup Date */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Pickup Date <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="date"
                        name="pickup_date"
                        value={formData.pickup_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Special instructions, design details, etc."
                        rows={3}
                        className="neo-input w-full resize-none"
                        disabled={loading}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
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
                        {loading ? "Creating..." : "Create Order"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
