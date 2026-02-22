import { AppLayout } from "@/components/AppLayout";
import { Calculator, TrendingUp, DollarSign, FileText } from "lucide-react";

const Accounting = () => {
  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Accounting</h1>
          <p className="text-sm text-muted-foreground">Financial records and tax management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Revenue (MTD)</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">KES 1.2M</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Expenses (MTD)</span>
              <DollarSign className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-display font-bold">KES 450K</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Net Profit</span>
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">KES 750K</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">VAT Payable</span>
              <FileText className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">KES 120K</p>
          </div>
        </div>

        {/* Accounting Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "General Ledger", desc: "Chart of accounts and journal entries" },
            { title: "Accounts Receivable", desc: "Customer invoices and payments" },
            { title: "Accounts Payable", desc: "Supplier bills and payments" },
            { title: "Tax Management", desc: "VAT returns and tax filings" },
            { title: "Bank Reconciliation", desc: "Match transactions with bank statements" },
            { title: "Financial Statements", desc: "P&L, Balance Sheet, Cash Flow" },
          ].map((module, idx) => (
            <div key={idx} className="neo-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <Calculator className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-1">{module.title}</h3>
              <p className="text-xs text-muted-foreground">{module.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Accounting;
