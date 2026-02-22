import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, X } from 'lucide-react';
import { useNavItems } from '@/hooks/useNavItems';

export const POSLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const items = useNavItems();

    return (
        <div className="h-screen w-screen overflow-hidden bg-background animate-fade-in flex flex-col">
            <header className="h-12 flex items-center px-4 bg-black text-white shrink-0 justify-between z-50 relative">
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors focus:outline-none"
                    >
                        {isMenuOpen ? <X className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                        <span className="font-bold">Menu</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-card border-2 border-primary shadow-xl rounded-none animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="p-2 grid grid-cols-1 gap-1 max-h-[80vh] overflow-y-auto">
                                {items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 text-sm transition-colors
                                                ${isActive
                                                    ? 'bg-primary text-primary-foreground font-bold'
                                                    : 'text-foreground hover:bg-muted hover:text-primary'
                                                }
                                            `}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="font-mono text-sm font-bold text-primary">TERMINAL MODE: ACTIVE</div>
                <div className="w-20"></div> {/* Spacer */}
            </header>
            <main className="flex-1 overflow-auto bg-muted/10 relative" onClick={() => setIsMenuOpen(false)}>
                {children}
            </main>
        </div>
    );
};
