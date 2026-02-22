import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tag, Plus, Calendar } from "lucide-react";
import { promotionsAPI } from "@/services/api";
import { toast } from "sonner";


import { useModal } from "@/context/ModalContext";

const Promotions = () => {
  const { openModal } = useModal();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionsAPI.getAll();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
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
            <h1 className="text-2xl font-display font-bold">Promotions</h1>
            <p className="text-sm text-muted-foreground">Manage discount campaigns and offers</p>
          </div>
          <button
            onClick={() => openModal('PROMOTION', { onSuccess: fetchPromotions })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>

        {/* Active Promotions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full neo-card p-12 text-center">
              <p className="text-muted-foreground">Loading promotions...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="col-span-full neo-card p-12 text-center">
              <Tag className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No promotions found</p>
            </div>
          ) : (
            promotions.map((promo) => (
              <div key={promo.id} className="neo-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold">{promo.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {(promo.type || "percentage").replace("_", " ")}
                    </p>
                  </div>
                  <span className={`neo-badge text-xs ${promo.status === 'active'
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {(promo.status || "active").toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-display font-bold">
                    {promo.type === "percentage" || !promo.type
                      ? `${promo.value || 0}% OFF`
                      : `Buy ${(promo.value || 3) - 1} Get 1 Free`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


    </AppLayout>
  );
};

export default Promotions;
