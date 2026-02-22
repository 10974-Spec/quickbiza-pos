import { useState, useEffect } from "react";
import api from "@/services/api";
import { AppLayout } from "@/components/AppLayout";
import { DollarSign, Settings, Plus, Trash2, Calculator, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

type ComponentType = 'earning' | 'deduction' | 'tax' | 'reimbursement';
type CalculationType = 'fixed' | 'percentage' | 'formula';

interface PayrollComponent {
    id?: number;
    name: string;
    type: ComponentType;
    calculation_type: CalculationType;
    formula: string;
    active: boolean;
    taxable: boolean;
}

interface PayrollSettingsData {
    pay_frequency: string;
    currency: string;
    overtime_enabled: boolean;
}

const PayrollSettings = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'components' | 'general' | 'tax'>('components');
    const [components, setComponents] = useState<PayrollComponent[]>([]);
    const [settings, setSettings] = useState<PayrollSettingsData>({
        pay_frequency: 'monthly',
        currency: 'KES',
        overtime_enabled: true
    });
    const [loading, setLoading] = useState(false);

    // Edit State
    const [showModal, setShowModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState<PayrollComponent | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [compsRes, settingsRes] = await Promise.all([
                api.get('/payroll/components'),
                api.get('/payroll/settings')
            ]);
            setComponents(compsRes.data);
            if (settingsRes.data) setSettings(settingsRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await api.post('/payroll/settings', settings);
            toast.success("Settings saved");
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const handleSaveComponent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComponent) return;

        try {
            await api.post('/payroll/components', editingComponent);
            toast.success("Component saved");
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save component");
        }
    };

    const handleDeleteComponent = async (id: number) => {
        if (!confirm("Are you sure you want to delete this component?")) return;
        try {
            await api.delete(`/payroll/components/${id}`);
            toast.success("Component deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete component");
        }
    };

    const openEdit = (comp?: PayrollComponent) => {
        if (comp) {
            setEditingComponent({ ...comp });
        } else {
            setEditingComponent({
                name: '',
                type: 'earning',
                calculation_type: 'fixed',
                formula: '',
                active: true,
                taxable: true
            });
        }
        setShowModal(true);
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Payroll Configuration</h1>
                        <p className="text-sm text-muted-foreground">Manage salary structures, deductions, and rules.</p>
                    </div>
                </div>

                <div className="flex gap-4 border-b border-border">
                    <button
                        onClick={() => setActiveTab('components')}
                        className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'components' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Salary Components
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        General Settings
                    </button>
                </div>

                {activeTab === 'components' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => openEdit()} className="neo-button bg-primary text-primary-foreground flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Component
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {components.map((comp) => (
                                <div key={comp.id} className="neo-card p-4 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`
                                            text-xs font-bold px-2 py-1 rounded border-2 uppercase
                                            ${comp.type === 'earning' ? 'bg-green-100 text-green-800 border-green-800' :
                                                comp.type === 'deduction' ? 'bg-red-100 text-red-800 border-red-800' :
                                                    'bg-blue-100 text-blue-800 border-blue-800'}
                                        `}>
                                            {comp.type}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(comp)} className="p-1 hover:bg-muted rounded text-primary">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteComponent(comp.id!)} className="p-1 hover:bg-muted rounded text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg">{comp.name}</h3>
                                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                                        <p className="flex items-center gap-2">
                                            <Calculator className="w-3 h-3" />
                                            {comp.calculation_type === 'fixed' ? 'Fixed Amount' :
                                                comp.calculation_type === 'percentage' ? 'Percentage' : 'Custom Formula'}
                                        </p>
                                        <p className="font-mono bg-muted/50 p-1 rounded text-xs truncate" title={comp.formula || '-'}>
                                            {comp.calculation_type === 'fixed' ? `${settings.currency} ` : ''}
                                            {comp.formula || '-'}
                                            {comp.calculation_type === 'percentage' ? '%' : ''}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2 text-xs">
                                        {comp.taxable && <span className="px-1.5 py-0.5 border border-border rounded bg-muted">Taxable</span>}
                                        {!comp.active && <span className="px-1.5 py-0.5 border border-destructive rounded text-destructive">Inactive</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="neo-card p-6 max-w-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5" /> General Rules
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Pay Frequency</label>
                                <select
                                    value={settings.pay_frequency}
                                    onChange={(e) => setSettings({ ...settings, pay_frequency: e.target.value })}
                                    className="neo-input w-full"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-Weekly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Currency</label>
                                <input
                                    type="text"
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    className="neo-input w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.overtime_enabled}
                                    onChange={(e) => setSettings({ ...settings, overtime_enabled: e.target.checked })}
                                    className="w-4 h-4 border-2 border-foreground rounded"
                                />
                                <span className="font-bold">Enable Overtime Calculations</span>
                            </div>
                            <button onClick={handleSaveSettings} className="neo-button bg-primary text-primary-foreground mt-4 px-6 flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showModal && editingComponent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border-2 border-foreground p-6 rounded-lg w-full max-w-lg shadow-xl animate-fade-up max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingComponent.id ? 'Edit Component' : 'New Component'}</h2>
                        <form onSubmit={handleSaveComponent} className="space-y-4">
                            <div>
                                <label className="label">Name</label>
                                <input
                                    required
                                    value={editingComponent.name}
                                    onChange={e => setEditingComponent({ ...editingComponent, name: e.target.value })}
                                    className="neo-input w-full"
                                    placeholder="e.g. House Allowance"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Type</label>
                                    <select
                                        value={editingComponent.type}
                                        onChange={e => setEditingComponent({ ...editingComponent, type: e.target.value as any })}
                                        className="neo-input w-full"
                                    >
                                        <option value="earning">Earning</option>
                                        <option value="deduction">Deduction</option>
                                        <option value="tax">Tax</option>
                                        <option value="reimbursement">Reimbursement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Calculation Info</label>
                                    <select
                                        value={editingComponent.calculation_type}
                                        onChange={e => setEditingComponent({ ...editingComponent, calculation_type: e.target.value as any })}
                                        className="neo-input w-full"
                                    >
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="percentage">Percentage of Gross</option>
                                        <option value="formula">Custom Formula</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label flex justify-between">
                                    <span>Value / Formula</span>
                                    {editingComponent.calculation_type === 'formula' && (
                                        <span className="text-xs text-primary cursor-pointer hover:underline">Variables Guide</span>
                                    )}
                                </label>
                                <div className="relative">
                                    {editingComponent.calculation_type === 'fixed' && (
                                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    )}
                                    <input
                                        required
                                        value={editingComponent.formula}
                                        onChange={e => setEditingComponent({ ...editingComponent, formula: e.target.value })}
                                        className={`neo-input w-full ${editingComponent.calculation_type === 'fixed' ? 'pl-9' : ''}`}
                                        placeholder={
                                            editingComponent.calculation_type === 'fixed' ? '5000' :
                                                editingComponent.calculation_type === 'percentage' ? '10 (for 10%)' :
                                                    'basic_salary * 0.15'
                                        }
                                    />
                                </div>
                                {editingComponent.calculation_type === 'formula' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Available: <code className="bg-muted px-1 rounded">basic_salary</code>, <code className="bg-muted px-1 rounded">gross_pay</code>
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingComponent.taxable}
                                        onChange={e => setEditingComponent({ ...editingComponent, taxable: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-bold">Taxable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingComponent.active}
                                        onChange={e => setEditingComponent({ ...editingComponent, active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-bold">Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="neo-button bg-muted text-muted-foreground">Cancel</button>
                                <button type="submit" className="neo-button bg-primary text-primary-foreground">Save Component</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default PayrollSettings;
