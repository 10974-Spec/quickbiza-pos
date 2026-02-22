import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ArrowRightLeft, Building2 } from "lucide-react";
import { transfersAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

const Transfers = () => {
  const { openModal } = useModal();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await transfersAPI.getAll();
      setTransfers(data);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (transferId: number, currentStatus: string) => {
    const statusCycle: any = {
      pending: "approved",
      approved: "in_transit",
      in_transit: "completed",
      completed: "completed",
    };

    const newStatus = statusCycle[currentStatus];
    if (!newStatus || newStatus === currentStatus) {
      toast.info("Transfer already completed");
      return;
    }

    try {
      await transfersAPI.updateStatus(transferId, newStatus);
      toast.success(`Transfer status updated to ${newStatus.replace("_", " ")}`);
      fetchTransfers();
    } catch (error: any) {
      console.error("Error updating transfer:", error);
      toast.error(error.response?.data?.error || "Failed to update transfer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in_transit":
        return "bg-info text-info-foreground";
      case "approved":
        return "bg-primary text-primary-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Stock Transfers</h1>
            <p className="text-sm text-muted-foreground">Move inventory between branches</p>
          </div>
          <button
            onClick={() => openModal('TRANSFER', { onSuccess: fetchTransfers })}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            New Transfer
          </button>
        </div>

        {/* Transfers List */}
        <div className="space-y-3">
          {loading ? (
            <div className="neo-card p-12 text-center">
              <p className="text-muted-foreground">Loading transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="neo-card p-12 text-center">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No transfers found</p>
            </div>
          ) : (
            transfers.map((transfer) => (
              <div key={transfer.id} className="neo-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-bold">Transfer #{transfer.id}</h3>
                  <span className={`neo-badge text-xs ${getStatusColor(transfer.status)}`}>
                    {(transfer.status || "pending").toUpperCase().replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{transfer.from_branch_name || `Branch #${transfer.from_branch_id}`}</span>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{transfer.to_branch_name || `Branch #${transfer.to_branch_id}`}</span>
                  </div>
                </div>

                <p className="text-sm mb-2">{transfer.items}</p>
                {transfer.quantity && (
                  <p className="text-xs text-muted-foreground mb-2">Quantity: {transfer.quantity}</p>
                )}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Date: {new Date(transfer.date || transfer.created_at).toLocaleDateString()}</span>
                  {transfer.status !== "completed" && transfer.status !== "cancelled" && (
                    <button
                      onClick={() => handleUpdateStatus(transfer.id, transfer.status)}
                      className="neo-button text-xs"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Transfers;
