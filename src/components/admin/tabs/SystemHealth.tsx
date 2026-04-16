import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Zap, Cpu, HardDrive } from "lucide-react";
import { MetricRow } from "../AdminComponents";

export const SystemHealth = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 bg-card border-border shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Gerçek Zamanlı Performans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <MetricRow label="API Yanıt Süresi" value="124ms" percentage={15} />
          <MetricRow label="Sistem Yükü (Load)" value="0.22" percentage={22} />
          <MetricRow label="Bellek Kullanımı" value="1.4GB / 4GB" percentage={35} />
          <MetricRow label="Disk IOPS" value="12.4K" percentage={45} />
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Zap className="w-6 h-6 text-emerald-500" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Çalışma Süresi</p><p className="text-xl font-black text-foreground tabular-nums">142 GÜN</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Cpu className="w-6 h-6 text-blue-500" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">İşlemci Mimarisi</p><p className="text-xl font-black text-foreground">ARM64 v8.2</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><HardDrive className="w-6 h-6 text-indigo-500" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Resim Depolama</p><p className="text-xl font-black text-foreground">14.2 TB</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
