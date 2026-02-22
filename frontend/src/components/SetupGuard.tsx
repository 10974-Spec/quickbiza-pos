import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setupAPI } from "@/services/setup";
import { Loader2 } from "lucide-react";

export const SetupGuard = ({ children }: { children: React.ReactNode }) => {
    const [isSetup, setIsSetup] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const { isSetup } = await setupAPI.checkStatus();
                setIsSetup(isSetup);

                if (!isSetup && location.pathname !== '/setup') {
                    navigate('/setup');
                }

                // We deliberately allow access to /setup even if isSetup is true
                // to support the "Start New Company" flow from the Landing page.
            } catch (error) {
                console.error("Setup check failed", error);
                // Fallback: assume setup if check fails to avoid lock out loop in case of network error, 
                // or show error page. For now, we'll assume setup is done if API fails to avoid blocking existing users.
                setIsSetup(true);
            }
        };
        checkSetup();
    }, [location.pathname, navigate]);

    if (isSetup === null) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-500 font-medium">Initializing System...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
