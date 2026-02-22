import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Wifi, Volume2, Battery, Search } from 'lucide-react';
import { useNavItems } from '@/hooks/useNavItems';
import { Link, useLocation } from 'react-router-dom';

export const WindowsLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [time, setTime] = useState(new Date());
    const [isStartOpen, setIsStartOpen] = useState(false);
    const location = useLocation();
    const items = useNavItems();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleStart = () => setIsStartOpen(!isStartOpen);

    return (
        <div className="flex flex-col h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans">
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Area */}
                <div className="flex-1 relative flex">
                    <AppSidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />

                    <main className="flex-1 overflow-auto bg-[#0078d7]/10 p-4 relative">
                        {/* Windows Decoration */}
                        <div className="bg-background border border-border shadow-2xl rounded-lg h-full overflow-hidden flex flex-col">
                            <div className="bg-muted/80 backdrop-blur border-b border-border h-8 flex items-center justify-between px-4 shrink-0 select-none">
                                <span className="text-xs font-semibold">QuickBiza POS - {location.pathname}</span>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 border border-yellow-600" />
                                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 border border-green-600" />
                                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-0 bg-background/50">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Start Menu */}
            {isStartOpen && (
                <div className="absolute bottom-12 left-0 w-80 bg-background/95 backdrop-blur border border-border rounded-t-lg shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 ml-1">
                    <div className="p-4 grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                        {items.map(item => (
                            <Link
                                to={item.path}
                                key={item.path}
                                onClick={() => setIsStartOpen(false)}
                                className="flex items-center gap-2 p-2 hover:bg-primary/10 hover:text-primary rounded transition-colors text-sm"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-border p-3 bg-muted/50 flex justify-between items-center rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">U</div>
                            <span className="text-sm font-medium">User</span>
                        </div>
                        <button className="text-xs text-muted-foreground hover:text-foreground">Log off</button>
                    </div>
                </div>
            )}

            {/* Taskbar */}
            <div className="h-10 bg-[#1e1e1e] border-t border-[#333] flex items-center px-2 justify-between shrink-0 z-50 text-white">
                <div className="flex items-center gap-2 h-full">
                    <button
                        onClick={toggleStart}
                        className={`
                            h-8 w-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors
                            ${isStartOpen ? 'bg-white/10' : ''}
                        `}
                    >
                        <div className="grid grid-cols-2 gap-0.5">
                            <div className="w-1.5 h-1.5 bg-blue-400"></div>
                            <div className="w-1.5 h-1.5 bg-green-400"></div>
                            <div className="w-1.5 h-1.5 bg-yellow-400"></div>
                            <div className="w-1.5 h-1.5 bg-red-400"></div>
                        </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2">
                        <div className="h-8 px-3 bg-white/5 rounded border-b-2 border-primary flex items-center gap-2 min-w-[120px]">
                            <Search className="w-3 h-3 text-white/50" />
                            <span className="text-xs text-white/90">QuickBiza</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-2">
                    <Wifi className="w-4 h-4 text-white/70" />
                    <Volume2 className="w-4 h-4 text-white/70" />
                    <Battery className="w-4 h-4 text-white/70" />
                    <div className="flex flex-col items-end leading-none text-[10px] text-white/90 min-w-[60px]">
                        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{time.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
