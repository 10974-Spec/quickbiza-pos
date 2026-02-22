import { useState, useEffect } from "react";
import { DraggableModal } from "./DraggableModal";
import { branchesAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface BranchModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    branch?: any;
}

export default function BranchModal({ open, onClose, onSuccess, branch }: BranchModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        phone: "",
        status: "active",
    });

    useEffect(() => {
        if (open) {
            if (branch) {
                setFormData({
                    name: branch.name || "",
                    location: branch.location || "",
                    phone: branch.phone || "",
                    status: branch.status || "active",
                });
            } else {
                setFormData({ name: "", location: "", phone: "", status: "active" });
            }
        }
    }, [branch, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.location) {
            toast.error("Name and location are required");
            return;
        }

        try {
            setLoading(true);

            if (branch) {
                await branchesAPI.update(branch.id, formData);
                toast.success("Branch updated successfully!");
            } else {
                await branchesAPI.create(formData);
                toast.success("Branch created successfully!");
            }

            setFormData({ name: "", location: "", phone: "", status: "active" });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving branch:", error);
            toast.error(error.response?.data?.error || "Failed to save branch");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={branch ? "Edit Branch" : "New Branch"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Branch Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Main Branch"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Location <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Westlands, Nairobi"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g., 0712345678"
                        className="neo-input w-full"
                        disabled={loading}
                    />
                </div>

                {branch && (
                    <div>
                        <label className="block text-sm font-semibold mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="neo-input w-full"
                            disabled={loading}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t-2 border-foreground">
                    <button type="button" onClick={onClose} className="neo-button flex-1" disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="neo-button bg-primary text-primary-foreground flex-1"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : branch ? "Update Branch" : "Create Branch"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
