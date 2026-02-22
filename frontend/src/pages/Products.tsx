import { useState, useEffect } from "react";
import { useViewMode } from "@/hooks/useViewMode";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Search, Edit, Trash2, Package, LayoutGrid, List, FileSpreadsheet } from "lucide-react";
import { productsAPI, categoriesAPI } from "@/services/api";
import { toast } from "sonner";


interface Product {
  id: number;
  name: string;
  price: number;
  category_name: string;
  category_id: number;
  emoji: string;
  stock: number;
  barcode?: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
}

import { useModal } from "@/context/ModalContext";

import { CategoryModal } from "@/components/CategoryModal";

import DataImport from "@/components/DataImport";
import { Upload } from "lucide-react";

const Products = () => {
  const { openModal } = useModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  /* Removed local modal logic */

  const handleOpenModal = (product?: Product) => {
    openModal('PRODUCT', {
      product: product || null,
      onSuccess: fetchData
    });
  };



  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await productsAPI.delete(id);
      toast.success("Product deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const { viewMode, setViewMode } = useViewMode();

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="neo-button bg-accent text-accent-foreground flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="neo-button bg-secondary text-secondary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="neo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="neo-input w-full sm:w-48"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
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


        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="neo-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{product.emoji || "📦"}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-1.5 hover:bg-muted rounded"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.category_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="neo-badge bg-primary text-primary-foreground text-xs">
                      KES {product.price}
                    </span>
                    <span className={`text-xs ${product.stock <= 10 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="neo-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Product</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Price</th>
                    <th className="p-3 font-semibold">Stock</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{product.emoji || "📦"}</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{product.category_name}</td>
                      <td className="p-3">KES {product.price}</td>
                      <td className="p-3">
                        <span className={`font-mono font-bold ${product.stock <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenModal(product)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(product.id, product.name)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchData}
      />

      <DataImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="products"
        onSuccess={fetchData}
      />
    </AppLayout>
  );
};

export default Products;
