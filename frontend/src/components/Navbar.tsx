import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-1 bg-card rounded-full px-1 py-1 border border-border shadow-sm">
          <Button variant="default" size="sm" className="rounded-full text-xs font-medium px-4 h-8">
            Benefits
          </Button>
          <a href="#pricing">
            <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium px-4 h-8 text-muted-foreground">
              Pricing
            </Button>
          </a>
          <a href="#testimonials">
            <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium px-4 h-8 text-muted-foreground">
              Testimonials
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="text-2xl font-extrabold text-foreground tracking-tight">QuickBiza</span>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <a href="/login">
          <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium px-4 h-8 text-foreground hover:text-primary">
            Log in
          </Button>
        </a>
        <a href="/register">
          <Button variant="default" size="sm" className="rounded-full px-5 h-9 font-medium border-foreground">
            Get Started
          </Button>
        </a>
      </div>

      <div className="md:hidden flex items-center">
        <button className="text-foreground p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
