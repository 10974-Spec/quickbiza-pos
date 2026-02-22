import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Menu } from 'lucide-react';

export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background animate-fade-in relative">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-0 lg:w-16' : 'w-64'}`}>
                <AppSidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} hideToggle={false} />
            </div>
            <main className="flex-1 overflow-auto relative flex flex-col p-6 md:p-8 bg-muted/10">
                {/* Mobile toggle could go here */}
                {children}
            </main>
        </div>
    );
};
