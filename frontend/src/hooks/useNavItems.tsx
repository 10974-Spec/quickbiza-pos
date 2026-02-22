import { useMemo } from 'react';
import { navItems, NavItem } from '@/constants/navItems';
import { useAuth } from '@/hooks/useAuth';
import { useLicense } from '@/hooks/useLicense';

export const useNavItems = (): NavItem[] => {
    const { user } = useAuth();
    const { hasModule } = useLicense();

    return useMemo(() => {
        return navItems.filter(item => {
            // 1. Check Module Requirements
            if (item.module && !hasModule(item.module)) {
                return false;
            }

            // 2. Check Role Requirements
            if (item.requiredRole && !item.requiredRole.includes(user?.role || '')) {
                return false;
            }

            // Admin has override for basic permissions
            if (user?.role === 'admin') {
                return true;
            }

            // 3. Check Specific Permission Requirements
            const userPermissions = user?.permissions;
            if (item.requiredPermission) {
                if (!userPermissions || !userPermissions.includes(item.requiredPermission)) {
                    return false;
                }
            }

            // Handle legacy user profiles without permissions column gracefully
            if (userPermissions && Array.isArray(userPermissions)) {
                if (userPermissions.length === 0) return false;
            }

            return true;
        });
    }, [user, hasModule]);
};
