import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Users, Shield, UserCheck, UserX, Plus, Trash2, Eye, Search } from "lucide-react";
import { format } from 'date-fns';
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import api from "@/services/api";
import { useModal } from "@/context/ModalContext";

const Staff = () => {
  const { isAdmin } = useAuth();
  const { openModal } = useModal();

  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState("cashier");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const response = await api.post('/users/invite', { role: inviteRole });
      setGeneratedCode(response.data.code);
      toast.success("Invite code generated!");
    } catch (error: any) {
      console.error("Error generating invite:", error);
      toast.error(error.response?.data?.error || "Failed to generate invite");
    } finally {
      setGeneratingInvite(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setStaffMembers(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      // Fallback to mock data if API not available
      setStaffMembers([
        { id: 1, username: "admin", full_name: "System Administrator", role: "admin", status: "approved" },
        { id: 2, username: "manager1", full_name: "John Manager", role: "manager", status: "approved" },
        { id: 3, username: "cashier1", full_name: "Mary Cashier", role: "cashier", status: "approved" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: 'approved' });
      toast.success("User approved successfully!");
      fetchStaff();
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error(error.response?.data?.error || "Failed to approve user");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: 'rejected' });
      toast.success("User rejected successfully!");
      fetchStaff();
    } catch (error: any) {
      console.error("Error rejecting user:", error);
      toast.error(error.response?.data?.error || "Failed to reject user");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "manager":
        return "bg-primary text-primary-foreground";
      case "cashier":
        return "bg-info text-info-foreground";
      case "baker":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staffMembers.filter((staff) =>
    staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="neo-card p-8 text-center max-w-md">
            <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
            <p className="text-sm text-muted-foreground">
              Only administrators can access staff management.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Staff Management</h1>
            <p className="text-sm text-muted-foreground">Manage users and permissions (Admin Only)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setGeneratedCode(null);
                setInviteRole("cashier");
                setShowInviteModal(true);
              }}
              className="neo-button bg-secondary text-secondary-foreground flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Invite User
            </button>
            <button
              onClick={() => openModal('STAFF', { onSuccess: fetchStaff })}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="neo-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, username, or role..."
              className="neo-input w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Staff</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{staffMembers.length}</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Approved</span>
              <UserCheck className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">
              {staffMembers.filter((s) => s.status === "approved").length}
            </p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Pending</span>
              <UserX className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">
              {staffMembers.filter((s) => s.status === "pending").length}
            </p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Admins</span>
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-display font-bold">
              {staffMembers.filter((s) => s.role === "admin").length}
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        {staffMembers.filter((s) => s.status === "pending").length > 0 && (
          <div className="neo-card p-4 border-warning">
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <UserX className="w-4 h-4 text-warning" />
              Pending Approvals
            </h2>
            <div className="space-y-2">
              {staffMembers
                .filter((s) => s.status === "pending")
                .map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div>
                      <p className="font-semibold text-sm">{staff.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{staff.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(staff.id)}
                        className="neo-button bg-success text-success-foreground text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(staff.id)}
                        className="neo-button bg-destructive text-destructive-foreground text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4">All Staff Members</h2>
          <div className="space-y-2">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading staff...</p>
            ) : filteredStaff.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No staff members found</p>
            ) : (
              filteredStaff.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-4 neo-card hover:translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border-2 border-border bg-primary/10 flex items-center justify-center shadow-sm">
                      <span className="font-bold text-primary text-lg">
                        {staff.full_name.split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">{staff.full_name}</p>
                      <p className="text-sm font-medium text-muted-foreground">@{staff.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Login</p>
                      <p className="text-sm font-bold text-foreground">
                        {staff.last_login
                          ? format(new Date(staff.last_login), 'MMM d, h:mm a')
                          : 'Never'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-border ${getRoleBadgeColor(staff.role)}`}>
                        {staff.role.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-border ${staff.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                      >
                        {staff.status.toUpperCase()}
                      </span>
                      <div className="flex gap-2 pl-2 border-l-2 border-border">
                        <button
                          onClick={() => openModal('USER_DETAILS', { user: staff, onClose: () => { } })}
                          className="p-2 rounded-lg border-2 border-transparent hover:border-border hover:bg-accent/20 transition-all text-foreground"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 rounded-lg border-2 border-transparent hover:border-border hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border-2 border-primary rounded-xl p-6 shadow-2xl animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">Invite New User</h2>
                <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-muted rounded-full">
                  <UserX className="w-5 h-5" />
                </button>
              </div>

              {!generatedCode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Role</label>
                    <select
                      className="neo-input w-full"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="baker">Baker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateInvite}
                    disabled={generatingInvite}
                    className="neo-button w-full bg-primary text-primary-foreground py-3 flex items-center justify-center gap-2"
                  >
                    {generatingInvite ? "Generating..." : "Generate Invite Code"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-muted rounded-xl border-2 border-dashed border-primary/50 relative group">
                    <p className="text-sm text-muted-foreground mb-2">Share this code with the user:</p>
                    <p className="text-3xl font-mono font-bold tracking-widest text-primary selection:bg-primary selection:text-primary-foreground">
                      {generatedCode}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        toast.success("Code copied to clipboard!");
                      }}
                      className="neo-button flex-1 bg-secondary text-secondary-foreground"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedCode(null);
                        setShowInviteModal(false);
                      }}
                      className="neo-button flex-1 bg-muted"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Staff;
