import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Truck } from 'lucide-react';
import { useNavItems } from '@/hooks/useNavItems';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

export const TopNavLayout = ({ children }: { children: React.ReactNode }) => {
    const { logout } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const items = useNavItems();

    return (
        <div className="flex flex-col h-screen w-full bg-background animate-fade-in">
            {/* Top Navbar */}
            <header className={`
                h-16 border-b border-border px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm transition-all duration-300
                ${theme === 'win7'
                    ? 'bg-gradient-to-b from-[#f0f6fc] to-[#dcecfc] border-b-[#7da2ce]'
                    : 'bg-card/95 backdrop-blur'
                }
            `}>
                <div className="flex items-center gap-8 overflow-hidden">
                    <div className="font-display font-bold text-xl text-primary whitespace-nowrap">QuickBiza POS</div>
                    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {items.slice(0, 8).map((item) => {
                            const active = location.pathname === item.path;

                            // Determine classes based on theme
                            let activeClass = 'bg-primary/10 text-primary font-bold';
                            let inactiveClass = 'text-muted-foreground hover:bg-muted hover:text-foreground';
                            let baseClass = 'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap';

                            if (theme === 'win7') {
                                baseClass = 'neo-button text-sm px-4 py-1.5 flex items-center gap-2 whitespace-nowrap !border shadow-sm';
                                activeClass = 'neo-button-primary font-bold';
                                inactiveClass = 'bg-gradient-to-b from-[#ffffff] to-[#f0f0f0] text-[#1e395b] hover:from-[#f5fbff] hover:to-[#e6f2fc]';
                            } else if (theme === 'material') {
                                baseClass = 'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap';
                                activeClass = 'bg-primary text-primary-foreground shadow-md';
                                inactiveClass = 'hover:bg-black/5 text-foreground/80';
                            } else if (theme === 'terminal') {
                                baseClass = 'px-3 py-2 text-sm font-mono border border-transparent transition-all flex items-center gap-2 whitespace-nowrap';
                                activeClass = 'bg-primary text-black border-primary font-bold shadow-[0_0_10px_rgba(0,255,136,0.5)]';
                                inactiveClass = 'text-primary hover:border-primary hover:bg-primary/10';
                            } else if (theme === 'retro') {
                                baseClass = 'px-2 py-2 text-[10px] uppercase font-bold border-2 border-black transition-all flex items-center gap-2 whitespace-nowrap bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-2';
                                activeClass = 'bg-[#ff3385] text-white translate-x-[2px] translate-y-[2px] shadow-none';
                                inactiveClass = 'hover:bg-[#eee] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
                            } else if (theme === 'access') {
                                baseClass = 'px-3 py-1 text-sm border-t border-l border-r border-transparent rounded-t-sm flex items-center gap-2 whitespace-nowrap mr-1';
                                activeClass = 'bg-[#f0f2f5] border-gray-300 border-b-[#f0f2f5] text-[#005a9e] font-semibold z-10';
                                inactiveClass = 'text-gray-700 hover:bg-[#e1e1e1]';
                            }

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            );
                        })}

                        <Link to="/settings" className={`
                            ${theme === 'win7' ? 'neo-button px-3 py-1.5' : 'px-3 py-2 rounded-lg'} 
                            text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 whitespace-nowrap
                         `}>
                            <Settings className="w-4 h-4" />
                            More
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 pl-4 border-l border-border">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U
                    </div>
                    <button onClick={logout} className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
