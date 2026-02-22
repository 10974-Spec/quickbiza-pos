import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Package, AlertTriangle, Plus, Minus, Search, LayoutGrid, List, Trash2, FileSpreadsheet } from "lucide-react";
import { inventoryAPI } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useViewMode } from "@/hooks/useViewMode";

interface RawInventory {
  ingredient_id: number;
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  last_updated: string;
}

interface FinishedInventory {
  product_id: number;
  name: string;
  quantity: number;
  emoji: string;
  price: number;
  last_updated: string;
}

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"finished" | "raw">("finished");
  const [rawInventory, setRawInventory] = useState<RawInventory[]>([]);
  const [finishedInventory, setFinishedInventory] = useState<FinishedInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and View Mode State
  const [searchQuery, setSearchQuery] = useState("");
  const { viewMode, setViewMode } = useViewMode();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [raw, finished] = await Promise.all([
        inventoryAPI.getRaw(),
        inventoryAPI.getFinished(),
      ]);
      setRawInventory(raw);
      setFinishedInventory(finished);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async (type: "raw" | "finished", itemId: number, change: number, itemName: string) => {
    if (!isAdmin) {
      toast.error("Only admins can adjust inventory");
      return;
    }

    const notes = prompt(`Adjusting ${itemName} by ${change > 0 ? '+' : ''}${change}. Enter reason:`);
    if (notes === null) return;

    try {
      await inventoryAPI.adjust({
        type,
        item_id: itemId,
        quantity_change: change,
        notes: notes || undefined,
      });

      toast.success("Inventory adjusted successfully");
      fetchInventory();
    } catch (error: any) {
      console.error("Error adjusting inventory:", error);
      toast.error(error.response?.data?.error || "Failed to adjust inventory");
    }
  };

  const handleRecordWaste = async (productId: number, productName: string) => {
    if (!isAdmin) {
      toast.error("Only admins can record waste");
      return;
    }

    const quantity = prompt(`Record waste for ${productName}. Enter quantity:`);
    if (!quantity) return;

    const notes = prompt("Enter reason for waste:");
    if (notes === null) return;

    try {
      await inventoryAPI.recordWaste({
        type: "finished",
        item_id: productId,
        quantity: parseInt(quantity),
        notes: notes || undefined,
      });

      toast.success("Waste recorded successfully");
      fetchInventory();
    } catch (error: any) {
      console.error("Error recording waste:", error);
      toast.error(error.response?.data?.error || "Failed to record waste");
    }
  };

  // Filter Inventory
  const filteredFinished = finishedInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRaw = rawInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Track and manage stock levels</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex bg-muted p-1 rounded-lg border-2 border-transparent">
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

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("finished")}
            className={`neo-button ${activeTab === "finished"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground"
              }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Finished Goods
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`neo-button ${activeTab === "raw"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground"
              }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Raw Materials
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>
        ) : (
          <>
            {/* Finished Goods */}
            {activeTab === "finished" && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFinished.map((item) => (
                    <div
                      key={item.product_id}
                      className={`neo-card p-4 ${item.quantity <= 10 ? "border-destructive" : ""
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.emoji || "📦"}</span>
                          <div>
                            <h3 className="font-display font-bold text-sm">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">KES {item.price}</p>
                          </div>
                        </div>
                        {item.quantity <= 10 && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Stock Level</span>
                        <span
                          className={`text-2xl font-display font-bold ${item.quantity <= 10 ? "text-destructive" : "text-foreground"
                            }`}
                        >
                          {item.quantity}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdjustment("finished", item.product_id, -10, item.name)}
                            className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                          >
                            <Minus className="w-3 h-3" />
                            -10
                          </button>
                          <button
                            onClick={() => handleAdjustment("finished", item.product_id, 10, item.name)}
                            className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            +10
                          </button>
                          <button
                            onClick={() => handleRecordWaste(item.product_id, item.name)}
                            className="neo-button bg-destructive text-destructive-foreground flex-1 text-xs"
                          >
                            Waste
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-2">
                        Updated: {new Date(item.last_updated).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : viewMode === "table" ? (
                <div className="neo-card overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-3 font-semibold">Product</th>
                        <th className="p-3 font-semibold">Price</th>
                        <th className="p-3 font-semibold">Stock</th>
                        <th className="p-3 font-semibold">Status</th>
                        {isAdmin && <th className="p-3 font-semibold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinished.map((item) => (
                        <tr key={item.product_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.emoji || "📦"}</span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-3">KES {item.price}</td>
                          <td className="p-3 font-mono font-bold">{item.quantity}</td>
                          <td className="p-3">
                            {item.quantity <= 10 && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="p-3">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleAdjustment("finished", item.product_id, -10, item.name)} className="p-1 hover:bg-muted rounded" title="-10"><Minus className="w-3 h-3" /></button>
                                <button onClick={() => handleAdjustment("finished", item.product_id, 10, item.name)} className="p-1 hover:bg-muted rounded" title="+10"><Plus className="w-3 h-3" /></button>
                                <button onClick={() => handleRecordWaste(item.product_id, item.name)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Record Waste"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : viewMode === "excel" ? (
                <div className="neo-card overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-2 border-r font-semibold w-[50px]">ID</th>
                        <th className="p-2 border-r font-semibold">Product Name</th>
                        <th className="p-2 border-r font-semibold">Price</th>
                        <th className="p-2 border-r font-semibold">Stock</th>
                        <th className="p-2 border-r font-semibold">Status</th>
                        <th className="p-2 border-r font-semibold">Last Updated</th>
                        {isAdmin && <th className="p-2 font-semibold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinished.map((item) => (
                        <tr key={item.product_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-2 border-r font-mono text-muted-foreground">{item.product_id}</td>
                          <td className="p-2 border-r font-medium">
                            <div className="flex items-center gap-2">
                              <span>{item.emoji}</span>
                              {item.name}
                            </div>
                          </td>
                          <td className="p-2 border-r font-mono">KES {item.price}</td>
                          <td className="p-2 border-r font-mono font-bold">{item.quantity}</td>
                          <td className="p-2 border-r">
                            {item.quantity <= 10 ? (
                              <span className="text-destructive font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Low
                              </span>
                            ) : (
                              <span className="text-muted-foreground">OK</span>
                            )}
                          </td>
                          <td className="p-2 border-r text-muted-foreground">{new Date(item.last_updated).toLocaleDateString()}</td>
                          {isAdmin && (
                            <td className="p-2">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleAdjustment("finished", item.product_id, -10, item.name)} className="p-1 hover:bg-muted rounded" title="-10"><Minus className="w-3 h-3" /></button>
                                <button onClick={() => handleAdjustment("finished", item.product_id, 10, item.name)} className="p-1 hover:bg-muted rounded" title="+10"><Plus className="w-3 h-3" /></button>
                                <button onClick={() => handleRecordWaste(item.product_id, item.name)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Record Waste"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="neo-card overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-2 border-r font-semibold w-[50px]">ID</th>
                        <th className="p-2 border-r font-semibold">Ingredient</th>
                        <th className="p-2 border-r font-semibold">Unit</th>
                        <th className="p-2 border-r font-semibold">Quantity</th>
                        <th className="p-2 border-r font-semibold">Threshold</th>
                        <th className="p-2 border-r font-semibold">Status</th>
                        <th className="p-2 border-r font-semibold">Last Updated</th>
                        {isAdmin && <th className="p-2 font-semibold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRaw.map((item) => (
                        <tr key={item.ingredient_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-2 border-r font-mono text-muted-foreground">{item.ingredient_id}</td>
                          <td className="p-2 border-r font-medium">{item.name}</td>
                          <td className="p-2 border-r text-muted-foreground">{item.unit}</td>
                          <td className="p-2 border-r font-mono font-bold">{item.quantity}</td>
                          <td className="p-2 border-r">{item.low_stock_threshold}</td>
                          <td className="p-2 border-r">
                            {item.quantity <= item.low_stock_threshold ? (
                              <span className="text-warning font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Low
                              </span>
                            ) : (
                              <span className="text-muted-foreground">OK</span>
                            )}
                          </td>
                          <td className="p-2 border-r text-muted-foreground">{new Date(item.last_updated).toLocaleDateString()}</td>
                          {isAdmin && (
                            <td className="p-2">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleAdjustment("raw", item.ingredient_id, -50, item.name)} className="p-1 hover:bg-muted rounded" title="-50"><Minus className="w-3 h-3" /></button>
                                <button onClick={() => handleAdjustment("raw", item.ingredient_id, 50, item.name)} className="p-1 hover:bg-muted rounded" title="+50"><Plus className="w-3 h-3" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Raw Materials */}
            {activeTab === "raw" && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRaw.map((item) => (
                    <div
                      key={item.ingredient_id}
                      className={`neo-card p-4 ${item.quantity <= item.low_stock_threshold ? "border-warning" : ""
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-bold text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">Unit: {item.unit}</p>
                        </div>
                        {item.quantity <= item.low_stock_threshold && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Quantity</span>
                        <span
                          className={`text-2xl font-display font-bold ${item.quantity <= item.low_stock_threshold
                            ? "text-warning"
                            : "text-foreground"
                            }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Low Stock Alert</span>
                        <span className="text-xs font-semibold">
                          {item.low_stock_threshold} {item.unit}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdjustment("raw", item.ingredient_id, -50, item.name)}
                            className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                          >
                            <Minus className="w-3 h-3" />
                            -50
                          </button>
                          <button
                            onClick={() => handleAdjustment("raw", item.ingredient_id, 50, item.name)}
                            className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            +50
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-2">
                        Updated: {new Date(item.last_updated).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="neo-card overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-3 font-semibold">Ingredient</th>
                        <th className="p-3 font-semibold">Unit</th>
                        <th className="p-3 font-semibold">Quantity</th>
                        <th className="p-3 font-semibold">Threshold</th>
                        <th className="p-3 font-semibold">Status</th>
                        {isAdmin && <th className="p-3 font-semibold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRaw.map((item) => (
                        <tr key={item.ingredient_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-muted-foreground">{item.unit}</td>
                          <td className="p-3 font-mono font-bold">{item.quantity}</td>
                          <td className="p-3">{item.low_stock_threshold}</td>
                          <td className="p-3">
                            {item.quantity <= item.low_stock_threshold && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="p-3">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleAdjustment("raw", item.ingredient_id, -50, item.name)} className="p-1 hover:bg-muted rounded" title="-50"><Minus className="w-3 h-3" /></button>
                                <button onClick={() => handleAdjustment("raw", item.ingredient_id, 50, item.name)} className="p-1 hover:bg-muted rounded" title="+50"><Plus className="w-3 h-3" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Inventory;
