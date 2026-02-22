import React from 'react';
import { SidebarLayout } from './SidebarLayout';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export const CommandLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarLayout>
            {/* Analytics Heads-up Display */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-black/95 text-green-500 border-b border-green-900 border-dashed font-mono uppercase text-xs">
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">System Status</span>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>OPERATIONAL</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Live Revenue</span>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>KES 142,000</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Active Users</span>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>12 ONLINE</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Performance</span>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>98% EFFICIENCY</span>
                    </div>
                </div>
            </div>

            <div className="relative">
                {children}
            </div>
        </SidebarLayout>
    );
};
