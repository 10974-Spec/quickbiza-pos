import { useState, useEffect } from "react";
import { DraggableModal } from "./DraggableModal";
import { suppliersAPI } from "@/services/api";
import { toast } from "sonner";

interface SupplierModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: any;
}

export default function SupplierModal({ open, onClose, onSuccess, supplier }: SupplierModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                contact_person: supplier.contact_person || "",
                phone: supplier.phone || "",
                email: supplier.email || "",
                address: supplier.address || "",
            });
        } else {
            setFormData({
                name: "",
                contact_person: "",
                phone: "",
                email: "",
                address: "",
            });
        }
    }, [supplier, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast.error("Name and phone are required");
            return;
        }

        try {
            setLoading(true);

            if (supplier) {
                await suppliersAPI.update(supplier.id, formData);
                toast.success("Supplier updated successfully!");
            } else {
                await suppliersAPI.create(formData);
                toast.success("Supplier created successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving supplier:", error);
            toast.error(error.response?.data?.error || "Failed to save supplier");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={supplier ? "Edit Supplier" : "New Supplier"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Company Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Contact Person</label>
                    <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="neo-input w-full"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Phone <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="neo-input w-full"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Address</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="neo-input w-full resize-none"
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
                        {loading ? "Saving..." : supplier ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
