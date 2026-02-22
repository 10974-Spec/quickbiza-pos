import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Store, MapPin, TrendingUp } from "lucide-react";
import { branchesAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

const Branches = () => {
  const { openModal } = useModal();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await branchesAPI.getAll();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Branches</h1>
            <p className="text-sm text-muted-foreground">Manage multiple locations</p>
          </div>
          <button
            onClick={() => openModal('BRANCH', { onSuccess: fetchBranches })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            Add Branch
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Branches</span>
              <Store className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{branches.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Store className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">
              {branches.filter(b => b.status === 'active').length}
            </p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Inactive</span>
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold">
              {branches.filter(b => b.status === 'inactive').length}
            </p>
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full neo-card p-12 text-center">
              <p className="text-muted-foreground">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="col-span-full neo-card p-12 text-center">
              <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No branches found</p>
            </div>
          ) : (
            branches.map((branch) => (
              <div key={branch.id} className="neo-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openModal('BRANCH', { branch, onSuccess: fetchBranches })}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold">{branch.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{branch.location}</span>
                    </div>
                  </div>
                  <span className={`neo-badge text-xs ${branch.status === 'active'
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {(branch.status || 'active').toUpperCase()}
                  </span>
                </div>

                {branch.phone && (
                  <p className="text-xs text-muted-foreground mb-2">📞 {branch.phone}</p>
                )}

                {branch.manager_name && (
                  <p className="text-xs text-muted-foreground">
                    Manager: {branch.manager_name}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Branches;
