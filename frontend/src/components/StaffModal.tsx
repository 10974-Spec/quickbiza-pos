import { useState, useEffect } from "react";
import { DraggableModal } from "./DraggableModal";
import { Shield, Save } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface StaffModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: any; // If editing is added later
}

export default function StaffModal({ open, onClose, onSuccess, user }: StaffModalProps) {
    const { openModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'cashier'
    });
    // We'll manage permissions via a separate global modal, but we need to track them here.
    // However, since the PrivilegeModal is separate, we need a way to pass data back.
    // A common pattern for global modals returning data is passing a callback in props.
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            setNewUser({ username: '', password: '', full_name: '', role: 'cashier' });
            setPermissions([]);
        }
    }, [open]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.full_name) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            await api.post('/users', { ...newUser, permissions });
            toast.success("User created successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error adding user:", error);
            toast.error(error.response?.data?.error || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const openPrivileges = () => {
        openModal('PRIVILEGES', {
            selectedPermissions: permissions,
            onSave: (newPermissions: string[]) => setPermissions(newPermissions)
        });
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="Add New Staff Member"
            width="500px"
        >
            <form onSubmit={handleAddUser} className="space-y-5 p-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">Full Name</label>
                    <input
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                        className="neo-input w-full"
                        placeholder="e.g. John Doe"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Username</label>
                    <input
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="neo-input w-full"
                        placeholder="e.g. johndoe"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Password</label>
                    <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="neo-input w-full"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Role</label>
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="neo-input w-full bg-background text-foreground"
                        disabled={loading}
                    >
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="baker">Baker</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold">Privileges</label>
                    <button
                        type="button"
                        onClick={openPrivileges}
                        className="w-full py-2 bg-background text-foreground font-bold rounded-lg border-2 border-border shadow-sm hover:translate-y-[-1px] transition-transform flex items-center justify-center gap-2 hover:border-primary"
                        disabled={loading}
                    >
                        <Shield className="w-4 h-4" />
                        Edit Privileges ({permissions.length} selected)
                    </button>
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-border">
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
                        <Save className="w-4 h-4" />
                        {loading ? "Creating..." : "Create User"}
                    </button>
                </div>
            </form>
        </DraggableModal>
    );
}
