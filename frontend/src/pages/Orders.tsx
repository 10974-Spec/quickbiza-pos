import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Package, Search, Filter, Eye } from "lucide-react";
import { ordersAPI } from "@/services/api";
import { toast } from "sonner";


interface Order {
  id: number;
  customer_name: string;
  product_name: string;
  quantity: number;
  total_price: number;
  deposit_paid: number;
  pickup_date: string;
  status: "pending" | "in_production" | "ready" | "completed" | "cancelled";
  created_at: string;
}

import { useModal } from "@/context/ModalContext";

const Orders = () => {
  const { openModal } = useModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const data = await ordersAPI.getAll(params);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "in_production":
        return "bg-info text-info-foreground";
      case "ready":
        return "bg-success text-success-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    return status.replace("_", " ").toUpperCase();
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Custom Orders</h1>
            <p className="text-sm text-muted-foreground">Manage custom cake orders and pickups</p>
          </div>
          <button
            onClick={() => openModal('NEW_ORDER', { onSuccess: fetchOrders })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            New Order
          </button>
        </div>

        {/* Filters */}
        <div className="neo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by customer or product..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="neo-input w-full sm:w-48"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="neo-card p-12 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="neo-card p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="neo-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold">Order #{order.id}</h3>
                      <span className={`neo-badge text-xs ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <button className="neo-button text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="text-sm font-semibold">{order.product_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-sm font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Price</p>
                    <p className="text-sm font-semibold">KES {order.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Date</p>
                    <p className="text-sm font-semibold">
                      {new Date(order.pickup_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-muted">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Deposit: </span>
                    <span className="font-semibold">KES {order.deposit_paid.toLocaleString()}</span>
                    <span className="text-muted-foreground"> / Balance: </span>
                    <span className="font-semibold text-warning">
                      KES {(order.total_price - order.deposit_paid).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Order Modal */}

    </AppLayout>
  );
};

export default Orders;
