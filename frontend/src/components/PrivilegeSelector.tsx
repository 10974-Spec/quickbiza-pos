import React from 'react';
import { NavItem, navItems } from '@/constants/navItems';
import { Check } from 'lucide-react';

interface PrivilegeSelectorProps {
    selectedPermissions: string[];
    onChange: (permissions: string[]) => void;
}

export const PrivilegeSelector: React.FC<PrivilegeSelectorProps> = ({
    selectedPermissions,
    onChange
}) => {
    const togglePermission = (path: string) => {
        if (selectedPermissions.includes(path)) {
            onChange(selectedPermissions.filter(p => p !== path));
        } else {
            onChange([...selectedPermissions, path]);
        }
    };

    const toggleAll = () => {
        if (selectedPermissions.length === navItems.length) {
            onChange([]);
        } else {
            onChange(navItems.map(item => item.path));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
                <span className="text-sm font-bold text-muted-foreground">Available Features</span>
                <button
                    onClick={toggleAll}
                    className="text-xs font-bold text-primary hover:underline"
                >
                    {selectedPermissions.length === navItems.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {navItems.map((item) => {
                    const isSelected = selectedPermissions.includes(item.path);
                    return (
                        <div
                            key={item.path}
                            onClick={() => togglePermission(item.path)}
                            className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                                    ? 'border-black bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'border-transparent hover:bg-muted/50'
                                }
              `}
                        >
                            <div className={`
                w-5 h-5 rounded border-2 border-black flex items-center justify-center transition-colors
                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white'}
              `}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="font-bold text-sm">{item.title}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
