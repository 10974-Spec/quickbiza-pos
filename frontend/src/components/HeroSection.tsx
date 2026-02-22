import { Button } from "@/components/ui/button";
import { Monitor, Terminal } from "lucide-react";
import demoScreenshot from "@/assets/demo-screenshot.png";

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center text-center pt-12 pb-0 px-4">
      {/* Waitlist badge */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-8 shadow-sm animate-fade-in">
        <span className="text-primary">✦</span>
        <span className="text-sm text-muted-foreground">Join the waitlist for updates</span>
        <span className="text-primary font-bold">→</span>
      </div>

      {/* Heading */}
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05] max-w-5xl mb-6 animate-fade-in-up">
        Elevate Your{" "}
        <span className="italic underline decoration-primary decoration-4 underline-offset-8">
          Business
        </span>{" "}
        with QuickBiza
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-lg max-w-xl mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
        Elevate your business with QuickBiza — the all-in-one platform for managing products, sales, and inventory with ease.
      </p>

      {/* Download buttons */}
      {/* Call to Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
        <a href="/register">
          <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg gap-2 hover-glow hover-scale">
            Get Started
            <span className="font-bold">→</span>
          </Button>
        </a>
        <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-semibold border-foreground text-foreground gap-2 hover-scale">
          <Monitor className="w-5 h-5" />
          Download App
        </Button>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-2 mb-12 animate-fade-in" style={{ animationDelay: "0.45s", opacity: 0 }}>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-primary/80 border-2 border-card" />
          <div className="w-7 h-7 rounded-full bg-foreground/60 border-2 border-card" />
          <div className="w-7 h-7 rounded-full bg-primary/50 border-2 border-card" />
        </div>
        <span className="text-sm text-muted-foreground">Loved by over 3 million users</span>
      </div>

      {/* Demo image in dark container */}
      <div className="w-full max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: "0.5s", opacity: 0 }}>
        <div className="bg-foreground rounded-t-3xl p-4 pt-8 md:p-8 md:pt-12 shadow-2xl">
          <img
            src={demoScreenshot}
            alt="QuickBiza Dashboard"
            className="w-full rounded-xl shadow-lg border border-border/20"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
