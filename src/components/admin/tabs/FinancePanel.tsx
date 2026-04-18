import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Receipt, TrendingUp, Building2 } from "lucide-react";
import { FinanceCard } from "../AdminComponents";
import { cn } from "@/lib/utils";

interface FinancePanelProps {
  systemStats: {
    totalRevenue: number;
  };
  businesses: any[];
}

export const FinancePanel = ({ systemStats, businesses }: FinancePanelProps) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FinanceCard title="Abonelik Geliri" value={`₺${(systemStats.totalRevenue * 0.8).toLocaleString()}`} icon={CreditCard} color="blue" />
        <FinanceCard title="Kayıt Ücretleri" value={`₺${(systemStats.totalRevenue * 0.15).toLocaleString()}`} icon={Receipt} color="emerald" />
        <FinanceCard title="Boost Gelirleri" value={`₺${(systemStats.totalRevenue * 0.05).toLocaleString()}`} icon={TrendingUp} color="amber" />
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest">Platform Nakit Akışı</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {businesses.slice(0, 8).map((biz, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium uppercase tracking-tight">{biz.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tabular-nums">{new Date(biz.created_at).toLocaleDateString()}</span>
                  <span className="font-black text-foreground">₺{biz.plan_price || 800}</span>
                  <Badge className={cn(
                    "border-none h-5 text-[9px] font-black tabular-nums",
                    (biz.plan === 'premium' || biz.is_premium) ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {biz.plan?.toUpperCase() || (biz.is_premium ? 'PREMIUM' : 'STARTER')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
