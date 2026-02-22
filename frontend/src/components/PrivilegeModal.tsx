import { DraggableModal } from "./DraggableModal";
import { PrivilegeSelector } from "./PrivilegeSelector";

interface PrivilegeModalProps {
    open: boolean;
    onClose: () => void;
    selectedPermissions: string[];
    onSave: (permissions: string[]) => void;
}

export default function PrivilegeModal({ open, onClose, selectedPermissions, onSave }: PrivilegeModalProps) {
    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="User Privileges"
            width="600px"
        >
            <PrivilegeSelector
                selectedPermissions={selectedPermissions}
                onChange={onSave}
            />
        </DraggableModal>
    );
}
