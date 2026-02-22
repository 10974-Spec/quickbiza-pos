import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DollarSign, TrendingUp, Plus } from "lucide-react";
import { expensesAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

const Expenses = () => {
  const { openModal } = useModal();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll({ limit: 50 });
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc: any, expense) => {
    const cat = expense.category || "other";
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += expense.amount || 0;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]: any) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track business expenses</p>
          </div>
          <button
            onClick={() => openModal('EXPENSE', { onSuccess: fetchExpenses })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Expenses</span>
              <DollarSign className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-display font-bold">KES {totalExpenses.toLocaleString()}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Records</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold">{expenses.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Categories</span>
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">{categoryBreakdown.length}</p>
          </div>
        </div>

        {/* Expense Categories */}
        {categoryBreakdown.length > 0 && (
          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-4">Expense Breakdown</h2>
            <div className="space-y-2">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{item.category}</span>
                    <span>KES {item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-foreground">
                    <div
                      className="bg-destructive h-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4">Recent Expenses</h2>
          <div className="space-y-2">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
            ) : (
              expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="neo-badge bg-destructive text-destructive-foreground text-xs">
                        {expense.category || "other"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(expense.date || expense.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{expense.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">KES {(expense.amount || 0).toLocaleString()}</span>
                    <button
                      onClick={() => openModal('EXPENSE', { expense, onSuccess: fetchExpenses })}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;
