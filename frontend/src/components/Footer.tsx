import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const columns = [
    { title: "Company", links: ["Blog", "Marketplace link", "What's new", "About", "Tech Careers"] },
    { title: "Community", links: ["Creator report", "Charities", "Templates"] },
    { title: "Support", links: ["Help topics", "Getting started", "How-Tos", "FAQs", "Report"] },
    { title: "Legal", links: ["Terms & Conditions", "Privacy notice", "Cookie notice", "Trust center"] },
  ];

  return (
    <footer className="bg-foreground text-card py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">
            Everything you need<br />
            in <span className="italic underline decoration-primary decoration-4 underline-offset-4">one place</span>
          </h2>
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <Input
              placeholder="Enter email address"
              className="rounded-full bg-card/10 border-card/20 text-card placeholder:text-card/50 h-12"
            />
            <Button className="rounded-full h-12 px-6 font-semibold">Get started</Button>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between border-t border-card/10 pt-6">
          <span className="text-xl font-extrabold">QuickBiza</span>
          <p className="text-xs opacity-50">©2025 QuickBiza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
