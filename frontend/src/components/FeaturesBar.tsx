import { Brain, Users, BarChart3, RefreshCw } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const features = [
  { icon: Brain, title: "Smart Task Prioritization with AI Insights" },
  { icon: Users, title: "Collaborative Workspace for Seamless Teamwork" },
  { icon: BarChart3, title: "Advanced Project Tracking & Analytics" },
  { icon: RefreshCw, title: "Real-time Sync Across All Devices" },
];

const FeaturesBar = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 px-4">
      <p className={`text-center text-sm text-muted-foreground mb-12 max-w-2xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <span className="text-primary mr-1">✦</span>
        Unlock smarter productivity with AI-driven tools, personalized workflows, and seamless collaboration.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`flex flex-col items-center text-center gap-3 hover-lift cursor-default transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <feature.icon className="w-8 h-8 text-foreground" strokeWidth={1.5} />
            <p className="text-sm font-medium text-foreground leading-snug">{feature.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesBar;
