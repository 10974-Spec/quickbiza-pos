import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ShoppingCart, Package, TrendingUp } from "lucide-react";
import { purchasesAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

import { useViewMode } from "@/hooks/useViewMode";
import { Search, LayoutGrid, List, FileSpreadsheet } from "lucide-react";

const Purchases = () => {
  const { openModal } = useModal();
  const { viewMode, setViewMode } = useViewMode();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchasesAPI.getAll({ limit: 50 });
      setPurchases(data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (p.supplier_name && p.supplier_name.toLowerCase().includes(searchLower)) ||
      (p.created_by_name && p.created_by_name.toLowerCase().includes(searchLower)) ||
      p.id.toString().includes(searchLower)
    );
  });

  const totalAmount = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const pendingCount = purchases.filter(p => p.payment_status === 'pending' || p.payment_status === 'partial').length;

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Purchases</h1>
            <p className="text-sm text-muted-foreground">Track raw material purchases</p>
          </div>
          <button
            onClick={() => openModal('PURCHASE', { onSuccess: fetchPurchases })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>

        {/* Search and View Toggle */}
        <div className="neo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Supplier, PO #, or Creator..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-muted p-1 rounded-lg border-2 border-transparent shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("excel")}
                className={`p-2 rounded-md transition-all ${viewMode === 'excel' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Excel View"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Amount</span>
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">KES {totalAmount.toLocaleString()}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Pending Orders</span>
              <Package className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">{pendingCount}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Orders</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">{purchases.length}</p>
          </div>
        </div>

        {/* Purchases List */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4">Recent Purchase Orders</h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading purchases...</p>
            ) : filteredPurchases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No purchase orders found</p>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredPurchases.map((purchase) => (
                  <div key={purchase.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">PO #{purchase.id}</h3>
                          <span
                            className={`neo-badge text-xs ${purchase.payment_status === "paid"
                              ? "bg-success text-success-foreground"
                              : purchase.payment_status === "partial"
                                ? "bg-info text-info-foreground"
                                : "bg-warning text-warning-foreground"
                              }`}
                          >
                            {(purchase.payment_status || "pending").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {purchase.supplier_name || `Supplier #${purchase.supplier_id}`}
                        </p>
                        <div className="text-xs mt-1">
                          Created by {purchase.created_by_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold block">KES {(purchase.total_amount || 0).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground block">
                          Paid: KES {(purchase.amount_paid || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => {
                          openModal('PURCHASE_PAYMENTS', {
                            purchaseId: purchase.id,
                            totalAmount: purchase.total_amount,
                            amountPaid: purchase.amount_paid || 0,
                            onSuccess: fetchPurchases
                          });
                        }}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors font-semibold"
                      >
                        View Payments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold">PO #</th>
                      <th className="p-3 font-semibold">Supplier</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Amount</th>
                      <th className="p-3 font-semibold">Paid</th>
                      <th className="p-3 font-semibold">Created By</th>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-mono">#{purchase.id}</td>
                        <td className="p-3">{purchase.supplier_name || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`neo-badge text-xs ${purchase.payment_status === "paid"
                              ? "bg-success text-success-foreground"
                              : purchase.payment_status === "partial"
                                ? "bg-info text-info-foreground"
                                : "bg-warning text-warning-foreground"
                              }`}
                          >
                            {(purchase.payment_status || "pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">KES {(purchase.total_amount || 0).toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">KES {(purchase.amount_paid || 0).toLocaleString()}</td>
                        <td className="p-3 text-xs">{purchase.created_by_name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                openModal('PURCHASE_PAYMENTS', {
                                  purchaseId: purchase.id,
                                  totalAmount: purchase.total_amount,
                                  amountPaid: purchase.amount_paid || 0,
                                  onSuccess: fetchPurchases
                                });
                              }}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors font-semibold"
                            >
                              Payments
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="p-2 border-r font-semibold">PO #</th>
                      <th className="p-2 border-r font-semibold">Supplier</th>
                      <th className="p-2 border-r font-semibold">Status</th>
                      <th className="p-2 border-r font-semibold">Amount</th>
                      <th className="p-2 border-r font-semibold">Paid</th>
                      <th className="p-2 border-r font-semibold">Created By</th>
                      <th className="p-2 border-r font-semibold">Date</th>
                      <th className="p-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-2 border-r font-mono">#{purchase.id}</td>
                        <td className="p-2 border-r">{purchase.supplier_name || '-'}</td>
                        <td className="p-2 border-r">
                          <span
                            className={`neo-badge text-[10px] px-1 py-0.5 ${purchase.payment_status === "paid"
                              ? "bg-success text-success-foreground"
                              : purchase.payment_status === "partial"
                                ? "bg-info text-info-foreground"
                                : "bg-warning text-warning-foreground"
                              }`}
                          >
                            {(purchase.payment_status || "pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2 border-r font-semibold font-mono">KES {(purchase.total_amount || 0).toLocaleString()}</td>
                        <td className="p-2 border-r text-muted-foreground font-mono">KES {(purchase.amount_paid || 0).toLocaleString()}</td>
                        <td className="p-2 border-r">{purchase.created_by_name}</td>
                        <td className="p-2 border-r text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                openModal('PURCHASE_PAYMENTS', {
                                  purchaseId: purchase.id,
                                  totalAmount: purchase.total_amount,
                                  amountPaid: purchase.amount_paid || 0,
                                  onSuccess: fetchPurchases
                                });
                              }}
                              className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors font-semibold"
                            >
                              Payments
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
            }
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Purchases;
