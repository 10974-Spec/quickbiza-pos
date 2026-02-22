import { AppLayout } from "@/components/AppLayout";
import { Gift, Award, Star } from "lucide-react";

const Loyalty = () => {
  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Loyalty Program</h1>
          <p className="text-sm text-muted-foreground">Reward your customers</p>
        </div>

        {/* Program Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Members</span>
              <Gift className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">1,234</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Points Issued</span>
              <Star className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">45,678</p>
          </div>
          <div className="neo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Rewards Redeemed</span>
              <Award className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold">892</p>
          </div>
        </div>

        {/* Loyalty Tiers */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4">Membership Tiers</h2>
          <div className="space-y-3">
            {[
              { tier: "Bronze", points: "0-999", discount: "5%", members: 800 },
              { tier: "Silver", points: "1000-4999", discount: "10%", members: 350 },
              { tier: "Gold", points: "5000+", discount: "15%", members: 84 },
            ].map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">{tier.tier}</p>
                    <p className="text-xs text-muted-foreground">{tier.points} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{tier.discount} Discount</p>
                  <p className="text-xs text-muted-foreground">{tier.members} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Loyalty;
