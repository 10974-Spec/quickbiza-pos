import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Factory, TrendingUp, Package, AlertCircle, Plus, Search, Check, Save } from "lucide-react";
import { productsAPI } from "@/services/api";
import { productionAPI, Ingredient, RecipeItem } from "@/services/production";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  stock: number;
}

const Production = () => {
  const [activeTab, setActiveTab] = useState<"daily" | "recipes" | "history">("daily");

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily Production Form State
  const [prodProductId, setProdProductId] = useState<number>(0);
  const [prodQuantity, setProdQuantity] = useState<number>(1);
  const [prodFeasibility, setProdFeasibility] = useState<any>(null);
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);

  // Recipe Form State
  const [recipeProductId, setRecipeProductId] = useState<number>(0);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeItem[]>([]);

  // New Ingredient State
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("kg");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, ings, hist] = await Promise.all([
        productsAPI.getAll(),
        productionAPI.getIngredients(),
        productionAPI.getLogs()
      ]);
      setProducts(prods);
      setIngredients(ings);
      setLogs(hist);
      if (prods.length > 0) {
        setProdProductId(prods[0].id);
        setRecipeProductId(prods[0].id);
      }
    } catch (err) {
      toast.error("Failed to load production data");
    } finally {
      setLoading(false);
    }
  };

  // ─── DAILY PRODUCTION ───────────────────────────────────────────────────
  useEffect(() => {
    if (prodProductId > 0 && prodQuantity > 0) {
      checkFeasibility();
    }
  }, [prodProductId, prodQuantity]);

  const checkFeasibility = async () => {
    setCheckingFeasibility(true);
    try {
      const res = await productionAPI.checkFeasibility(prodProductId, prodQuantity);
      setProdFeasibility(res);
    } catch (err: any) {
      setProdFeasibility({ error: err.response?.data?.error || "Error checking recipe" });
    } finally {
      setCheckingFeasibility(false);
    }
  };

  const handleRecordProduction = async () => {
    if (!prodFeasibility?.canProduce) {
      toast.error("Cannot produce: Insufficient raw materials");
      return;
    }
    try {
      await productionAPI.recordProduction({
        product_id: prodProductId,
        quantity: prodQuantity,
        notes: `Produced on ${new Date().toLocaleDateString()}`
      });
      toast.success("Production recorded successfully!");
      setProdQuantity(1);
      fetchData(); // refresh stock and logs
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to record production");
    }
  };

  // ─── RECIPES ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (recipeProductId > 0) {
      loadRecipe(recipeProductId);
    }
  }, [recipeProductId]);

  const loadRecipe = async (pid: number) => {
    try {
      const rec = await productionAPI.getRecipe(pid);
      setCurrentRecipe(rec);
    } catch (err) {
      toast.error("Failed to load recipe");
    }
  };

  const handleAddRecipeItem = () => {
    if (ingredients.length === 0) return;
    setCurrentRecipe([...currentRecipe, { product_id: recipeProductId, ingredient_id: ingredients[0].id, quantity_required: 1 }]);
  };

  const handleRecipeItemChange = (index: number, field: string, value: any) => {
    const updated = [...currentRecipe];
    (updated[index] as any)[field] = value;
    setCurrentRecipe(updated);
  };

  const handleRemoveRecipeItem = (index: number) => {
    const updated = currentRecipe.filter((_, i) => i !== index);
    setCurrentRecipe(updated);
  };

  const handleSaveRecipe = async () => {
    try {
      await productionAPI.saveRecipe(recipeProductId, currentRecipe);
      toast.success("Recipe / BOM saved successfully");
    } catch (err) {
      toast.error("Failed to save recipe");
    }
  };

  const handleCreateIngredient = async () => {
    if (!newIngredientName) return;
    try {
      const ing = await productionAPI.createIngredient({ name: newIngredientName, unit: newIngredientUnit });
      toast.success("Ingredient added");
      setIngredients([...ingredients, ing]);
      setNewIngredientName("");
    } catch (err) {
      toast.error("Failed to add ingredient");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Production & BOM</h1>
            <p className="text-sm text-muted-foreground">Manage recipes and manufacture products</p>
          </div>

          <div className="flex bg-muted p-1 rounded-lg border-2 border-border w-fit">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'daily' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
            >
              Daily Production
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'recipes' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
            >
              Recipes & BOM
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'history' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
            >
              History
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Production Runs</span>
              <Factory className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{logs.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Units Produced</span>
              <Package className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">{logs.reduce((sum, l) => sum + l.quantity_produced, 0)}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Raw Materials Registered</span>
              <TrendingUp className="w-4 h-4 text-info" />
            </div>
            <p className="text-2xl font-display font-bold">{ingredients.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading production data...</div>
        ) : (
          <>
            {/* VIEW: DAILY PRODUCTION */}
            {activeTab === "daily" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neo-card p-6 border-2 border-primary">
                  <h2 className="font-display font-bold mb-4 text-lg">Record Production</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2">Select Product to Produce</label>
                      <select
                        className="neo-input w-full"
                        value={prodProductId}
                        onChange={(e) => setProdProductId(Number(e.target.value))}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2">Quantity to Produce</label>
                      <input
                        type="number"
                        min="1"
                        className="neo-input w-full"
                        value={prodQuantity}
                        onChange={(e) => setProdQuantity(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="neo-card p-6 bg-muted/30">
                  <h2 className="font-display font-bold mb-4 text-lg">Material Feasibility Check</h2>

                  {checkingFeasibility ? (
                    <div className="text-muted-foreground text-sm">Checking raw materials...</div>
                  ) : prodFeasibility?.error ? (
                    <div className="p-4 bg-warning/20 text-warning border-2 border-warning rounded-lg text-sm">
                      <AlertCircle className="w-5 h-5 mb-2" />
                      {prodFeasibility.error}
                    </div>
                  ) : prodFeasibility ? (
                    <div className="space-y-4">
                      {prodFeasibility.details.map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-card border-2 border-border rounded">
                          <div>
                            <span className="font-semibold text-sm">{f.name}</span>
                            <div className="text-xs text-muted-foreground">Requires {f.required} {f.unit}</div>
                          </div>
                          <div className={`text-right text-sm font-bold ${f.isSufficient ? 'text-success' : 'text-destructive'}`}>
                            Have: {f.available} {f.unit}
                            {!f.isSufficient && <span className="block text-xs">Short: {f.required - f.available}</span>}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleRecordProduction}
                        disabled={!prodFeasibility.canProduce}
                        className={`neo-button w-full flex justify-center items-center gap-2 ${prodFeasibility.canProduce ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                      >
                        {prodFeasibility.canProduce ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {prodFeasibility.canProduce ? 'Record Production & Deduct Inventory' : 'Cannot Produce (Missing Materials)'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">Select product and quantity to check feasibility.</div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: RECIPES & BOM */}
            {activeTab === "recipes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neo-card p-6">
                  <h2 className="font-display font-bold mb-4 text-lg">Manage Recipe (BOM)</h2>
                  <div className="mb-6">
                    <label className="block text-xs font-semibold mb-2">Select Product</label>
                    <select
                      className="neo-input w-full"
                      value={recipeProductId}
                      onChange={(e) => setRecipeProductId(Number(e.target.value))}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <h3 className="font-bold text-sm mb-3">Materials Required (for 1 unit)</h3>
                  <div className="space-y-3 mb-4">
                    {currentRecipe.length === 0 && <p className="text-muted-foreground text-sm">No ingredients added yet.</p>}
                    {currentRecipe.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          className="neo-input flex-1"
                          value={item.ingredient_id}
                          onChange={(e) => handleRecipeItemChange(index, 'ingredient_id', Number(e.target.value))}
                        >
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          className="neo-input w-24"
                          value={item.quantity_required}
                          onChange={(e) => handleRecipeItemChange(index, 'quantity_required', Number(e.target.value))}
                          placeholder="Qty"
                        />
                        <button onClick={() => handleRemoveRecipeItem(index)} className="neo-button bg-destructive text-destructive-foreground px-3">X</button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleAddRecipeItem} className="neo-button bg-secondary text-secondary-foreground flex-1 flex justify-center items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Material
                    </button>
                    <button onClick={handleSaveRecipe} className="neo-button bg-primary text-primary-foreground flex-1 flex justify-center items-center gap-2">
                      <Save className="w-4 h-4" /> Save Recipe
                    </button>
                  </div>
                </div>

                <div className="neo-card p-6">
                  <h2 className="font-display font-bold mb-4 text-lg">Raw Materials Database</h2>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Material Name (e.g. Flour)"
                      className="neo-input flex-1"
                      value={newIngredientName}
                      onChange={e => setNewIngredientName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Unit (kg, L, g)"
                      className="neo-input w-20"
                      value={newIngredientUnit}
                      onChange={e => setNewIngredientUnit(e.target.value)}
                    />
                    <button onClick={handleCreateIngredient} className="neo-button bg-primary text-primary-foreground">Add</button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b border-border sticky top-0">
                        <tr>
                          <th className="p-2 font-semibold">Name</th>
                          <th className="p-2 font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.map(ing => (
                          <tr key={ing.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="p-2">{ing.name}</td>
                            <td className="p-2 text-muted-foreground">{ing.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: HISTORY */}
            {activeTab === "history" && (
              <div className="neo-card overflow-hidden">
                {logs.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">No production logs found.</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-3 font-semibold">Date & Time</th>
                        <th className="p-3 font-semibold">Product</th>
                        <th className="p-3 font-semibold">Qty Produced</th>
                        <th className="p-3 font-semibold">Produced By</th>
                        <th className="p-3 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="p-3 font-medium">{log.product_name}</td>
                          <td className="p-3 font-bold text-success">+{log.quantity_produced}</td>
                          <td className="p-3 text-muted-foreground">{log.user_name || 'System'}</td>
                          <td className="p-3 text-muted-foreground text-xs">{log.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Production;
