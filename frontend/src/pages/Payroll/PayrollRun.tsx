import { useState, useEffect } from "react";
import api from "@/services/api";
import { AppLayout } from "@/components/AppLayout";
import { Play, CheckCircle, Lock, AlertTriangle, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

const PayrollRun = () => {
    const { theme } = useTheme();
    const [step, setStep] = useState<'select' | 'simulate' | 'review'>('select');
    const [loading, setLoading] = useState(false);

    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [simulationResults, setSimulationResults] = useState<any[]>([]);

    const [runs, setRuns] = useState<any[]>([]);

    useEffect(() => {
        fetchRuns();
    }, []);

    const fetchRuns = async () => {
        try {
            const res = await api.get('/payroll/runs');
            setRuns(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSimulate = async () => {
        if (!periodStart || !periodEnd) {
            toast.error("Please select a valid period");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/payroll/simulate', {
                // employeeIds: [] // empty means all
            });
            setSimulationResults(res.data);
            setStep('simulate');
            toast.success("Simulation complete");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Simulation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        if (!confirm("Are you sure? This will generate payslips and lock this payroll run.")) return;

        try {
            setLoading(true);
            await api.post('/payroll/run', {
                periodStart,
                periodEnd,
                // employeeIds: [] 
            });
            toast.success("Payroll processed successfully!");
            setStep('select');
            fetchRuns();
        } catch (error: any) {
            toast.error("Failed to process payroll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Payroll Execution</h1>
                        <p className="text-sm text-muted-foreground">Run, Review, and Lock monthly payrolls.</p>
                    </div>
                </div>

                {/* Main Action Card */}
                <div className="neo-card p-6 border-l-4 border-l-primary">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary" /> New Payroll Run
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4 item-end">
                        <div>
                            <label className="block text-sm font-bold mb-1">Period Start</label>
                            <input
                                type="date"
                                className="neo-input w-full"
                                value={periodStart}
                                onChange={e => setPeriodStart(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Period End</label>
                            <input
                                type="date"
                                className="neo-input w-full"
                                value={periodEnd}
                                onChange={e => setPeriodEnd(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSimulate}
                                disabled={loading}
                                className="neo-button bg-primary text-primary-foreground w-full flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                                Simulate Run
                            </button>
                        </div>
                    </div>
                </div>

                {/* Simulation Results */}
                {step === 'simulate' && (
                    <div className="space-y-4 animate-fade-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Simulation Results</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setStep('select')} className="neo-button bg-muted">Cancel</button>
                                <button onClick={handleExecute} className="neo-button bg-green-600 text-white flex gap-2 items-center">
                                    <CheckCircle className="w-4 h-4" /> Finalize & Lock
                                </button>
                            </div>
                        </div>

                        <div className="neo-card overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-muted text-xs uppercase font-bold text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="p-3">Employee</th>
                                        <th className="p-3 text-right">Basic</th>
                                        <th className="p-3 text-right">Gross</th>
                                        <th className="p-3 text-right text-destructive">Deductions</th>
                                        <th className="p-3 text-right text-primary">Net Pay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {simulationResults.map((res: any) => (
                                        <tr key={res.user_id} className="hover:bg-muted/20">
                                            <td className="p-3 font-medium">{res.name}</td>
                                            <td className="p-3 text-right">{res.basic_salary.toLocaleString()}</td>
                                            <td className="p-3 text-right">{res.gross_pay.toLocaleString()}</td>
                                            <td className="p-3 text-right text-destructive">-{res.total_deductions.toLocaleString()}</td>
                                            <td className="p-3 text-right font-bold text-primary">{res.net_pay.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-muted/50 font-bold border-t border-border">
                                    <tr>
                                        <td className="p-3">TOTALS</td>
                                        <td className="p-3 text-right">-</td>
                                        <td className="p-3 text-right">{simulationResults.reduce((a, b) => a + b.gross_pay, 0).toLocaleString()}</td>
                                        <td className="p-3 text-right text-destructive">-{simulationResults.reduce((a, b) => a + b.total_deductions, 0).toLocaleString()}</td>
                                        <td className="p-3 text-right text-primary">{simulationResults.reduce((a, b) => a + b.net_pay, 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* History */}
                <div className="space-y-4 pt-4 border-t border-muted">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Recent Runs
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {runs.map((run) => (
                            <div key={run.id} className="neo-card p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800 border bg-green-200">
                                        {run.status.toUpperCase()}
                                    </span>
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <h3 className="font-bold text-lg">
                                    {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                                </h3>
                                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                    <span>Total Gross:</span>
                                    <span className="font-mono text-foreground">{run.total_gross?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-primary">
                                    <span>Total Net:</span>
                                    <span className="font-mono">{run.total_net?.toLocaleString()}</span>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button className="neo-button text-xs w-full flex items-center justify-center gap-2">
                                        <Printer className="w-3 h-3" /> Payslips
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PayrollRun;
