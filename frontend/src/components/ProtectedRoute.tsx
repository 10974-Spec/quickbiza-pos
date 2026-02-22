import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLicense } from '@/hooks/useLicense';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireRole?: string[];
    requireModule?: string;
}

export function ProtectedRoute({ children, requireRole, requireModule }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();
    const { hasModule, isLoading } = useLicense();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireRole && user && !requireRole.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="neo-card p-8 text-center max-w-md">
                    <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
                    <p className="text-sm text-muted-foreground">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    if (requireModule && !isLoading && !hasModule(requireModule)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="neo-card p-8 text-center max-w-md">
                    <h1 className="text-2xl font-display font-bold mb-2">Module Restricted</h1>
                    <p className="text-sm text-muted-foreground">
                        Your current license tier does not include access to the <strong>{requireModule}</strong> module.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
