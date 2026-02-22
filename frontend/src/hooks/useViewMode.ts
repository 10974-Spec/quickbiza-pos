import { useState, useEffect } from 'react';

export const useViewMode = (defaultMode: 'grid' | 'table' | 'excel' = 'grid') => {
    const [viewMode, setViewModeState] = useState<'grid' | 'table' | 'excel'>(() => {
        const saved = localStorage.getItem('preferredViewMode');
        return (saved === 'grid' || saved === 'table' || saved === 'excel') ? saved : defaultMode;
    });

    const setViewMode = (mode: 'grid' | 'table' | 'excel') => {
        localStorage.setItem('preferredViewMode', mode);
        setViewModeState(mode);
        // Dispatch a custom event so active components can update instantly
        window.dispatchEvent(new Event('viewModeChanged'));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('preferredViewMode');
            if (saved === 'grid' || saved === 'table' || saved === 'excel') {
                setViewModeState(saved);
            }
        };

        // Listen for local updates within the same window
        window.addEventListener('viewModeChanged', handleStorageChange);

        // Listen for updates from other tabs
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('viewModeChanged', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return { viewMode, setViewMode };
};
