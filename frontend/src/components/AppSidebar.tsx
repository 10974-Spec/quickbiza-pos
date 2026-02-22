import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  BookOpen,
  Tag,
  Globe,
  Heart,
  Bell,
  Settings,
  Menu,
  X,
  Smartphone,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";
import { TopNavLayout } from '../layouts/TopNavLayout';
import AppIconAsset from '@/assets/Appicon.png';
import { useLicense } from "@/hooks/useLicense";
const APP_ICON = AppIconAsset;

import { useNavItems } from "@/hooks/useNavItems";
import { Icon } from "@/components/ui/Icon";
import { SyncStatus } from "@/components/SyncStatus";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useTheme } from "@/context/ThemeContext";

// ... existing imports ...

interface AppSidebarProps {
  collapsed?: boolean;
  toggleCollapse?: () => void;
  hideToggle?: boolean;
}

export function AppSidebar({ collapsed: propsCollapsed, toggleCollapse: propsToggleCollapse, hideToggle = false }: AppSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const { openModal } = useModal();

  const isControlled = propsCollapsed !== undefined;
  const collapsed = isControlled ? propsCollapsed : internalCollapsed;
  const setCollapsed = (value: boolean) => {
    if (propsToggleCollapse) {
      propsToggleCollapse();
    } else {
      setInternalCollapsed(value);
    }
  };
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const items = useNavItems();
  const { logo: dynamicLogo, theme, setTheme } = useTheme();

  // Use uploaded logo or fallback to default
  const logoSrc = dynamicLogo || APP_ICON;

  // Force re-render on storage change to update sidebar
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const handleStorageChange = () => {
      setLastUpdate(Date.now());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-changed', handleStorageChange);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 lg:hidden neo-button bg-primary text-primary-foreground p-2"
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen app-sidebar
          transition-all duration-300 ease-in-out overflow-hidden flex flex-col
          ${collapsed ? "w-0 lg:w-16" : "w-64"}
        `}
      >
        <div className="flex items-center gap-3 p-3 border-b border-border min-h-[64px]">
          <img
            src={logoSrc}
            alt="QuickBiza"
            className="w-10 h-10 rounded-lg border border-border object-contain bg-white flex-shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-sm leading-tight truncate">
                QuickBiza
              </h1>
              <span className="text-xs text-muted-foreground tracking-wide">v1.0.0</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.title : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body
                  transition-all duration-150 app-sidebar-link
                  ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? "active font-semibold"
                    : "text-sidebar-foreground hover:bg-muted"
                  }
                `}
              >
                <Icon name={item.iconName} fallback={item.icon} className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop */}
        {!hideToggle && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center p-3 border-t border-border hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="p-3 mt-auto border-t border-border space-y-2">
          {/* Cloud Sync Status */}
          {!collapsed && (
            <TooltipProvider>
              <SyncStatus />
            </TooltipProvider>
          )}

          {/* Devices Button */}
          <button
            onClick={() => openModal('DEVICE_MANAGEMENT')}
            title={collapsed ? "Devices" : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body
              neo-button bg-white text-sidebar-foreground hover:bg-zinc-50
              transition-all duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Smartphone className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-semibold truncate">Devices</span>}
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title={collapsed ? "Logout" : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body
              neo-button bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700
              transition-all duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-semibold truncate">Logout</span>}
          </button>
        </div>
      </aside >
    </>
  );
}
