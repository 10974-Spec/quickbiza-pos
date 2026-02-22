import { useState, useEffect } from "react";
import { DraggableModal } from "./DraggableModal";
import { expensesAPI } from "@/services/api";
import { toast } from "sonner";
import NeoDropdown from "./NeoDropdown";

interface ExpenseModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense?: any;
}

const EXPENSE_CATEGORIES = [
    "utilities",
    "salaries",
    "rent",
    "transport",
    "packaging",
    "maintenance",
    "other"
];

export default function ExpenseModal({ open, onClose, onSuccess, expense }: ExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: expense?.category || "utilities",
        amount: expense?.amount?.toString() || "",
        description: expense?.description || "",
        expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (open && expense) {
            setFormData({
                category: expense.category || "utilities",
                amount: expense.amount?.toString() || "",
                description: expense.description || "",
                expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
            });
        } else if (open) {
            setFormData({
                category: "utilities",
                amount: "",
                description: "",
                expense_date: new Date().toISOString().split('T')[0],
            });
        }
    }, [open, expense]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category || !formData.amount || !formData.description) {
            toast.error("All fields are required");
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        try {
            setLoading(true);

            const data = {
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description,
                date: formData.expense_date,
            };

            if (expense) {
                await expensesAPI.update(expense.id, data);
                toast.success("Expense updated successfully!");
            } else {
                await expensesAPI.create(data);
                toast.success("Expense recorded successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving expense:", error);
            toast.error(error.response?.data?.error || "Failed to save expense");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={expense ? "Edit Expense" : "New Expense"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Category <span className="text-destructive">*</span>
                    </label>
                    <NeoDropdown
                        options={EXPENSE_CATEGORIES.map(cat => ({
                            value: cat,
                            label: cat.charAt(0).toUpperCase() + cat.slice(1)
                        }))}
                        value={formData.category}
                        onChange={(value) => setFormData(prev => ({ ...prev, category: value as string }))}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Amount (KES) <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        min="0"
                        step="0.01"
                        className="neo-input w-full"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="neo-input w-full resize-none"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Date <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                        className="neo-input w-full"
                        required
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
                        {loading ? "Saving..." : expense ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
