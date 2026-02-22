import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, Plus, Minus, Trash2, Percent, Pause, RotateCcw } from "lucide-react";
import { productsAPI, salesAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface Product {
  id: number;
  name: string;
  price: number;
  category_name: string;
  emoji: string;
  stock: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

const POS = () => {
  const { openModal } = useModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data);

      // Extract unique categories
      const uniqueCategories = ["All", ...Array.from(new Set(data.map((p: Product) => p.category_name).filter(Boolean)))] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category_name === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    // Check stock availability
    const cartQty = cart.find(item => item.id === product.id)?.qty || 0;
    if (cartQty >= product.stock) {
      toast.error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, category: product.category_name }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    const product = products.find(p => p.id === id);
    const currentQty = cart.find(item => item.id === id)?.qty || 0;

    if (product && delta > 0 && currentQty >= product.stock) {
      toast.error(`Maximum stock reached for this product`);
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const handlePaymentComplete = () => {
    toast.success("Payment completed successfully!");
    clearCart();
    fetchProducts(); // Refresh products to update stock
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      // Create sale
      const saleData = {
        items: cart,
        discount_percent: discount,
      };

      const response = await salesAPI.create(saleData);

      toast.success("Sale created! Please select payment method");

      // Open Global Payment Modal
      openModal('PAYMENT', {
        saleId: response.sale_id,
        total: total,
        onPaymentComplete: handlePaymentComplete
      });

    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast.error(error.response?.data?.error || "Failed to create sale");
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)] animate-fade-up">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              className="neo-input w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`neo-button text-xs whitespace-nowrap ${activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-max">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="neo-card p-3 text-left flex flex-col items-center gap-2"
                  disabled={product.stock === 0}
                >
                  <span className="text-3xl">{product.emoji}</span>
                  <span className="text-xs font-display font-semibold text-center leading-tight">
                    {product.name}
                  </span>
                  <span className="neo-badge bg-secondary text-secondary-foreground text-[10px]">
                    KES {product.price}
                  </span>
                  <span className={`text-[10px] ${product.stock <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Stock: {product.stock}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-80 xl:w-96 neo-card-flat flex flex-col min-h-0 max-h-[calc(100vh-5rem)]">
          {/* Cart Header */}
          <div className="p-3 border-b-2 border-foreground flex items-center justify-between">
            <h2 className="font-display font-bold text-sm">Current Sale</h2>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-muted rounded" title="Hold Sale">
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded" title="Refund">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={clearCart} className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded" title="Clear">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Tap products to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      KES {item.price} × {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-foreground bg-card hover:bg-muted text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-foreground bg-card hover:bg-muted text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs font-bold">KES {item.price * item.qty}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t-2 border-foreground p-3 space-y-2">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <Percent className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="neo-input text-xs w-16 p-1 text-center"
                placeholder="%"
              />
              <span className="text-xs text-muted-foreground">discount</span>
              {discount > 0 && (
                <span className="text-xs text-destructive ml-auto">-KES {discountAmount.toLocaleString()}</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm font-semibold">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-muted pt-2">
              <span className="font-display font-bold">Total</span>
              <span className="text-xl font-display font-bold text-primary">
                KES {total.toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="neo-button bg-primary text-primary-foreground w-full text-sm flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Simple cart icon component
const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

export default POS;
