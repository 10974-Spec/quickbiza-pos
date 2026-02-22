import { useTheme } from "@/context/ThemeContext";

interface IconProps {
    name: string | undefined;
    className?: string;
    size?: number;
    fallback?: any;
}

// Helper: Convert emoji to hex code for CDN
const toHex = (emoji: string) => {
    if (!emoji) return '';
    return emoji.codePointAt(0)?.toString(16) || '';
};

// Types for mapping
type IconDef = {
    fa: string;      // FontAwesome class
    md: string;      // Material Icon name
    bx: string;      // Boxicon class
    pixel: string;   // Pixelarticon class name suffix (prefixed with pixelart-icons-font-)
    emoji: string;   // Unicode Emoji (for Twemoji, OpenMoji, Noto)
    icons8: string;  // Icons8 filename keyword
    fluent?: string; // Specific fluent override if different from icons8
    icons8Color?: string; // Specific icons8 color style override
};

const iconMap: Record<string, IconDef> = {
    // Rigid verification of every single icon

    'dashboard': { fa: 'fa-gauge-high', md: 'dashboard', bx: 'bx-grid-alt', pixel: 'layout-header', emoji: '📊', icons8: 'dashboard' },
    'pos': { fa: 'fa-cash-register', md: 'point_of_sale', bx: 'bx-cart', pixel: 'cart', emoji: '🛒', icons8: 'cash-register' },
    'orders': { fa: 'fa-clipboard-list', md: 'receipt', bx: 'bx-notepad', pixel: 'list', emoji: '📋', icons8: 'track-order', icons8Color: 'purchase-order' }, // track-order (3d), purchase-order (color)?
    'products': { fa: 'fa-box-open', md: 'inventory_2', bx: 'bx-package', pixel: 'archive', emoji: '📦', icons8: 'package', icons8Color: 'product' }, // package (3d), product (color)
    'inventory': { fa: 'fa-warehouse', md: 'warehouse', bx: 'bx-building-house', pixel: 'building', emoji: '🏭', icons8: 'home', icons8Color: 'warehouse' }, // home (3d proxy), warehouse (color possible?)
    'production': { fa: 'fa-hat-chef', md: 'kitchen', bx: 'bx-restaurant', pixel: 'coffee', emoji: '👨‍🍳', icons8: 'restaurant', icons8Color: 'cook-male' }, // cook-male for color?
    'purchases': { fa: 'fa-truck', md: 'local_shipping', bx: 'bx-truck', pixel: 'truck', emoji: '🚚', icons8: 'truck', icons8Color: 'shipped' },
    'suppliers': { fa: 'fa-users', md: 'people', bx: 'bx-group', pixel: 'users', emoji: '👥', icons8: 'people', icons8Color: 'groups' }, // groups (color)
    'customers': { fa: 'fa-user-circle', md: 'account_circle', bx: 'bx-user-circle', pixel: 'user', emoji: '👤', icons8: 'user', icons8Color: 'user' },
    'reports': { fa: 'fa-chart-bar', md: 'bar_chart', bx: 'bx-bar-chart-alt-2', pixel: 'chart-bar', emoji: '📉', icons8: 'bar-chart', icons8Color: 'graph' },
    'expenses': { fa: 'fa-receipt', md: 'receipt_long', bx: 'bx-receipt', pixel: 'note', emoji: '🧾', icons8: 'bill', icons8Color: 'bill' },
    'staff': { fa: 'fa-user-gear', md: 'manage_accounts', bx: 'bx-user-voice', pixel: 'user-plus', emoji: '🛠️', icons8: 'id-card', fluent: 'manager', icons8Color: 'business-contact' }, // manager (3d), business-contact (color)
    'branches': { fa: 'fa-building', md: 'business', bx: 'bx-buildings', pixel: 'buildings', emoji: '🏢', icons8: 'office', icons8Color: 'organization' },
    'transfers': { fa: 'fa-arrow-right-arrow-left', md: 'swap_horiz', bx: 'bx-transfer', pixel: 'arrows-horizontal', emoji: '↔️', icons8: 'switch', icons8Color: 'data-transfer' },
    'returns': { fa: 'fa-rotate-left', md: 'assignment_return', bx: 'bx-undo', pixel: 'undo', emoji: '↩️', icons8: 'left', icons8Color: 'return' },
    'accounting': { fa: 'fa-book', md: 'account_balance', bx: 'bx-book', pixel: 'book', emoji: '📒', icons8: 'calculator', icons8Color: 'accounting' },
    'promotions': { fa: 'fa-tags', md: 'local_offer', bx: 'bx-tag', pixel: 'label', emoji: '🏷️', icons8: 'tag', icons8Color: 'price-tag' },
    'online-orders': { fa: 'fa-globe', md: 'language', bx: 'bx-globe', pixel: 'earth', emoji: '🌐', icons8: 'globe', icons8Color: 'internet' },
    'loyalty': { fa: 'fa-heart', md: 'loyalty', bx: 'bx-heart', pixel: 'heart', emoji: '❤️', icons8: 'heart', icons8Color: 'like' },
    'notifications': { fa: 'fa-bell', md: 'notifications', bx: 'bx-bell', pixel: 'notification', emoji: '🔔', icons8: 'bell', icons8Color: 'alarm' },
    'devices': { fa: 'fa-mobile', md: 'smartphone', bx: 'bx-mobile', pixel: 'device-phone', emoji: '📱', icons8: 'iphone', icons8Color: 'iphone' },
    'fleet': { fa: 'fa-car', md: 'directions_car', bx: 'bx-car', pixel: 'car', emoji: '🚗', icons8: 'car', icons8Color: 'shipped' }, // car?
    'settings': { fa: 'fa-gear', md: 'settings', bx: 'bx-cog', pixel: 'sliders', emoji: '⚙️', icons8: 'settings', fluent: 'gear', icons8Color: 'settings' },
    'extra': { fa: 'fa-bolt', md: 'bolt', bx: 'bx-bolt-circle', pixel: 'zap', emoji: '⚡', icons8: 'lightning-bolt', icons8Color: 'flash-on' },
};


