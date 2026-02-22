import React from 'react';
import { useTheme } from '@/context/ThemeContext';
// Import Layouts (Types)
import { SidebarLayout } from '@/layouts/SidebarLayout';
import { TopNavLayout } from '@/layouts/TopNavLayout';
import { DualNavLayout } from '@/layouts/DualNavLayout';
import { TabLayout } from '@/layouts/TabLayout';
import { GridLayout } from '@/layouts/GridLayout';
import { POSLayout } from '@/layouts/POSLayout';
import { FloatingLayout } from '@/layouts/FloatingLayout';
import { WindowsLayout } from '@/layouts/WindowsLayout';
import { CommandLayout } from '@/layouts/CommandLayout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { layout } = useTheme();

    // Map layout state to component
    switch (layout) {
        case 'sidebar-collapsible':
            return <SidebarLayout>{children}</SidebarLayout>;
        case 'top-nav':
            return <TopNavLayout>{children}</TopNavLayout>;
        case 'dual-nav':
            return <DualNavLayout>{children}</DualNavLayout>;
        case 'tabs':
            return <TabLayout>{children}</TabLayout>;
        case 'grid':
            return <GridLayout>{children}</GridLayout>;
        case 'pos-full':
            return <POSLayout>{children}</POSLayout>;
        case 'floating':
            return <FloatingLayout>{children}</FloatingLayout>;
        case 'windows':
            return <WindowsLayout>{children}</WindowsLayout>;
        case 'command':
            return <CommandLayout>{children}</CommandLayout>;
        default:
            return <SidebarLayout>{children}</SidebarLayout>;
    }
};
