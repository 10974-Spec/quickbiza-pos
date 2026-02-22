import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsAPI, AppSettings } from '@/services/settings';

type Theme = 'default' | 'neo' | 'win7' | 'saas' | 'material' | 'terminal' | 'retro' | 'access';
export type Layout = 'sidebar-collapsible' | 'top-nav' | 'dual-nav' | 'tabs' | 'grid' | 'pos-full' | 'floating' | 'windows' | 'command';

interface ThemeContextType {
    theme: Theme;
    layout: Layout;
    setLayout: (layout: Layout) => void;
    setTheme: (theme: Theme) => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    logo: string | null;
    setLogo: (path: string) => void;
    companyName: string;
    setCompanyName: (name: string) => void;
    iconSet: 'lucide' | 'fontawesome' | 'material' | 'boxicons' | 'fluent' | 'heroicons' | 'twemoji' | 'openmoji' | 'noto' | 'icons8' | 'fluent-emoji' | 'pixelart' | 'kenney';
    setIconSet: (set: 'lucide' | 'fontawesome' | 'material' | 'boxicons' | 'fluent' | 'heroicons' | 'twemoji' | 'openmoji' | 'noto' | 'icons8' | 'fluent-emoji' | 'pixelart' | 'kenney') => void;
    isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('default');
    const [layout, setLayout] = useState<Layout>('sidebar-collapsible');
    const [primaryColor, setPrimaryColor] = useState('#ea580c'); // Default orange
    const [logo, setLogo] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState('QuickBiza');
    const [iconSet, setIconSet] = useState<'lucide' | 'fontawesome' | 'material' | 'boxicons' | 'fluent' | 'heroicons' | 'twemoji' | 'openmoji' | 'noto' | 'icons8' | 'fluent-emoji' | 'pixelart' | 'kenney'>('lucide');
    const [isLoading, setIsLoading] = useState(true);
    // Guard: only auto-save AFTER the first load completes, never during init
    const hasLoaded = React.useRef(false);

    // Load settings from backend on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await settingsAPI.getSettings();
            if (settings.theme) setTheme(settings.theme);
            if (settings.primary_color) setPrimaryColor(settings.primary_color);
            if (settings.company_name) setCompanyName(settings.company_name);
            // Assuming settingsAPI supports icon_set, if not we'll default or need to add it to backend type
            // For now, let's treat it as local state or mocked if backend doesn't support it yet
            // But ideally we should update the AppSettings interface too.
            // Let's check AppSettings interface in settings.ts next.
            if ((settings as any).icon_set) setIconSet((settings as any).icon_set);


            if (settings.logo_path) {
                // Prepend server URL if it's a relative path
                const baseUrl = import.meta.env.PROD ? 'http://localhost:5000' : 'http://localhost:5000';
                setLogo(`${baseUrl}${settings.logo_path}`);
            }
        } catch (error) {
            console.error('Failed to load theme settings:', error);
        } finally {
            hasLoaded.current = true;
            setIsLoading(false);
        }
    };

    // Apply Theme Class
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('theme-default', 'theme-neo', 'theme-win7', 'theme-saas', 'theme-material', 'theme-terminal', 'theme-retro', 'theme-access');
        root.classList.add(`theme-${theme}`);
    }, [theme]);

    // Apply Primary Color Variable
    useEffect(() => {
        const root = window.document.documentElement;
        // Convert hex to HSL for Tailwind (approximated for now, or just use CSS var)
        // Since we use HSL in CSS, we need to convert HEX to HSL 
        // For simplicity, we'll just set a --primary-color-override var and might need to update CSS to use it
        // Or calculate HSL here.

        // Use a simple hex to hsl converter for the --primary variable
        // But since index.css uses space separated values e.g. 28 90% 55%
        // We'll trust the Neobrutalist design uses standard colors or we need a proper converter.
        // For now, let's just set a raw css property
        root.style.setProperty('--primary-hex', primaryColor);

        // If we want to override tailwind's primary, we need to update the --primary variable with HSL values
        const hsl = hexToHSL(primaryColor);
        if (hsl) {
            root.style.setProperty('--primary', hsl);
            root.style.setProperty('--sidebar-primary', hsl);
            root.style.setProperty('--ring', hsl);
        }

    }, [primaryColor]);

    // Auto-save Settings — only fires when user actually changes something, not on initial load
    useEffect(() => {
        if (!hasLoaded.current) return;   // skip during initialization
        settingsAPI.updateSettings({
            theme,
            layout,
            primary_color: primaryColor,
            company_name: companyName,
            icon_set: iconSet
        }).catch(console.error);
    }, [theme, layout, primaryColor, companyName, iconSet]);  // isLoading intentionally excluded

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            layout,
            setLayout,
            primaryColor,
            setPrimaryColor,
            logo,
            setLogo,
            companyName,
            setCompanyName,
            iconSet,
            setIconSet,
            isLoading
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Helper to convert hex to space-separated HSL for Tailwind
function hexToHSL(H: string) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = parseInt("0x" + H[1] + H[1]);
        g = parseInt("0x" + H[2] + H[2]);
        b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
        r = parseInt("0x" + H[1] + H[2]);
        g = parseInt("0x" + H[3] + H[4]);
        b = parseInt("0x" + H[5] + H[6]);
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
