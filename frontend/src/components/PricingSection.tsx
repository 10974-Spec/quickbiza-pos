import { Button } from "@/components/ui/button";
import { Check, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses getting started with inventory management.",
    price: 12,
    cta: "Get started",
    featured: false,
    includes: "What included:",
    features: ["Basic features", "Basic integrations", "10GB data storage", "Limited analytics", "2 Workspaces", "Chat support"],
  },
  {
    name: "Business",
    description: "For growing businesses that need more power and collaboration tools.",
    price: 48,
    cta: "Get started",
    featured: true,
    includes: "Everything in Starter, plus:",
    features: ["Business features", "Business integrations", "15GB data storage", "Enhanced analytics", "5 workspaces", "Priority support"],
  },
  {
    name: "Enterprise",
    description: "For large organizations that need advanced features and unlimited access.",
    price: 96,
    cta: "Get started",
    featured: false,
    includes: "Everything in Business, plus:",
    features: ["Advanced features", "Enterprise integrations", "50GB data storage", "Unlimited analytics", "Unlimited workspaces"],
  },
];

const faqs = [
  { q: "How to stay safe on QuickBiza", a: "We use industry-standard encryption and security practices to keep your data safe at all times." },
  { q: "About Temporarily Banned Accounts", a: "Abuse of our platform results in temporary bans. Contact support if you believe this was done in error. We review all cases within 24 hours." },
  { q: "About two-step verification", a: "Enable two-step verification in your account settings for an extra layer of security." },
  { q: "How to restore your history", a: "Navigate to Settings > Data > Restore to recover previously deleted records." },
  { q: "Received verification code without requesting it", a: "If you received a code you didn't request, change your password immediately and contact support." },
];

const PricingSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal();
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal();

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div ref={cardsRef} className={`text-center mb-16 transition-all duration-700 ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full mb-4">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            Plans that works best for<br />
            your <span className="italic underline decoration-primary decoration-4 underline-offset-4">business</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col hover-lift transition-all duration-700 ${
                plan.featured ? "border-primary bg-card shadow-lg" : "border-border bg-card"
              } ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${(i + 1) * 150}ms` }}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-lg text-muted-foreground align-top">$</span>
                <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <Button className={`rounded-lg w-full mb-8 py-5 font-semibold hover-scale ${plan.featured ? "" : "bg-foreground text-card hover:bg-foreground/90"}`}>
                {plan.cta}
              </Button>
              <p className="text-sm font-medium text-foreground mb-4">{plan.includes}</p>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by best design teams around the world</p>
          <div className="flex items-center justify-center gap-10 flex-wrap text-muted-foreground">
            {["Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum"].map((l, i) => (
              <span key={i} className="text-lg font-bold opacity-40">{l}</span>
            ))}
          </div>
        </div>

        <div ref={faqRef} className="max-w-3xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${faqVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full mb-4">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              Everything you need to know<br />
              about <span className="italic underline decoration-primary decoration-4 underline-offset-4">the product</span>
            </h2>
          </div>

          <div className="divide-y divide-border">
            {faqs.map((faq, i) => (
              <div key={i} className={`py-5 transition-all duration-500 ${faqVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between text-left group">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{faq.q}</span>
                  <span className="flex-shrink-0 ml-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform duration-300" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                    {openFaq === i ? <Minus className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                  <p className="text-sm text-muted-foreground pr-12">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Can't find the answer you're looking for? Please chat to our{" "}
            <span className="underline cursor-pointer hover:text-primary transition-colors">friendly team</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
