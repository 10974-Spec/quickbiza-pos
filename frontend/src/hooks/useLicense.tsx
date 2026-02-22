import { useQuery, useQueryClient } from "@tanstack/react-query";
import { licenseAPI } from "@/services/license";

export const useLicense = () => {
    const queryClient = useQueryClient();
    const { data: modules = [], isLoading } = useQuery({
        queryKey: ['licenseModules'],
        queryFn: licenseAPI.getModules,
        staleTime: 1000 * 60,      // 1 minute — so DB changes appear quickly
        gcTime: 1000 * 60 * 5,    // keep in cache for 5 min
        retry: 1
    });

    const hasModule = (moduleName: string) => {
        // Fail-open while loading — don't hide items just because the request
        // hasn't completed yet. Better to show too much than nothing at all.
        if (isLoading) return true;
        return modules.includes(moduleName);
    };

    const refreshModules = () => queryClient.invalidateQueries({ queryKey: ['licenseModules'] });

    return { modules, hasModule, isLoading, refreshModules };
};
