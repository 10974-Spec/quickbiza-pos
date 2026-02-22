import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';

export const FloatingLayout = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative h-screen w-full bg-background overflow-hidden animate-fade-in">
            {/* Floating Trigger */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Drawer Overlay */}
            {open && (
                <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 w-80 bg-background z-50 shadow-2xl transition-transform duration-300 ease-out transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-end p-2">
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="h-full overflow-y-auto pb-10">
                    <AppSidebar collapsed={false} toggleCollapse={() => { }} hideToggle={true} />
                </div>
            </div>

            <main className="h-full w-full overflow-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
