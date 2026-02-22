import { useState, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { AppLayout } from "@/components/AppLayout";
import { RotateCcw, AlertCircle, CheckCircle2, Package, Search, Filter, ClipboardList } from "lucide-react";
import { returnsAPI } from "@/services/api";
import api from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { X } from "lucide-react";



const Returns = () => {
    const { openModal } = useModal();
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await returnsAPI.getAll();
            setReturns(data);
        } catch (error) {
            console.error("Error fetching returns:", error);
            toast.error("Failed to load returns");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Returns Management</h1>
                        <p className="text-muted-foreground mt-1">Process and track item returns</p>
                    </div>
                    <button
                        onClick={() => openModal('RETURN', { onSuccess: fetchReturns })}
                        className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        New Return
                    </button>
                </div>

                {/* Returns List */}
                <div className="neo-card p-0 overflow-hidden">
                    <div className="p-4 border-b-2 border-border bg-muted/20 flex items-center justify-between">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                            <ClipboardList className="w-5 h-5" />
                            Recent Returns
                        </h3>
                    </div>

                    <div className="divide-y-2 border-border">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground">Loading returns...</div>
                        ) : returns.length === 0 ? (
                            <div className="p-12 text-center">
                                <RotateCcw className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                                <p className="text-muted-foreground">No returns recorded yet</p>
                            </div>
                        ) : (
                            returns.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-muted/10 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg border-2 border-border ${item.type === 'finished' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{item.item_name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="capitalize px-2 py-0.5 rounded-full border border-border bg-background text-xs font-bold">
                                                        {item.type === 'finished' ? 'Product' : 'Ingredient'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display font-bold text-xl text-green-600">+{item.quantity_change}</p>
                                            <p className="text-xs font-bold text-muted-foreground uppercase">{item.notes}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground pl-[3.25rem]">
                                        Processed by <span className="font-bold text-foreground">{item.created_by_name}</span>
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

export default Returns;
