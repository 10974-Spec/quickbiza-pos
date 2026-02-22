import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TrendingUp, TrendingDown, Package, AlertTriangle, Clock, Printer } from "lucide-react";
import { salesAPI, inventoryAPI, reportsAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_discounts: number;
  payment_breakdown: Array<{
    method: string;
    count: number;
    total: number;
  }>;
}

interface LowStockItem {
  name: string;
  quantity: number;
  low_stock_threshold?: number;
  emoji?: string;
}

interface RecentSale {
  id: number;
  total: number;
  created_at: string;
  cashier_name: string;
  customer_name?: string;
}

const Index = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<{ raw_materials: LowStockItem[]; finished_goods: LowStockItem[] } | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, alertsData, salesData] = await Promise.all([
        salesAPI.getTodaySummary(),
        inventoryAPI.getAlerts(),
        salesAPI.getAll({ limit: 10 }),
      ]);

      setSummary(summaryData);
      setLowStockAlerts(alertsData);
      setRecentSales(salesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.full_name || user?.username}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                import("sonner").then(({ toast }) => {
                  toast.success("Printing Dashboard Report...");
                  reportsAPI.print({
                    reportType: "Dashboard",
                    reportData: { summary, lowStockAlerts, recentSales }
                  });
                });
              }}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
              disabled={loading}
            >
              <Printer className="w-4 h-4" />
              Export Report
            </button>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Today's Date</p>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Today's Sales</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">{summary?.total_sales || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">transactions</p>
          </div>

          {/* Total Revenue */}
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Revenue</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">KES {summary?.total_revenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">today's earnings</p>
          </div>

          {/* Discounts Given */}
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Discounts</span>
              <TrendingDown className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">KES {summary?.total_discounts?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">total discounts</p>
          </div>

          {/* Low Stock Items */}
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Low Stock</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-display font-bold">
              {(lowStockAlerts?.raw_materials.length || 0) + (lowStockAlerts?.finished_goods.length || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">items need restock</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Methods Breakdown */}
          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Payment Methods
            </h2>
            <div className="space-y-2">
              {summary?.payment_breakdown && summary.payment_breakdown.length > 0 ? (
                summary.payment_breakdown.map((payment) => (
                  <div key={payment.method} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="neo-badge bg-primary text-primary-foreground text-xs capitalize">
                        {payment.method}
                      </span>
                      <span className="text-xs text-muted-foreground">{payment.count} transactions</span>
                    </div>
                    <span className="text-sm font-semibold">KES {payment.total.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No payments today</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Low Stock Alerts
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lowStockAlerts?.finished_goods && lowStockAlerts.finished_goods.length > 0 ? (
                lowStockAlerts.finished_goods.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji || '📦'}</span>
                      <span className="text-xs font-semibold">{item.name}</span>
                    </div>
                    <span className="neo-badge bg-destructive text-destructive-foreground text-xs">
                      {item.quantity} left
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">All products well stocked</p>
              )}
              {lowStockAlerts?.raw_materials && lowStockAlerts.raw_materials.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground mt-3">Raw Materials</p>
                  {lowStockAlerts.raw_materials.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-warning/10 rounded-lg border border-warning/20">
                      <span className="text-xs font-semibold">{item.name}</span>
                      <span className="neo-badge bg-warning text-warning-foreground text-xs">
                        {item.quantity} units
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Transactions
          </h2>
          <div className="space-y-2">
            {recentSales && recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">#{sale.id}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">
                        {sale.customer_name || 'Walk-in Customer'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(sale.created_at)} at {formatTime(sale.created_at)} • {sale.cashier_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">KES {sale.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
