import { Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const testimonials = [
  {
    text: "QuickBiza transformed how we manage our bakery inventory. Everything is so seamless now, from tracking stock to managing sales.",
    name: "James Oloo",
    role: "CEO, Strong Enterprise",
  },
  {
    text: "The product management features are exactly what we needed. Adding and editing products is intuitive and fast.",
    name: "Hindley Earnshaw",
    role: "@Hindley.Es",
  },
  {
    text: "The POS system is incredibly fast and reliable. Our staff picked it up within minutes. Customer checkout is now a breeze.",
    heading: "Good Job!",
  },
  {
    text: "Our entire production workflow is now digital thanks to QuickBiza. The analytics are fantastic and the reporting saves us hours.",
    name: "Victoria Welton",
    role: "Fermentum Odio Co.",
  },
  {
    text: "The real-time sync across devices means I can check on my shop from anywhere. Truly a game changer for busy entrepreneurs.",
  },
  {
    text: "Cras fermentum odio eu feugiat pretium nibh nulla a sit. Platform volutpat sapien nec sagittis aliquet.",
    name: "Nancy Yane",
    role: "Fermentum Co.",
    dark: true,
  },
  {
    text: "The multi-branch support and supplier management saved us hours every week. Highly recommended for any retail business.",
    name: "Wilkins Micawber",
    wide: true,
  },
  {
    text: "The expense tracking and reports give us complete visibility into our business performance.",
    signature: true,
  },
  {
    text: "QuickBiza's customer management helps us build better relationships and drive repeat business.",
    name: "Basil Hallward",
    role: "Co-Founder Gravida.com",
  },
];

const StarRating = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
    ))}
  </div>
);

const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="testimonials" ref={ref} className="py-24 px-4 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
            What our customers say
          </h2>
          <p className="text-muted-foreground text-lg">Real feedback from real businesses using QuickBiza</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1 */}
          <div className={`bg-card rounded-2xl p-6 border border-border shadow-sm relative hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "100ms" }}>
            <div className="absolute -top-3 left-6 text-4xl text-muted-foreground/30 font-serif">"</div>
            <p className="text-sm text-muted-foreground mb-4 mt-4">{testimonials[0].text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">{testimonials[0].name}</p>
                <p className="text-xs text-muted-foreground">{testimonials[0].role}</p>
              </div>
            </div>
          </div>

          <div className={`bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col items-center text-center hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
            <div className="w-16 h-16 rounded-full bg-muted mb-4" />
            <StarRating />
            <h3 className="text-2xl font-bold text-foreground mt-3 mb-2">I really appreciate!!</h3>
            <p className="text-sm text-muted-foreground mb-4">{testimonials[1].text}</p>
            <p className="text-sm font-medium text-foreground">{testimonials[1].name}</p>
            <p className="text-xs text-muted-foreground">{testimonials[1].role}</p>
          </div>

          <div className={`bg-card rounded-2xl p-6 border border-border shadow-sm hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "300ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div>
                <h3 className="text-lg font-bold text-foreground">{testimonials[2].heading}</h3>
                <StarRating />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{testimonials[2].text}</p>
          </div>

          {/* Row 2 */}
          <div className={`bg-card rounded-2xl p-6 border border-border shadow-sm md:row-span-2 hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "400ms" }}>
            <p className="text-sm text-muted-foreground mb-6">{testimonials[3].text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">{testimonials[3].name}</p>
                <p className="text-xs text-muted-foreground">{testimonials[3].role}</p>
              </div>
            </div>
          </div>

          <div className={`bg-card rounded-2xl p-6 border border-border shadow-sm hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "500ms" }}>
            <div className="text-5xl text-primary/20 font-serif mb-2">"</div>
            <p className="text-sm text-muted-foreground">{testimonials[4].text}</p>
            <p className="text-sm italic text-muted-foreground mt-4 font-serif">— QuickBiza User</p>
          </div>

          <div className={`bg-foreground rounded-2xl p-6 text-card hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "600ms" }}>
            <p className="text-primary text-2xl font-serif mb-2">"</p>
            <p className="text-sm font-semibold mb-3">{testimonials[5].text}</p>
            <div className="mt-4">
              <p className="text-sm font-medium">{testimonials[5].name}</p>
              <p className="text-xs opacity-60">{testimonials[5].role}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className={`md:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "700ms" }}>
            <h3 className="text-xl font-bold text-foreground mb-2">I was very impressed!</h3>
            <p className="text-sm text-muted-foreground mb-4">{testimonials[6].text}</p>
            <p className="text-sm font-semibold text-foreground">{testimonials[6].name}</p>
          </div>

          <div className={`bg-card rounded-2xl p-6 border border-border shadow-sm hover-lift transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "800ms" }}>
            <p className="text-sm text-muted-foreground mb-4">{testimonials[8].text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">{testimonials[8].name}</p>
                <p className="text-xs text-primary font-medium">{testimonials[8].role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
