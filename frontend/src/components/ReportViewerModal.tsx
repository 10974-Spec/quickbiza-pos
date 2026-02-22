import { X, Download } from "lucide-react";
import { DraggableModal } from "./DraggableModal";

interface ReportViewerModalProps {
    open: boolean;
    onClose: () => void;
    reportType: string;
    reportData: any;
}

export default function ReportViewerModal({ open, onClose, reportType, reportData }: ReportViewerModalProps) {
    if (!open || !reportData) return null;

    const exportToCSV = () => {
        let csvContent = "";
        let filename = "";

        switch (reportType) {
            case "Sales Report":
                csvContent = "Date,Transactions,Total Sales,Net Sales,Avg Transaction\n";
                reportData.data?.forEach((row: any) => {
                    csvContent += `${row.date},${row.total_transactions},${row.total_sales},${row.net_sales},${row.avg_transaction}\n`;
                });
                filename = "sales-report.csv";
                break;

            case "Inventory Report":
                csvContent = "Product,Category,Price,Stock Level,Stock Value\n";
                reportData.data?.forEach((row: any) => {
                    csvContent += `${row.name},${row.category},${row.price},${row.stock_level},${row.stock_value}\n`;
                });
                filename = "inventory-report.csv";
                break;

            case "Product Performance":
                csvContent = "Product,Category,Price,Times Sold,Total Quantity,Total Revenue\n";
                reportData.data?.forEach((row: any) => {
                    csvContent += `${row.name},${row.category},${row.price},${row.times_sold},${row.total_quantity},${row.total_revenue}\n`;
                });
                filename = "product-performance.csv";
                break;

            case "Customer Analytics":
                csvContent = "Customer,Phone,Loyalty Points,Total Spent,Last Purchase\n";
                reportData.data?.forEach((row: any) => {
                    csvContent += `${row.name},${row.phone},${row.loyalty_points},${row.total_spent},${row.last_purchase}\n`;
                });
                filename = "customer-analytics.csv";
                break;

            case "Expense Analysis":
                csvContent = "Category,Count,Total,Average,Percentage\n";
                reportData.data?.forEach((row: any) => {
                    csvContent += `${row.category},${row.count},${row.total},${row.average},${row.percentage}%\n`;
                });
                filename = "expense-analysis.csv";
                break;

            default:
                return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderReportContent = () => {
        switch (reportType) {
            case "Sales Report":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Total Sales</p>
                                <p className="text-lg font-bold">KES {reportData.totals?.total_sales?.toLocaleString() || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Transactions</p>
                                <p className="text-lg font-bold">{reportData.totals?.total_transactions || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Avg Transaction</p>
                                <p className="text-lg font-bold">KES {reportData.totals?.avg_transaction?.toFixed(0) || 0}</p>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-background border-b border-border">
                                    <tr>
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-right p-2">Transactions</th>
                                        <th className="text-right p-2">Total Sales</th>
                                        <th className="text-right p-2">Avg</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data?.map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-border">
                                            <td className="p-2">{row.date}</td>
                                            <td className="text-right p-2">{row.total_transactions}</td>
                                            <td className="text-right p-2">KES {row.total_sales?.toLocaleString()}</td>
                                            <td className="text-right p-2">KES {row.avg_transaction?.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case "Inventory Report":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Total Products</p>
                                <p className="text-lg font-bold">{reportData.totals?.total_products || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Stock Value</p>
                                <p className="text-lg font-bold">KES {reportData.totals?.total_stock_value?.toLocaleString() || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Low Stock Items</p>
                                <p className="text-lg font-bold text-destructive">{reportData.totals?.low_stock_items || 0}</p>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-background border-b border-border">
                                    <tr>
                                        <th className="text-left p-2">Product</th>
                                        <th className="text-left p-2">Category</th>
                                        <th className="text-right p-2">Stock</th>
                                        <th className="text-right p-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data?.map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-border">
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.category}</td>
                                            <td className={`text-right p-2 ${row.stock_level < 10 ? 'text-destructive font-bold' : ''}`}>
                                                {row.stock_level}
                                            </td>
                                            <td className="text-right p-2">KES {row.stock_value?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case "Product Performance":
                return (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-background border-b-2 border-foreground">
                                <tr>
                                    <th className="text-left p-2">Product</th>
                                    <th className="text-left p-2">Category</th>
                                    <th className="text-right p-2">Times Sold</th>
                                    <th className="text-right p-2">Quantity</th>
                                    <th className="text-right p-2">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.data?.map((row: any, idx: number) => (
                                    <tr key={idx} className="border-b border-border">
                                        <td className="p-2">{row.name}</td>
                                        <td className="p-2">{row.category}</td>
                                        <td className="text-right p-2">{row.times_sold || 0}</td>
                                        <td className="text-right p-2">{row.total_quantity || 0}</td>
                                        <td className="text-right p-2">KES {row.total_revenue?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "Customer Analytics":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Total Customers</p>
                                <p className="text-lg font-bold">{reportData.totals?.total_customers || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Loyalty Points</p>
                                <p className="text-lg font-bold">{reportData.totals?.total_loyalty_points?.toLocaleString() || 0}</p>
                            </div>
                            <div className="neo-card p-3">
                                <p className="text-xs text-muted-foreground">Avg Purchase</p>
                                <p className="text-lg font-bold">KES {reportData.totals?.avg_purchase?.toFixed(0) || 0}</p>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-background border-b border-border">
                                    <tr>
                                        <th className="text-left p-2">Customer</th>
                                        <th className="text-left p-2">Phone</th>
                                        <th className="text-right p-2">Points</th>
                                        <th className="text-right p-2">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data?.map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-border">
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.phone}</td>
                                            <td className="text-right p-2">{row.loyalty_points || 0}</td>
                                            <td className="text-right p-2">KES {row.total_spent?.toLocaleString() || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case "Expense Analysis":
                return (
                    <div className="space-y-4">
                        <div className="neo-card p-3 mb-4">
                            <p className="text-xs text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold">KES {reportData.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-background border-b border-border">
                                    <tr>
                                        <th className="text-left p-2">Category</th>
                                        <th className="text-right p-2">Count</th>
                                        <th className="text-right p-2">Total</th>
                                        <th className="text-right p-2">Average</th>
                                        <th className="text-right p-2">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data?.map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-border">
                                            <td className="p-2 capitalize">{row.category}</td>
                                            <td className="text-right p-2">{row.count}</td>
                                            <td className="text-right p-2">KES {row.total?.toLocaleString()}</td>
                                            <td className="text-right p-2">KES {row.average?.toFixed(0)}</td>
                                            <td className="text-right p-2">{row.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default:
                return <p className="text-muted-foreground">No data available</p>;
        }
    };

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={reportType}
            width="800px"
        >
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-end p-2 border-b border-border bg-muted/10">
                    <button
                        onClick={() => {
                            // Call API to print
                            import("@/services/api").then(({ reportsAPI }) => {
                                reportsAPI.print({ reportType, reportData });
                                import("sonner").then(({ toast }) => toast.success("Printing report..."));
                            });
                        }}
                        className="neo-button text-xs flex items-center gap-2 py-1 mr-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print Report
                    </button>
                    <button onClick={exportToCSV} className="neo-button text-xs flex items-center gap-2 py-1">
                        <Download className="w-3 h-3" />
                        Export CSV
                    </button>
                </div>

                <div className="p-4 overflow-auto flex-1">
                    {renderReportContent()}
                </div>
            </div>
        </DraggableModal>
    );
}
