import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Users, Search, Plus, Phone, Mail, MapPin, Edit2, Trash2, Eye, LayoutGrid, List, Upload, FileSpreadsheet } from "lucide-react";
import { customersAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";
import { useViewMode } from "@/hooks/useViewMode";
import DataImport from "@/components/DataImport";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_purchases: number;
  last_purchase: string;
  loyalty_points: number;
}

const Customers = () => {
  const { openModal } = useModal();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getAll({ limit: 100 });
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: any) => {
    openModal('CUSTOMER', {
      customer: customer,
      onSuccess: fetchCustomers
    });
  };

  const handleView = (id: number) => {
    openModal('CUSTOMER_DETAILS', { customerId: id });
  };

  const handleDelete = async (id: number) => {
    openModal('CONFIRMATION', {
      title: "Delete Customer?",
      message: "Are you sure you want to delete this customer? This action cannot be undone.",
      variant: 'danger',
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await customersAPI.delete(id);
          toast.success("Customer deleted successfully");
          fetchCustomers();
        } catch (error: any) {
          console.error("Error deleting customer:", error);
          toast.error(error.response?.data?.error || "Failed to delete customer");
        }
      }
    });
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const { viewMode, setViewMode } = useViewMode();

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage customer information and loyalty</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="neo-button bg-accent text-accent-foreground flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => openModal('CUSTOMER', { onSuccess: fetchCustomers })}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="neo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-muted p-1 rounded-lg border-2 border-transparent shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("excel")}
                className={`p-2 rounded-md transition-all ${viewMode === 'excel' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                title="Excel View"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Customers</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{customers.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Purchases</span>
              <Users className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">
              KES {customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Loyalty Points</span>
              <Users className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">
              {customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="neo-card p-12 text-center">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No customers found</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="neo-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-bold">{customer.name}</h3>
                      <p className="text-xs text-muted-foreground">Customer #{customer.id}</p>
                    </div>
                    <span className="neo-badge bg-primary text-primary-foreground text-xs">
                      {customer.loyalty_points || 0} pts
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-muted space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Purchases</span>
                      <span className="font-semibold">KES {(customer.total_purchases || 0).toLocaleString()}</span>
                    </div>
                    {customer.last_purchase && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Last Purchase</span>
                        <span className="font-semibold">
                          {new Date(customer.last_purchase).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t-2 border-border">
                    <button
                      onClick={() => handleView(customer.id)}
                      className="neo-button flex-1 text-xs flex items-center justify-center gap-1 bg-accent/10 hover:bg-accent/20"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="neo-button bg-destructive text-white flex-1 text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="neo-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Contact</th>
                    <th className="p-3 font-semibold">Address</th>
                    <th className="p-3 font-semibold">Purchases</th>
                    <th className="p-3 font-semibold">Loyalty</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">#{customer.id}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span>{customer.phone}</span>
                          <span className="text-xs text-muted-foreground">{customer.email || '-'}</span>
                        </div>
                      </td>
                      <td className="p-3">{customer.address || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">KES {(customer.total_purchases || 0).toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">Last: {customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="neo-badge bg-primary text-primary-foreground text-xs">
                          {customer.loyalty_points || 0} pts
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleView(customer.id)} className="p-1 hover:bg-muted rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleEdit(customer)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(customer.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <DataImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="customers"
        onSuccess={fetchCustomers}
      />
    </AppLayout>
  );
}; export default Customers;
