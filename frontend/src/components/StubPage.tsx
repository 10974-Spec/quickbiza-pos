import { AppLayout } from "@/components/AppLayout";
import { Construction } from "lucide-react";

interface StubPageProps {
  title: string;
  description: string;
}

export function StubPage({ title, description }: StubPageProps) {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
        <div className="neo-card p-8 text-center max-w-md">
          <Construction className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-display font-bold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground font-body">{description}</p>
          <div className="neo-badge bg-warning text-warning-foreground mt-4">
            Coming Soon
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
