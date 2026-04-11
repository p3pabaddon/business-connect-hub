import { RiskMerchant } from "@/lib/hq-api";
import { ShieldAlert, AlertCircle, ArrowRight, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  data: RiskMerchant[];
}

export function HqGrowthRisk({ data }: Props) {
  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800/50 p-8 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-heading font-bold text-white tracking-tight">Churn Sentinel</h3>
          <p className="text-sm text-slate-500 mt-1">Sistemi terk etme riski olan işletmeleri erkenden tespit et.</p>
        </div>
        <div className="p-2 bg-rose-500/10 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {data.map((merchant, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                {merchant.name[0]}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{merchant.name}</h4>
                <p className="text-[11px] text-slate-500">Son Hareket: {merchant.lastActive}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Risk Skoru</p>
                <p className={`text-sm font-bold ${merchant.riskScore > 30 ? 'text-rose-500' : 'text-amber-500'}`}>
                  %{merchant.riskScore}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 opacity-50">
            <UserMinus className="w-12 h-12" />
            <p className="text-sm italic">Şu an için kritik riskli dükkan bulunmuyor.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            **Growth Tip:** Risk skoru %40'ın üzerine çıkan işletmelere otomatik "Kampanya Tanımla" maili göndererek Churn oranını %15 düşürebilirsin.
          </p>
        </div>
      </div>
    </div>
  );
}
