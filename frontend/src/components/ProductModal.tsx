import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { productsAPI, categoriesAPI } from "@/services/api";
import { DraggableModal } from "./DraggableModal";
import EmojiPicker, { EmojiClickData, Categories, Theme } from 'emoji-picker-react';

interface Product {
    id: number;
    name: string;
    price: number;
    category_name: string;
    category_id: number;
    emoji: string;
    stock: number;
    barcode?: string;
    description?: string;
}

interface Category {
    id: number;
    name: string;
}

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    product?: Product | null;
    onSuccess: () => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        emoji: "",
        barcode: "",
        description: "",
    });

    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category_id: product.category_id.toString(),
                price: product.price.toString(),
                emoji: product.emoji || "",
                barcode: product.barcode || "",
                description: product.description || "",
            });
        } else {
            setFormData({
                name: "",
                category_id: "", // Will be set after categories load if empty
                price: "",
                emoji: "",
                barcode: "",
                description: "",
            });
        }
    }, [product, open]);

    // Set default category when categories load and no product is selected
    useEffect(() => {
        if (!product && categories.length > 0 && !formData.category_id) {
            setFormData(prev => ({ ...prev, category_id: categories[0].id.toString() }));
        }
    }, [categories, product]);

    const fetchCategories = async () => {
        try {
            const data = await categoriesAPI.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const data = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                price: parseFloat(formData.price),
                emoji: formData.emoji,
                barcode: formData.barcode,
                description: formData.description,
            };

            if (product) {
                await productsAPI.update(product.id, data);
                toast.success("Product updated successfully");
            } else {
                await productsAPI.create(data);
                toast.success("Product created successfully");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving product:", error);
            toast.error(error.response?.data?.error || "Failed to save product");
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={product ? "Edit Product" : "Add New Product"}
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-display font-semibold mb-2">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="neo-input w-full"
                        placeholder="e.g., White Bread"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-display font-semibold mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="neo-input w-full"
                            required
                        >
                            <option value="">Select...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-display font-semibold mb-2">
                            Price (KES) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="neo-input w-full"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <label className="block text-sm font-display font-semibold mb-2">
                            Emoji
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPicker(!showPicker)}
                                className="neo-input w-full text-left flex items-center justify-between"
                            >
                                <span>{formData.emoji || "Select Emoji"}</span>
                                <span className="text-xs">▼</span>
                            </button>
                            {formData.emoji && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, emoji: "" })}
                                    className="neo-button text-xs text-destructive"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {showPicker && (
                            <div className="absolute z-50 mt-1">
                                <div className="fixed inset-0" onClick={() => setShowPicker(false)}></div>
                                <div className="relative z-50 neo-card p-0 overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
                                    <EmojiPicker
                                        onEmojiClick={(emojiData: EmojiClickData) => {
                                            setFormData({ ...formData, emoji: emojiData.emoji });
                                            setShowPicker(false);
                                        }}
                                        width={320}
                                        height={400}
                                        categories={[
                                            { category: Categories.FOOD_DRINK, name: "Bakery & Food" }
                                        ]}
                                        previewConfig={{
                                            showPreview: false
                                        }}
                                        skinTonesDisabled={true}
                                        searchDisabled={false}
                                        theme={Theme.LIGHT}
                                        style={{
                                            border: 'none',
                                            borderRadius: '0',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-display font-semibold mb-2">
                            Barcode
                        </label>
                        <input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="neo-input w-full"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-display font-semibold mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="neo-input w-full resize-none"
                        rows={3}
                        placeholder="Optional product description"
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="neo-button flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="neo-button bg-primary text-primary-foreground flex-1"
                    >
                        {product ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
