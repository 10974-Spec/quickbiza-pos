import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { BarChart3, RefreshCw, TrendingUp, FileCheck } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Sales Tracking",
    description:
      "Monitor every transaction in real-time, detect trends, and gain actionable insights to grow your revenue across all channels.",
    mockup: "sales",
  },
  {
    icon: RefreshCw,
    title: "Inventory Sync",
    description:
      "Streamline stock management with automated syncing, minimizing errors and boosting efficiency across warehouses.",
    mockup: "inventory",
  },
  {
    icon: TrendingUp,
    title: "Business Intelligence",
    description:
      "QuickBiza accelerates business research with AI-driven analysis, providing real-time insights, sector reports and trend synthesis.",
    mockup: "intelligence",
  },
  {
    icon: FileCheck,
    title: "Order Matching",
    description:
      "Match purchase orders and invoices effortlessly, reduce errors, save time, and cut costs.",
    mockup: "orders",
  },
];

const SalesMockup = () => (
  <div className="bg-secondary/60 rounded-2xl p-4 h-52 flex flex-col gap-3">
    <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 shadow-sm border border-border">
      <BarChart3 className="w-4 h-4 text-primary" />
      <span className="text-xs font-medium text-foreground">Live Dashboard</span>
    </div>
    <div className="flex-1 bg-card rounded-xl p-3 shadow-sm border border-border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Today's Sales</span>
        <span className="text-xs font-bold text-foreground">KES 48,200</span>
      </div>
      <div className="flex gap-1 items-end h-16">
        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
          <div key={i} className="flex-1 bg-primary/20 rounded-sm relative" style={{ height: `${h}%` }}>
            <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm" style={{ height: `${h * 0.7}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">+12% ↑</span>
        <span className="text-[9px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full">Weekly</span>
      </div>
    </div>
  </div>
);

const InventoryMockup = () => (
  <div className="bg-secondary/60 rounded-2xl p-4 h-52 flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <div className="text-[10px] text-muted-foreground font-medium">Incoming Stock</div>
      <div className="text-[10px] text-muted-foreground font-medium">Total Synced</div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray="251" strokeDashoffset="5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Sync Rate</span>
          <span className="text-xl font-bold text-foreground">98%</span>
        </div>
      </div>
    </div>
    <div className="flex gap-2 justify-center">
      <span className="text-[9px] px-2 py-1 bg-secondary text-muted-foreground rounded font-medium">Review Manual</span>
      <span className="text-[9px] px-2 py-1 bg-primary text-primary-foreground rounded font-medium">Run Automation</span>
    </div>
  </div>
);

const IntelligenceMockup = () => (
  <div className="bg-secondary/60 rounded-2xl p-4 h-52 flex flex-col gap-2">
    <div className="bg-card rounded-xl p-3 shadow-sm border border-border flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-3 h-3 text-primary" />
        </div>
        <span className="text-[10px] font-medium text-foreground">Market Analysis</span>
      </div>
      {["Revenue Forecasts", "Real Time Insights", "Trend Reports"].map((label, i) => (
        <div key={i} className="flex items-center gap-2 bg-secondary/80 rounded-lg px-2 py-1.5">
          <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-blue-400" : "bg-emerald-400"}`} />
          <span className="text-[10px] text-foreground">{label}</span>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <span className="text-[9px] px-2 py-1 bg-primary text-primary-foreground rounded-full font-medium">Add Custom Query</span>
      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-[10px]">+</div>
    </div>
  </div>
);

const OrdersMockup = () => (
  <div className="bg-secondary/60 rounded-2xl p-4 h-52 flex flex-col items-center justify-center gap-3">
    <div className="flex items-center gap-6">
      <div className="text-center">
        <FileCheck className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
        <span className="text-[9px] text-muted-foreground block">Purchase Orders</span>
        <span className="text-[10px] font-bold text-foreground">$1,795</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-primary text-lg">✓</span>
      </div>
      <div className="text-center">
        <FileCheck className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
        <span className="text-[9px] text-muted-foreground block">Invoices Received</span>
        <span className="text-[10px] font-bold text-foreground">$1,800</span>
      </div>
    </div>
    <div className="text-center">
      <span className="text-2xl font-bold text-foreground">89%</span>
      <p className="text-[10px] text-muted-foreground">Automated Match Rate</p>
    </div>
    <div className="flex gap-2">
      <span className="text-[9px] px-3 py-1 bg-foreground text-card rounded font-medium">Review Exceptions</span>
      <span className="text-[9px] px-3 py-1 bg-foreground text-card rounded font-medium">Bulk Approve</span>
    </div>
  </div>
);

const mockups: Record<string, React.FC> = {
  sales: SalesMockup,
  inventory: InventoryMockup,
  intelligence: IntelligenceMockup,
  orders: OrdersMockup,
};

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="features" ref={ref} className="py-24 px-4 bg-card">
      <div className="max-w-5xl mx-auto">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {features.map((feature, i) => {
            const Mockup = mockups[feature.mockup];
            return (
              <div
                key={feature.title}
                className="bg-card rounded-3xl border border-border p-6 hover-lift flex flex-col"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Mockup />
                <h3 className="text-2xl font-extrabold text-foreground mt-6 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
