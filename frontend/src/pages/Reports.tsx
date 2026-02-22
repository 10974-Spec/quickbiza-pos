import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";
import { reportsAPI } from "@/services/api";
import { toast } from "sonner";


import { useModal } from "@/context/ModalContext";

const Reports = () => {
  const { openModal } = useModal();
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    end_date: new Date().toISOString().split('T')[0], // Today
  });
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateFinancialReport = async () => {
    try {
      setLoading(true);
      const data = await reportsAPI.financial(dateRange);
      setFinancialData(data);
      toast.success("Financial report generated!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (reportType: string) => {
    try {
      setLoading(true);
      let data;

      switch (reportType) {
        case "Sales Report":
          data = await reportsAPI.sales(dateRange);
          openModal('REPORT_VIEWER', { reportType: reportType, reportData: data });
          toast.success("Sales report generated!");
          break;
        case "Inventory Report":
          data = await reportsAPI.inventory();
          openModal('REPORT_VIEWER', { reportType: reportType, reportData: data });
          toast.success("Inventory report generated!");
          break;
        case "Financial Report":
          await generateFinancialReport();
          return;
        case "Product Performance":
          data = await reportsAPI.products(dateRange);
          openModal('REPORT_VIEWER', { reportType: reportType, reportData: data });
          toast.success("Product performance report generated!");
          break;
        case "Customer Analytics":
          data = await reportsAPI.customers();
          openModal('REPORT_VIEWER', { reportType: reportType, reportData: data });
          toast.success("Customer analytics generated!");
          break;
        case "Expense Analysis":
          data = await reportsAPI.expenses(dateRange);
          openModal('REPORT_VIEWER', { reportType: reportType, reportData: data });
          toast.success("Expense analysis generated!");
          break;
        default:
          toast.info("Report viewer coming soon!");
      }
    } catch (error: any) {
      console.error(`Error generating ${reportType}:`, error);
      toast.error(error.response?.data?.error || `Failed to generate ${reportType}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!financialData) {
      toast.error("Please generate a financial report first");
      return;
    }

    const reportText = `
QUICKBIZA POS - FINANCIAL REPORT
Period: ${dateRange.start_date} to ${dateRange.end_date}
Generated: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INCOME STATEMENT

Revenue:                    KES ${financialData.revenue?.toLocaleString() || 0}
Cost of Goods Sold:         KES ${financialData.cost_of_goods?.toLocaleString() || 0}
                           ────────────────────────
Gross Profit:               KES ${financialData.gross_profit?.toLocaleString() || 0}

Operating Expenses:         KES ${financialData.operating_expenses?.toLocaleString() || 0}
                           ────────────────────────
Net Profit:                 KES ${financialData.net_profit?.toLocaleString() || 0}

Profit Margin:              ${financialData.profit_margin || 0}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${dateRange.start_date}-to-${dateRange.end_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Business insights and financial reports</p>
          </div>
          <button
            onClick={exportReport}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            disabled={loading || !financialData}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="neo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-2">From Date</label>
              <input
                type="date"
                className="neo-input w-full"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-2">To Date</label>
              <input
                type="date"
                className="neo-input w-full"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <button
              onClick={generateFinancialReport}
              className="neo-button bg-primary text-primary-foreground"
              disabled={loading}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {financialData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="neo-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-display font-bold">
                KES {financialData.revenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="neo-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold">
                KES {financialData.gross_profit?.toLocaleString() || 0}
              </p>
            </div>
            <div className="neo-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Expenses</span>
                <TrendingUp className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-2xl font-display font-bold">
                KES {financialData.operating_expenses?.toLocaleString() || 0}
              </p>
            </div>
            <div className="neo-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Net Profit</span>
                <TrendingUp className="w-4 h-4 text-info" />
              </div>
              <p className="text-2xl font-display font-bold">
                KES {financialData.net_profit?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-info mt-1">{financialData.profit_margin}% margin</p>
            </div>
          </div>
        )}

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Sales Report", desc: "Daily, weekly, monthly sales analysis", icon: BarChart3 },
            { title: "Inventory Report", desc: "Stock levels and movement", icon: BarChart3 },
            { title: "Financial Report", desc: "P&L, balance sheet, cash flow", icon: BarChart3 },
            { title: "Product Performance", desc: "Best sellers and slow movers", icon: BarChart3 },
            { title: "Customer Analytics", desc: "Customer behavior and loyalty", icon: BarChart3 },
            { title: "Expense Analysis", desc: "Cost breakdown and trends", icon: BarChart3 },
          ].map((report, idx) => (
            <div key={idx} className="neo-card p-4">
              <report.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{report.desc}</p>
              <button
                onClick={() => viewReport(report.title)}
                className="neo-button text-xs w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : "View Report"}
              </button>
            </div>
          ))}
        </div>
      </div>


    </AppLayout>
  );
};

export default Reports;
