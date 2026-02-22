import { useState, useEffect } from "react";
import { X, Download, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { customersAPI } from "@/services/api";
import { toast } from "sonner";
import { DraggableModal } from "./DraggableModal";

interface CustomerDetailsModalProps {
    open: boolean;
    onClose: () => void;
    customerId: number | null;
}

export default function CustomerDetailsModal({ open, onClose, customerId }: CustomerDetailsModalProps) {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'sales'>('orders');

    useEffect(() => {
        if (open && customerId) {
            fetchCustomerDetails();
        } else {
            setCustomer(null);
        }
    }, [open, customerId]);

    const fetchCustomerDetails = async () => {
        if (!customerId) return;
        try {
            setLoading(true);
            const data = await customersAPI.getById(customerId, { history_limit: 1000 });
            setCustomer(data);
        } catch (error) {
            console.error("Error fetching customer details:", error);
            toast.error("Failed to load customer details");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!customer) return;

        // Create CSV content
        const rows = [
            ["Customer Report"],
            [`Name: ${customer.name}`],
            [`Phone: ${customer.phone}`],
            [`Email: ${customer.email || 'N/A'}`],
            [`Address: ${customer.address || 'N/A'}`],
            [`Loyalty Points: ${customer.loyalty_points}`],
            [""],
            ["Transaction History"],
            ["Type", "ID", "Date", "Total", "Status"]
        ];

        if (customer.orders && customer.orders.length > 0) {
            customer.orders.forEach((order: any) => {
                rows.push(["Order", order.id, new Date(order.created_at).toLocaleDateString(), order.total_amount, order.status]);
            });
        }

        if (customer.sales && customer.sales.length > 0) {
            customer.sales.forEach((sale: any) => {
                rows.push(["Sale", sale.id, new Date(sale.created_at).toLocaleDateString(), sale.total_amount, "Completed"]);
            });
        }

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customer_report_${customer.name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!open) return null;

    return (

        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={customer?.name || "Customer Details"}
            width="800px" // 4xl equivalent roughly
        >
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-primary text-lg">
                                {customer?.name?.charAt(0) || "C"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold">{customer?.name || "Loading..."}</h2>
                            <p className="text-xs text-muted-foreground">Customer ID: #{customerId}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadReport}
                            className="neo-button text-xs flex items-center gap-1"
                            disabled={!customer}
                        >
                            <Download className="w-4 h-4" />
                            Report
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Loading customer history...
                    </div>
                ) : customer ? (
                    <div className="flex-1 overflow-auto">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                                <div className="text-lg font-bold">
                                    KES {(customer.sales?.reduce((acc: number, s: any) => acc + s.total_amount, 0) || 0 +
                                        customer.orders?.reduce((acc: number, o: any) => acc + o.total_amount, 0) || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Loyalty Points</div>
                                <div className="text-lg font-bold text-primary">{customer.loyalty_points || 0}</div>
                            </div>
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Store Credit</div>
                                <div className="text-lg font-bold text-success">KES {customer.store_credit || 0}</div>
                            </div>
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">First Seen</div>
                                <div className="text-sm font-semibold">
                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-4 border-b border-border">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'orders'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Orders ({customer.orders?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('sales')}
                                className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'sales'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Sales ({customer.sales?.length || 0})
                            </button>
                        </div>

                        {/* Content */}
                        <div className="min-h-[200px]">
                            {activeTab === 'orders' && (
                                <div className="space-y-2">
                                    {customer.orders && customer.orders.length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="p-2 rounded-tl-lg">ID</th>
                                                    <th className="p-2">Date</th>
                                                    <th className="p-2">Status</th>
                                                    <th className="p-2 text-right rounded-tr-lg">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.orders.map((order: any) => (
                                                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/10">
                                                        <td className="p-2">#{order.id}</td>
                                                        <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td className="p-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs ${order.status === 'completed' ? 'bg-success/20 text-success' :
                                                                order.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-right font-mono">KES {order.total_amount.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No orders found</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'sales' && (
                                <div className="space-y-2">
                                    {customer.sales && customer.sales.length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="p-2 rounded-tl-lg">ID</th>
                                                    <th className="p-2">Date</th>
                                                    <th className="p-2">Items</th>
                                                    <th className="p-2 text-right rounded-tr-lg">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.sales.map((sale: any) => (
                                                    <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/10">
                                                        <td className="p-2">#{sale.id}</td>
                                                        <td className="p-2">{new Date(sale.created_at).toLocaleDateString()}</td>
                                                        <td className="p-2">{sale.item_count || '-'} items</td>
                                                        <td className="p-2 text-right font-mono">KES {sale.total_amount.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No sales found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </DraggableModal>
    );
}