export const Icon = ({ name, className, size = 20, fallback: FallbackIcon }: IconProps) => {
    const { iconSet } = useTheme();

    if (!name || iconSet === 'lucide') {
        return FallbackIcon ? <FallbackIcon className={className} size={size} /> : null;
    }

    const mapping = iconMap[name];
    if (!mapping) {
        return FallbackIcon ? <FallbackIcon className={className} size={size} /> : null;
    }

    // --- Font Icon Sets ---

    if (iconSet === 'fontawesome') {
        return <i className={`fa-solid ${mapping.fa} ${className} flex items-center justify-center`} style={{ fontSize: size }} />;
    }

    if (iconSet === 'material') {
        return <span className={`material-icons ${className} flex items-center justify-center`} style={{ fontSize: size }}>{mapping.md}</span>;
    }

    if (iconSet === 'boxicons') {
        return <i className={`bx ${mapping.bx} ${className} flex items-center justify-center`} style={{ fontSize: size }}></i>;
    }

    if (iconSet === 'pixelart' || iconSet === 'kenney') {
        return <i className={`pixelart-icons-font-${mapping.pixel} ${className} flex items-center justify-center`} style={{ fontSize: size }}></i>;
    }


    // --- Image / Emoji Icon Sets ---

    if (iconSet === 'twemoji') {
        const hex = toHex(mapping.emoji);
        const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${hex}.svg`;
        return <img src={url} alt={name} className={className} style={{ width: size, height: size }} />;
    }

    if (iconSet === 'openmoji') {
        const hex = toHex(mapping.emoji).toUpperCase();
        const url = `https://openmoji.org/data/color/svg/${hex}.svg`;
        return <img src={url} alt={name} className={className} style={{ width: size, height: size }} />;
    }

    if (iconSet === 'noto') {
        return <span style={{ fontSize: size, lineHeight: 1 }}>{mapping.emoji}</span>;
    }

    if (iconSet === 'icons8') {
        // Use icons8Color override if available
        const key = mapping.icons8Color || mapping.icons8;
        const url = `https://img.icons8.com/color/48/${key}.png`;
        return <img src={url} alt={name} className={className} style={{ width: size, height: size }} />;
    }

    if (iconSet === 'fluent-emoji' || iconSet === 'fluent') {
        // Use fluent override if available
        const key = mapping.fluent || mapping.icons8;
        const url = `https://img.icons8.com/3d-fluency/94/${key}.png`;
        return <img src={url} alt={name} className={className} style={{ width: size, height: size }} />;
    }

    return FallbackIcon ? <FallbackIcon className={className} size={size} /> : null;
};
