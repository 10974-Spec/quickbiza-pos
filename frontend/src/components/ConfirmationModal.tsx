import { DraggableModal } from "./DraggableModal";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
    open,
    onClose,
    title = "Confirm Action",
    message,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger'
}: ConfirmationModalProps) {
    if (!open) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={title}
            width="400px"
        >
            <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' :
                            variant === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                        }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">{title}</h3>
                        <p className="text-muted-foreground text-sm">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="neo-button"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`neo-button text-white ${variant === 'danger' ? 'bg-destructive' :
                                variant === 'warning' ? 'bg-yellow-500' :
                                    'bg-primary'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </DraggableModal>
    );
}
