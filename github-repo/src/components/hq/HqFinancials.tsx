import { Wallet, Info, ArrowUpRight, Target, Gem } from "lucide-react";

interface Props {
  data: {
    mrr: number;
    ltv: number;
    churnRate: number;
  };
}

export function HqFinancials({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* MRR Card */}
      <div className="bg-card border border-border p-8 rounded-3xl flex flex-col relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Wallet className="w-24 h-24 text-primary" />
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Monthly Recurring</span>
          </div>
          <h3 className="text-4xl font-heading font-black text-foreground mb-2">₺{data.mrr.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">Tahmini Aylık Tekrarlayan Gelir (MRR)</p>
          
          <div className="mt-8 flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-500/5 w-fit px-3 py-1 rounded-full border border-emerald-500/10">
            <ArrowUpRight className="w-4 h-4" />
            +8.2% Büyüme
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">Target</span>
            <span className="text-sm text-foreground/70 font-mono">₺25,000</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">Progress</span>
            <span className="text-sm text-primary font-mono">{Math.floor((data.mrr / 25000) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Startup Health Metrics */}
      <div className="space-y-6 flex flex-col h-full">
        <div className="bg-card border border-border p-6 rounded-2xl flex-1 flex justify-between items-center group shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground uppercase font-mono">LTV (Customer Value)</span>
            </div>
            <h4 className="text-2xl font-bold text-foreground">₺{data.ltv}</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Projeksiyon</p>
            <p className="text-xs text-amber-500">+₺45 (EOM)</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl flex-1 flex justify-between items-center shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground uppercase font-mono">Churn Rate (Net)</span>
            </div>
            <h4 className="text-2xl font-bold text-foreground">%{data.churnRate}</h4>
          </div>
          <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">Low Risk</span>
        </div>

        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex-1">
          <p className="text-[11px] text-primary/80 leading-relaxed italic">
            "SaaS startup'ları için Churn oranının %3 altında olması sürdürülebilirlik kanıtıdır. Şu an güvenli bölgedesin."
          </p>
        </div>
      </div>
    </div>
  );
}
