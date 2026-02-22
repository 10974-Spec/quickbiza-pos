import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavItems } from '@/hooks/useNavItems';

export const TabLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const items = useNavItems();

    return (
        <div className="flex flex-col h-screen w-full bg-background animate-fade-in">
            <header className="pt-6 px-6 pb-0 bg-background border-b border-border shadow-sm z-10 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold font-display text-primary">QuickBiza</h1>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Tab View
                    </div>
                </div>

                <div className="flex space-x-1 overflow-x-auto no-scrollbar mask-gradient-right pb-[1px]">
                    {items.map((tab) => {
                        const active = location.pathname.startsWith(tab.path);
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium text-sm transition-all border-t border-x border-transparent whitespace-nowrap
                                    ${active
                                        ? 'bg-card border-border text-primary border-b-transparent -mb-[1px] shadow-sm z-10 font-bold'
                                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground border-b-border'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.title}
                            </Link>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 overflow-auto bg-muted/10 p-6">
                <div className="bg-card rounded-b-lg rounded-tr-lg p-6 shadow-sm min-h-full border border-border border-t-0 animate-fade-up">
                    {children}
                </div>
            </main>
        </div>
    );
};
