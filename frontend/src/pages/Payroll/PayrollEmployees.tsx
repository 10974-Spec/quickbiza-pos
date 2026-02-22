import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Users, Search, Edit, Save, CreditCard, LayoutGrid, List, FileSpreadsheet, Upload, Download, Settings, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import api, { rolesAPI } from "@/services/api";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AppLayout } from "@/components/AppLayout";

interface EmployeePayrollData {
    user_id: number;
    full_name: string;
    role: string;
    email?: string;
    phone?: string;
    profile_picture?: string;
    basic_salary: number;
    bank_name: string;
    account_number: string;
    tax_pin: string;
    nssf_number: string;
    nhif_number: string;
}

const PayrollEmployees = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'excel'>('list');
    const [employees, setEmployees] = useState<EmployeePayrollData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<EmployeePayrollData | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Role Management State
    const [roles, setRoles] = useState<{ id: number; name: string; is_system: number }[]>([]);
    const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    useEffect(() => {
        fetchEmployees();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await rolesAPI.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payroll/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (emp: EmployeePayrollData) => {
        setEditingEmployee({ ...emp });
        setIsEditOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingEmployee) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const baseURL = api.defaults.baseURL?.replace('/api', '') || '';
            setEditingEmployee({ ...editingEmployee, profile_picture: `${baseURL}${res.data.url}` });
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!editingEmployee) return;
        try {
            await api.put(`/payroll/employees/${editingEmployee.user_id}`, editingEmployee);
            toast.success("Employee profile updated successfully");
            setIsEditOpen(false);
            fetchEmployees();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update employee");
        }
    };

    const handleAddRole = async () => {
        if (!newRoleName.trim()) return;
        try {
            await rolesAPI.create({ name: newRoleName });
            toast.success("Role created successfully");
            setNewRoleName('');
            fetchRoles();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create role");
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await rolesAPI.delete(id);
            toast.success("Role deleted successfully");
            fetchRoles();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete role");
        }
    };

    const handleExport = (type: 'csv' | 'excel' | 'pdf' | 'image') => {
        const exportData = filteredEmployees.map(emp => ({
            ID: emp.user_id,
            Name: emp.full_name,
            Role: emp.role,
            Email: emp.email || '-',
            Phone: emp.phone || '-',
            Salary: emp.basic_salary,
            Bank: emp.bank_name || '-',
            Account: emp.account_number || '-',
            KRA: emp.tax_pin || '-',
            NSSF: emp.nssf_number || '-',
            NHIF: emp.nhif_number || '-'
        }));

        if (type === 'excel' || type === 'csv') {
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Employees");
            XLSX.writeFile(wb, `employees_export_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'csv'}`);
            toast.success(`Exported to ${type.toUpperCase()}`);
        } else if (type === 'pdf') {
            const doc = new jsPDF();
            doc.text("Employee Payroll List", 14, 20);

            const tableColumn = ["ID", "Name", "Role", "Phone", "Salary", "Bank", "Account"];
            const tableRows = filteredEmployees.map(emp => [
                emp.user_id,
                emp.full_name,
                emp.role,
                emp.phone || '-',
                emp.basic_salary?.toLocaleString(),
                emp.bank_name || '-',
                emp.account_number || '-'
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
            });
            doc.save("employees_export.pdf");
            toast.success("Exported to PDF");
        } else if (type === 'image') {
            const element = document.getElementById('employee-table-container');
            if (element) {
                html2canvas(element).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'employees_view.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    toast.success("Exported to Image");
                });
            } else {
                toast.error("Could not capture view for image export");
            }
        }
    };

    const filteredEmployees = employees.filter(e =>
        e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Employee Management</h1>
                        <p className="text-sm text-muted-foreground">Manage staff profiles, contact details, and payroll information.</p>
                    </div>
                </div>

                <div className="neo-card p-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('excel')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'excel' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="Excel View"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-lg font-bold flex items-center gap-2 ml-2">
                                <Users className="w-5 h-5 text-primary" />
                                All Employees
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-48 md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Button variant="outline" size="sm" onClick={() => setIsRoleManagerOpen(true)}>
                                <Settings className="w-4 h-4 mr-1" /> Roles
                            </Button>

                            <div className="flex bg-muted p-1 rounded-lg">
                                <button onClick={() => handleExport('csv')} className="p-2 hover:bg-background rounded-md" title="Export CSV">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleExport('pdf')} className="p-2 hover:bg-background rounded-md" title="Export PDF">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleExport('image')} className="p-2 hover:bg-background rounded-md" title="Export Image">
                                    <Upload className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Image</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Basic Salary</TableHead>
                                        <TableHead>Bank Info</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading employees...</TableCell>
                                        </TableRow>
                                    ) : filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <TableRow key={emp.user_id} className="group hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                        {emp.profile_picture ? (
                                                            <img src={emp.profile_picture} alt={emp.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-muted-foreground">
                                                                {emp.full_name?.charAt(0) || 'U'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{emp.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{emp.email || '-'}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">{emp.phone || '-'}</TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs uppercase font-bold border border-blue-200">
                                                        {emp.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {emp.basic_salary ? emp.basic_salary.toLocaleString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        <div className="font-semibold">{emp.bank_name || '-'}</div>
                                                        <div className="font-mono text-muted-foreground">{emp.account_number}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                                                        <Edit className="w-4 h-4 mr-1" /> Edit Profile
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredEmployees.map((emp) => (
                                <div key={emp.user_id} className="neo-card p-4 flex flex-col items-center text-center relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEdit(emp)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border mb-3">
                                        {emp.profile_picture ? (
                                            <img src={emp.profile_picture} alt={emp.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-muted-foreground">
                                                {emp.full_name?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight">{emp.full_name}</h3>
                                    <span className="text-xs text-muted-foreground mb-2">{emp.role}</span>

                                    <div className="w-full space-y-2 mt-2">
                                        <div className="flex justify-between text-xs border-b pb-1">
                                            <span className="text-muted-foreground">Salary</span>
                                            <span className="font-mono font-bold">{emp.basic_salary?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-b pb-1">
                                            <span className="text-muted-foreground">Phone</span>
                                            <span>{emp.phone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Email</span>
                                            <span className="truncate max-w-[120px]" title={emp.email}>{emp.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {viewMode === 'excel' && (
                        <div className="overflow-x-auto border rounded-lg">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="w-[50px] border-r">ID</TableHead>
                                        <TableHead className="border-r">Full Name</TableHead>
                                        <TableHead className="border-r">Role</TableHead>
                                        <TableHead className="border-r">Email</TableHead>
                                        <TableHead className="border-r">Phone</TableHead>
                                        <TableHead className="border-r text-right">Basic Salary</TableHead>
                                        <TableHead className="border-r">Bank Name</TableHead>
                                        <TableHead className="border-r">Account No</TableHead>
                                        <TableHead className="border-r">KRA PIN</TableHead>
                                        <TableHead className="border-r">NSSF</TableHead>
                                        <TableHead>NHIF</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((emp) => (
                                        <TableRow key={emp.user_id} className="hover:bg-muted/50 cursor-pointer text-xs" onClick={() => handleEdit(emp)}>
                                            <TableCell className="border-r font-mono text-muted-foreground">{emp.user_id}</TableCell>
                                            <TableCell className="border-r font-medium">{emp.full_name}</TableCell>
                                            <TableCell className="border-r">{emp.role}</TableCell>
                                            <TableCell className="border-r">{emp.email || '-'}</TableCell>
                                            <TableCell className="border-r">{emp.phone || '-'}</TableCell>
                                            <TableCell className="border-r text-right font-mono">{emp.basic_salary?.toLocaleString()}</TableCell>
                                            <TableCell className="border-r">{emp.bank_name || '-'}</TableCell>
                                            <TableCell className="border-r font-mono">{emp.account_number || '-'}</TableCell>
                                            <TableCell className="border-r font-mono">{emp.tax_pin || '-'}</TableCell>
                                            <TableCell className="border-r font-mono">{emp.nssf_number || '-'}</TableCell>
                                            <TableCell className="font-mono">{emp.nhif_number || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Role Manager Modal */}
                <Dialog open={isRoleManagerOpen} onOpenChange={setIsRoleManagerOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Manage Roles</DialogTitle>
                            <DialogDescription>
                                Add or remove system roles. System roles cannot be deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New Role Name"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                                <Button onClick={handleAddRole}>
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{role.name}</span>
                                            {role.is_system === 1 && <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">System</span>}
                                        </div>
                                        {role.is_system === 0 && (
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRole(role.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Employee Profile</DialogTitle>
                            <DialogDescription>
                                Update personal details and payroll information for <span className="font-bold text-foreground">{editingEmployee?.full_name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        {editingEmployee && (
                            <div className="grid grid-cols-2 gap-6 py-4">
                                {/* Personal Details */}
                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <h4 className="font-semibold text-primary border-b pb-2">Personal Details</h4>
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={editingEmployee.full_name || ''}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={editingEmployee.role}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            value={editingEmployee.email || ''}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={editingEmployee.phone || ''}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Profile Picture</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingEmployee.profile_picture || ''}
                                                onChange={(e) => setEditingEmployee({ ...editingEmployee, profile_picture: e.target.value })}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                                <Label
                                                    htmlFor="file-upload"
                                                    className={`neo-button bg-primary text-primary-foreground h-10 px-3 flex items-center justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                                                >
                                                    {uploading ? <span className="animate-spin">⌛</span> : <Upload className="w-4 h-4" />}
                                                </Label>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Upload an image or paste a URL.</p>
                                    </div>
                                </div>

                                {/* Payroll Details */}
                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <h4 className="font-semibold text-primary border-b pb-2">Payroll Details</h4>
                                    <div className="space-y-2">
                                        <Label>Basic Salary (Monthly)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">KES</span>
                                            <Input
                                                type="number"
                                                className="pl-12 font-mono"
                                                value={editingEmployee.basic_salary}
                                                onChange={(e) => setEditingEmployee({ ...editingEmployee, basic_salary: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input
                                            value={editingEmployee.bank_name || ''}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, bank_name: e.target.value })}
                                            placeholder="e.g. Equity Bank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Number</Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                value={editingEmployee.account_number || ''}
                                                onChange={(e) => setEditingEmployee({ ...editingEmployee, account_number: e.target.value })}
                                                placeholder="0000000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>KRA PIN</Label>
                                        <Input
                                            value={editingEmployee.tax_pin || ''}
                                            onChange={(e) => setEditingEmployee({ ...editingEmployee, tax_pin: e.target.value })}
                                            placeholder="A000..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label>NSSF No.</Label>
                                            <Input
                                                value={editingEmployee.nssf_number || ''}
                                                onChange={(e) => setEditingEmployee({ ...editingEmployee, nssf_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>NHIF No.</Label>
                                            <Input
                                                value={editingEmployee.nhif_number || ''}
                                                onChange={(e) => setEditingEmployee({ ...editingEmployee, nhif_number: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="gap-2">
                                <Save className="w-4 h-4" /> Save Profile
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default PayrollEmployees;
