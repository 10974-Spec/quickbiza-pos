import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    Package,
    Warehouse,
    ChefHat,
    Truck,
    Users,
    UserCircle,
    BarChart3,
    Receipt,
    UserCog,
    Building2,
    ArrowLeftRight,
    RotateCcw,
    BookOpen,
    Tag,
    Globe,
    Heart,
    Bell,
    Smartphone,
    Zap,
    Car,
    DollarSign,
    Settings,
} from "lucide-react";

export interface NavItem {
    title: string;
    path: string;
    icon: any;
    iconName?: string;
    requiredRole?: string[];
    requiredPermission?: string;
    module?: string;
}

export const navItems: NavItem[] = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard, iconName: "dashboard" },
    { title: "POS / Sales", path: "/pos", icon: ShoppingCart, module: 'pos', iconName: "pos" },
    { title: "Orders", path: "/orders", icon: ClipboardList, module: 'pos', iconName: "orders" },
    { title: "Products", path: "/products", icon: Package, module: 'inventory', iconName: "products" },
    { title: "Inventory", path: "/inventory", icon: Warehouse, module: 'inventory', iconName: "inventory" },
    { title: "Production", path: "/production", icon: ChefHat, module: 'manufacturing', iconName: "production" },
    { title: "Purchases", path: "/purchases", icon: Truck, module: 'inventory', iconName: "purchases" },
    { title: "Suppliers", path: "/suppliers", icon: Users, module: 'inventory', iconName: "suppliers" },
    { title: "Customers", path: "/customers", icon: UserCircle, module: 'customers', iconName: "customers" },
    { title: "Reports", path: "/reports", icon: BarChart3, module: 'reports', iconName: "reports" },
    { title: "Expenses", path: "/expenses", icon: Receipt, module: 'accounting', iconName: "expenses" },
    { title: "Staff", path: "/staff", icon: UserCog, module: 'payroll', requiredRole: ['admin'], iconName: "staff" },
    { title: "Branches", path: "/branches", icon: Building2, module: 'multi_branch', iconName: "branches" },
    { title: "Transfers", path: "/transfers", icon: ArrowLeftRight, module: 'inventory', iconName: "transfers" },
    { title: "Returns", path: "/returns", icon: RotateCcw, module: 'pos', iconName: "returns" },
    { title: "Accounting", path: "/accounting", icon: BookOpen, module: 'accounting', iconName: "accounting" },
    { title: "Promotions", path: "/promotions", icon: Tag, module: 'marketing', iconName: "promotions" },
    { title: "Online Orders", path: "/online-orders", icon: Globe, module: 'online_store', iconName: "online-orders" },
    { title: "Loyalty", path: "/loyalty", icon: Heart, module: 'loyalty', iconName: "loyalty" },
    { title: "Notifications", path: "/notifications", icon: Bell, iconName: "notifications" },
    { title: "Devices", path: "/devices", icon: Smartphone, module: 'iot', iconName: "devices" },
    { title: "Fleet Management", path: "/fleet", icon: Car, module: 'fleet', iconName: "fleet" },
    { title: "Payroll (Run)", path: "/payroll/run", icon: DollarSign, module: 'payroll', iconName: "payroll" },
    { title: "Payroll (Settings)", path: "/payroll/settings", icon: Settings, module: 'payroll', iconName: "payroll-settings" },
    { title: "Employees", path: "/payroll/employees", icon: Users, module: 'payroll', iconName: "payroll-employees" },
    { title: "Extra Features", path: "/extra-features", icon: Zap, iconName: "extra" },
    { title: "Settings", path: "/settings", icon: Settings, iconName: "settings" },
];
