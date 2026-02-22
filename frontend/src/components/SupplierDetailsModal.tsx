import { useState, useEffect } from "react";
import { Download, Truck, Calendar, DollarSign } from "lucide-react";
import { DraggableModal } from "./DraggableModal";
import { suppliersAPI } from "@/services/api";
import { toast } from "sonner";

interface SupplierDetailsModalProps {
    open: boolean;
    onClose: () => void;
    supplierId: number | null;
}

export default function SupplierDetailsModal({ open, onClose, supplierId }: SupplierDetailsModalProps) {
    const [supplier, setSupplier] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && supplierId) {
            fetchSupplierDetails();
        } else {
            setSupplier(null);
        }
    }, [open, supplierId]);

    const fetchSupplierDetails = async () => {
        if (!supplierId) return;
        try {
            setLoading(true);
            // Fetch with high limit for history
            const data = await suppliersAPI.getById(supplierId, { history_limit: 1000 });
            setSupplier(data);
        } catch (error) {
            console.error("Error fetching supplier details:", error);
            toast.error("Failed to load supplier details");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!supplier) return;

        // Create CSV content
        const rows = [
            ["Supplier Report"],
            [`Name: ${supplier.name}`],
            [`Contact Person: ${supplier.contact_person || 'N/A'}`],
            [`Phone: ${supplier.phone}`],
            [`Email: ${supplier.email || 'N/A'}`],
            [`Address: ${supplier.address || 'N/A'}`],
            [""],
            ["Purchase History"],
            ["ID", "Date", "Items", "Total", "Status"]
        ];

        if (supplier.purchases && supplier.purchases.length > 0) {
            supplier.purchases.forEach((purchase: any) => {
                rows.push([purchase.id, new Date(purchase.date).toLocaleDateString(), purchase.item_count || '-', purchase.total_amount, purchase.status]);
            });
        }

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `supplier_report_${supplier.name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title={supplier?.name || "Supplier Details"}
            width="800px"
        >
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold">{supplier?.name || "Loading..."}</h2>
                            <p className="text-xs text-muted-foreground">Supplier ID: #{supplierId}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadReport}
                            className="neo-button text-xs flex items-center gap-1"
                            disabled={!supplier}
                        >
                            <Download className="w-4 h-4" />
                            Report
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Loading supplier history...
                    </div>
                ) : supplier ? (
                    <div className="flex-1 overflow-auto p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Total Purchases</div>
                                <div className="text-lg font-bold">
                                    KES {supplier.purchases?.reduce((acc: number, p: any) => acc + p.total_amount, 0).toLocaleString() || 0}
                                </div>
                            </div>
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Purchase Count</div>
                                <div className="text-lg font-bold text-primary">{supplier.purchases?.length || 0}</div>
                            </div>
                            <div className="neo-card p-4 bg-muted/20">
                                <div className="text-xs text-muted-foreground mb-1">Last Active</div>
                                <div className="text-sm font-semibold">
                                    {supplier.purchases?.[0]?.date
                                        ? new Date(supplier.purchases[0].date).toLocaleDateString()
                                        : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Purchase History
                            </h3>
                            <div className="min-h-[200px]">
                                {supplier.purchases && supplier.purchases.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="p-2 rounded-tl-lg">ID</th>
                                                <th className="p-2">Date</th>
                                                <th className="p-2">Items</th>
                                                <th className="p-2">Status</th>
                                                <th className="p-2 text-right rounded-tr-lg">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplier.purchases.map((purchase: any) => (
                                                <tr key={purchase.id} className="border-b border-border/50 hover:bg-muted/10">
                                                    <td className="p-2">#{purchase.id}</td>
                                                    <td className="p-2">{new Date(purchase.date).toLocaleDateString()}</td>
                                                    <td className="p-2">{purchase.item_count || '-'} items</td>
                                                    <td className="p-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${purchase.status === 'received' ? 'bg-success/20 text-success' :
                                                            purchase.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {purchase.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right font-mono">KES {purchase.total_amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">No purchases found</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </DraggableModal>
    );
}
