import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DraggableModal } from './DraggableModal';
import { categoriesAPI } from '@/services/api';
import { toast } from 'sonner';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await categoriesAPI.create(data);
            toast.success('Category created successfully');
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create category:', error);
            toast.error('Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <DraggableModal
            title="Add New Category"
            isOpen={isOpen}
            onClose={onClose}
            width="400px"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className="neo-input w-full"
                        placeholder="e.g., Beverages"
                    />
                    {errors.name && <span className="text-xs text-destructive">{errors.name.message as string}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        {...register('description')}
                        className="neo-input w-full resize-none"
                        placeholder="Optional description..."
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="neo-button bg-primary text-primary-foreground text-sm"
                    >
                        {isLoading ? 'Creating...' : 'Create Category'}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
};
