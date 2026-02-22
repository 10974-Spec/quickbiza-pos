import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { devicesAPI } from "@/services/api";
import { DraggableModal } from "./DraggableModal";

interface DeviceEditModalProps {
    open: boolean;
    onClose: () => void;
    device: any;
    onSuccess: () => void;
}

export default function DeviceEditModal({ open, onClose, device, onSuccess }: DeviceEditModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (device) {
            setName(device.device_name || "");
        }
    }, [device, open]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            await devicesAPI.update(device.id, { device_name: name });
            toast.success("Device updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating device:", error);
            toast.error("Failed to update device");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="Edit Device"
            width="400px"
        >
            <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">Device Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="neo-input w-full"
                        placeholder="Enter device name"
                        autoFocus
                        disabled={loading}
                    />
                </div>
                <div className="flex gap-3">
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
                        className="neo-button bg-primary text-primary-foreground flex-1 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <Check className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
