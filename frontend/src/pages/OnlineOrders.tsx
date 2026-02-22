import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ShoppingBag, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const OnlineOrders = () => {
  const [orders, setOrders] = useState([
    { id: 1, customer: "Alice Johnson", phone: "0712345678", items: "2x Chocolate Cake, 1x Croissant", total: 3200, delivery: "Westlands", status: "pending" },
    { id: 2, customer: "Bob Smith", phone: "0723456789", items: "1x Wedding Cake", total: 15000, delivery: "Karen", status: "in_transit" },
    { id: 3, customer: "Carol White", phone: "0734567890", items: "6x Cupcakes", total: 900, delivery: "Kilimani", status: "delivered" },
  ]);

  const handleUpdateStatus = (orderId: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const statusCycle: any = { pending: "in_transit", in_transit: "delivered", delivered: "delivered" };
        const newStatus = statusCycle[order.status];
        toast.success(`Order #${orderId} status updated to ${newStatus.replace("_", " ")}`);
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Online Orders</h1>
          <p className="text-sm text-muted-foreground">Website and WhatsApp orders with delivery</p>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="neo-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold">Order #{order.id}</h3>
                  <p className="text-sm">{order.customer}</p>
                </div>
                <span className={`neo-badge text-xs ${order.status === "delivered" ? "bg-success text-success-foreground" :
                  order.status === "in_transit" ? "bg-info text-info-foreground" :
                    "bg-warning text-warning-foreground"
                  }`}>
                  {order.status.toUpperCase().replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                  <span>{order.items}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>{order.delivery}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-muted">
                <span className="text-sm font-bold">KES {order.total.toLocaleString()}</span>
                <button
                  onClick={() => handleUpdateStatus(order.id)}
                  className="neo-button text-xs"
                  disabled={order.status === "delivered"}
                >
                  {order.status === "delivered" ? "Delivered" : "Update Status"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default OnlineOrders;
