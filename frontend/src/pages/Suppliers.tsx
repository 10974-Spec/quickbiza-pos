import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Truck, Phone, Mail, MapPin, Edit2, Trash2, Eye, Search, LayoutGrid, List, FileSpreadsheet } from "lucide-react";
import { suppliersAPI } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";
import { useViewMode } from "@/hooks/useViewMode";
import DataImport from "@/components/DataImport";
import { Upload } from "lucide-react";

const Suppliers = () => {
  const { openModal } = useModal();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersAPI.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: any) => {
    openModal('SUPPLIER', { supplier: supplier, onSuccess: fetchSuppliers });
  };

  const handleView = (id: number) => {
    openModal('SUPPLIER_DETAILS', { supplierId: id });
  };

  const handleDelete = async (id: number) => {
    openModal('CONFIRMATION', {
      title: "Delete Supplier?",
      message: "Are you sure you want to delete this supplier? This action cannot be undone.",
      variant: 'danger',
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await suppliersAPI.delete(id);
          toast.success("Supplier deleted successfully");
          fetchSuppliers();
        } catch (error: any) {
          console.error("Error deleting supplier:", error);
          toast.error(error.response?.data?.error || "Failed to delete supplier");
        }
      }
    });
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
    supplier.phone.includes(searchQuery) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const { viewMode, setViewMode } = useViewMode();

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Suppliers</h1>
            <p className="text-sm text-muted-foreground">Manage supplier relationships</p>
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
              onClick={() => openModal('SUPPLIER', { onSuccess: fetchSuppliers })}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Add Supplier
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
                placeholder="Search by name, contact, phone, or email..."
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
              <span className="text-xs text-muted-foreground">Total Suppliers</span>
              <Truck className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{suppliers.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Truck className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">
              {suppliers.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Inactive</span>
              <Truck className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold">
              {suppliers.filter(s => s.status !== 'active').length}
            </p>
          </div>
        </div>

        {/* Suppliers List */}
        {loading ? (
          <div className="neo-card p-12 text-center">
            <p className="text-muted-foreground">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No suppliers found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="neo-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold">{supplier.name}</h3>
                    <p className="text-xs text-muted-foreground">Supplier #{supplier.id}</p>
                  </div>
                  <span className={`neo-badge text-xs ${supplier.status === 'active'
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {supplier.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground font-semibold">Contact:</span>
                      <span>{supplier.contact_person}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t-2 border-border">
                  <button
                    onClick={() => handleView(supplier.id)}
                    className="neo-button flex-1 text-xs flex items-center justify-center gap-1 bg-accent/10 hover:bg-accent/20"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="neo-button flex-1 text-xs flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="neo-button bg-destructive text-white flex-1 text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'table' ? (
          <div className="neo-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Supplier</th>
                  <th className="p-3 font-semibold">Contact</th>
                  <th className="p-3 font-semibold">Phone</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">#{supplier.id}</p>
                      </div>
                    </td>
                    <td className="p-3">{supplier.contact_person || '-'}</td>
                    <td className="p-3">{supplier.phone}</td>
                    <td className="p-3">{supplier.email || '-'}</td>
                    <td className="p-3">
                      <span className={`neo-badge text-xs ${supplier.status === 'active'
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {supplier.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleView(supplier.id)} className="p-1 hover:bg-muted rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleEdit(supplier)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(supplier.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="neo-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-2 border-r font-semibold w-[50px]">ID</th>
                  <th className="p-2 border-r font-semibold">Supplier Name</th>
                  <th className="p-2 border-r font-semibold">Contact Person</th>
                  <th className="p-2 border-r font-semibold">Phone</th>
                  <th className="p-2 border-r font-semibold">Email</th>
                  <th className="p-2 border-r font-semibold">Address</th>
                  <th className="p-2 border-r font-semibold">Status</th>
                  <th className="p-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-2 border-r font-mono text-muted-foreground">#{supplier.id}</td>
                    <td className="p-2 border-r font-medium">{supplier.name}</td>
                    <td className="p-2 border-r">{supplier.contact_person || '-'}</td>
                    <td className="p-2 border-r font-mono">{supplier.phone}</td>
                    <td className="p-2 border-r text-muted-foreground">{supplier.email || '-'}</td>
                    <td className="p-2 border-r text-muted-foreground truncate max-w-[150px]">{supplier.address || '-'}</td>
                    <td className="p-2 border-r">
                      <span className={`neo-badge text-[10px] px-1 py-0.5 ${supplier.status === 'active'
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {supplier.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleView(supplier.id)} className="p-1 hover:bg-muted rounded" title="View"><Eye className="w-3 h-3" /></button>
                        <button onClick={() => handleEdit(supplier)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(supplier.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        }
      </div>

      <DataImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="suppliers"
        onSuccess={fetchSuppliers}
      />
    </AppLayout>
  );
}; export default Suppliers;
