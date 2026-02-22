import { useState, useEffect } from "react";
import { DraggableModal } from "./DraggableModal";
import { customersAPI } from "@/services/api";
import { toast } from "sonner";

interface CustomerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: any; // For editing existing customer
}

export default function CustomerModal({ open, onClose, onSuccess, customer }: CustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        birthday: "",
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || "",
                phone: customer.phone || "",
                email: customer.email || "",
                address: customer.address || "",
                birthday: customer.birthday || "",
            });
        } else {
            setFormData({
                name: "",
                phone: "",
                email: "",
                address: "",
                birthday: "",
            });
        }
    }, [customer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast.error("Name and phone are required");
            return;
        }

        try {
            setLoading(true);

            if (customer) {
                await customersAPI.update(customer.id, formData);
                toast.success("Customer updated successfully!");
            } else {
                await customersAPI.create(formData);
                toast.success("Customer created successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving customer:", error);
            toast.error(error.response?.data?.error || "Failed to save customer");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={customer ? "Edit Customer" : "New Customer"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Phone <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0712345678"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="customer@example.com"
                        className="neo-input w-full"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className="neo-input w-full resize-none"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Birthday</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        className="neo-input w-full"
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
                        {loading ? "Saving..." : customer ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
