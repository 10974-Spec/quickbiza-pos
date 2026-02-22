import { AppLayout } from "@/components/AppLayout";

const Payslips = () => {
    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                <h1 className="text-2xl font-display font-bold">Payslips</h1>
                <p className="text-muted-foreground">Select a payroll run to view payslips.</p>
                {/* To be implemented: List of individual payslips with Print PDF option */}
                <div className="neo-card p-12 text-center text-muted-foreground border-dashed">
                    Select a completed payroll run to view payslips.
                </div>
            </div>
        </AppLayout>
    );
};

export default Payslips;
