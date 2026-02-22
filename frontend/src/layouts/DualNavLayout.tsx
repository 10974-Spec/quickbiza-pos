import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Bell, Search, User } from 'lucide-react';
import { useNavItems } from '@/hooks/useNavItems';
import { useNavigate } from 'react-router-dom';

export const DualNavLayout = ({ children }: { children: React.ReactNode }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [showResults, setShowResults] = React.useState(false);
    const navigate = useNavigate();
    const items = useNavItems();

    // Flatten logic could be moved to a helper if needed, but for now simple filter
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const results = items.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background animate-fade-in flex-col">
            {/* Top Global Bar */}
            <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0 z-20 relative">
                <div className="font-bold font-display text-lg">Aroma Enterprise</div>
                <div className="flex items-center gap-4 relative">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Global Search (Modules)..."
                            className="neo-input h-9 pl-9 w-64 text-sm focus:w-80 transition-all"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                        {/* Search Dropdown */}
                        {showResults && (
                            <div className="absolute top-10 left-0 w-80 bg-background border border-border shadow-lg rounded-lg max-h-60 overflow-auto z-50">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <div
                                            key={item.path}
                                            className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 text-sm"
                                            onClick={() => {
                                                navigate(item.path);
                                                setShowResults(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <item.icon className="w-4 h-4 text-muted-foreground" />
                                            <span>{item.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="p-2 hover:bg-muted rounded-full">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-full bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Mini Sidebar - Fixed width */}
                <div className="w-16 flex-shrink-0 z-10 border-r border-border bg-card">
                    <AppSidebar collapsed={true} toggleCollapse={() => { }} hideToggle={true} />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 md:p-8 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
};
