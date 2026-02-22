import { useState } from "react";
import { X } from "lucide-react";
import { promotionsAPI } from "@/services/api";
import { toast } from "sonner";
import { DraggableModal } from "./DraggableModal";

interface PromotionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    promotion?: any;
}

export default function PromotionModal({ open, onClose, onSuccess, promotion }: PromotionModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: promotion?.name || "",
        discount_percent: promotion?.discount_percent?.toString() || "",
        start_date: promotion?.start_date || "",
        end_date: promotion?.end_date || "",
        active: promotion?.active !== undefined ? promotion.active : true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.discount_percent || !formData.start_date || !formData.end_date) {
            toast.error("All fields are required");
            return;
        }

        const discount = parseFloat(formData.discount_percent);
        if (discount <= 0 || discount > 100) {
            toast.error("Discount must be between 0 and 100");
            return;
        }

        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            toast.error("End date must be after start date");
            return;
        }

        try {
            setLoading(true);

            const data = {
                name: formData.name,
                type: "percentage",
                value: discount,
                start_date: formData.start_date,
                end_date: formData.end_date,
                status: formData.active ? "active" : "inactive",
            };

            if (promotion) {
                await promotionsAPI.update(promotion.id, data);
                toast.success("Promotion updated successfully!");
            } else {
                await promotionsAPI.create(data);
                toast.success("Promotion created successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving promotion:", error);
            toast.error(error.response?.data?.error || "Failed to save promotion");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (

        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={promotion ? "Edit Promotion" : "New Promotion"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Promotion Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Weekend Special"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Discount (%) <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="number"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: e.target.value }))}
                        min="0"
                        max="100"
                        step="0.01"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Start Date <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            className="neo-input w-full"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            End Date <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            className="neo-input w-full"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="w-4 h-4"
                        disabled={loading}
                    />
                    <label htmlFor="active" className="text-sm font-semibold">
                        Active
                    </label>
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
                        {loading ? "Saving..." : promotion ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
