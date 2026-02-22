import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface NeoDropdownProps {
    options: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function NeoDropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    searchable = false,
    disabled = false,
    className = "",
}: NeoDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            setSearchQuery("");
        } else if (e.key === "Enter" && !isOpen) {
            setIsOpen(true);
        } else if (e.key === "ArrowDown" && isOpen) {
            e.preventDefault();
            // Focus next option
        } else if (e.key === "ArrowUp" && isOpen) {
            e.preventDefault();
            // Focus previous option
        }
    };

    return (
        <div
            ref={dropdownRef}
            className={`relative ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          neo-input w-full flex items-center justify-between cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isOpen ? "ring-2 ring-primary" : ""}
        `}
            >
                <span className={selectedOption ? "" : "text-muted-foreground"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="
            absolute z-50 w-full mt-2 
            neo-card p-0 overflow-hidden
            animate-fade-in
            max-h-64 overflow-y-auto
          "
                >
                    {/* Search Input */}
                    {searchable && (
                        <div className="p-2 border-b border-border sticky top-0 bg-background">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="neo-input pl-8 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !option.disabled && handleSelect(option.value)}
                                    disabled={option.disabled}
                                    className={`
                    w-full px-3 py-2 text-left text-sm
                    flex items-center justify-between
                    transition-colors duration-150
                    ${option.value === value
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "hover:bg-muted"
                                        }
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check className="w-4 h-4" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
