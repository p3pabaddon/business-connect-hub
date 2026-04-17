import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: LucideIcon; color: string }) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-bold text-foreground">{value}</h3></div>
        <div className="p-3 bg-muted rounded-xl border border-border"><Icon className={cn("w-5 h-5", color)} /></div>
      </CardContent>
    </Card>
  );
}

export function AlertItem({ msg, type }: { msg: string; type: "warning" | "info" }) {
  return (
    <div className={cn("p-3 rounded-xl border text-[10px] font-medium flex items-center gap-3", 
      type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400")}>
       <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", type === 'warning' ? "bg-amber-500" : "bg-blue-500")} /> {msg}
    </div>
  );
}

export function FinanceCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: LucideIcon; color: "blue" | "emerald" | "amber" }) {
   const colors: Record<string, string> = { 
     blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
     emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
     amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
   };
   return (
     <Card className="bg-card border-border shadow-sm">
       <CardContent className="p-6 text-center space-y-4">
          <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto", colors[color])}><Icon className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{title}</p><p className="text-2xl font-black text-foreground tracking-tighter">{value}</p></div>
       </CardContent>
     </Card>
   );
}

export function MetricRow({ label, value, percentage }: { label: string; value: string; percentage: number }) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>
      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/50">
        <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
