import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomerManagerProps {
  customers: any[];
}

export const CustomerManager = ({ customers }: CustomerManagerProps) => {
  return (
    <div className="space-y-4">
      {customers.map((cust) => (
        <Card key={cust.id} className="bg-card border-border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-muted/30 transition-all cursor-default rounded-3xl">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shrink-0">{cust.full_name?.[0] || "?"}</div>
            <div className="space-y-1">
              <p className="font-bold text-foreground text-sm lg:text-base uppercase tracking-tight">{cust.full_name || "İsimsiz Kullanıcı"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{cust.phone || "No phone"} • {cust.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={cust.kvkk_consent ? "default" : "outline"} className={cn("text-[8px] h-4", cust.kvkk_consent ? "bg-emerald-500/20 text-emerald-500 border-none" : "text-muted-foreground")}>
                  KVKK {cust.kvkk_consent ? "ONAYLI" : "YOK"}
                </Badge>
                <Badge variant={cust.marketing_consent ? "default" : "outline"} className={cn("text-[8px] h-4", cust.marketing_consent ? "bg-blue-500/20 text-blue-500 border-none" : "text-muted-foreground")}>
                  PAZARLAMA {cust.marketing_consent ? "ONAYLI" : "YOK"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 lg:flex items-center gap-4 lg:gap-10 border-t lg:border-none pt-4 lg:pt-0">
            <div className="text-center lg:text-right"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Sıklık</p><p className="font-black text-foreground text-xs lg:text-sm">{cust.appointmentsCount} RX</p></div>
            <div className="text-center lg:text-right cursor-help" title="No-show kaydı"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Risk</p><p className={cn("font-black text-xs lg:text-sm", cust.noShows > 0 ? "text-rose-500" : "text-emerald-500")}>{cust.noShows}</p></div>
            <div className="text-center lg:text-right"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Ciro</p><p className="font-black text-emerald-500 text-xs lg:text-sm">₺{cust.totalSpent.toLocaleString()}</p></div>
          </div>
        </Card>
      ))}
    </div>
  );
};
