import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Bell, Building2, Users, Calendar, Wallet, Sparkles, Zap } from "lucide-react";
import { StatCard, AlertItem } from "../AdminComponents";
import { cn } from "@/lib/utils";

interface AdminOverviewProps {
  systemStats: {
    totalBusinesses: number;
    totalUsers: number;
    totalAppointments: number;
    totalRevenue: number;
  };
  businesses: any[];
  pendingCount: number;
}

export const AdminOverview = ({ systemStats, businesses, pendingCount }: AdminOverviewProps) => {
  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="İşletme" value={systemStats.totalBusinesses} icon={Building2} color="text-primary" />
        <StatCard title="Kullanıcı" value={systemStats.totalUsers} icon={Users} color="text-blue-500" />
        <StatCard title="Randevu" value={systemStats.totalAppointments} icon={Calendar} color="text-emerald-500" />
        <StatCard title="Hacim" value={`₺${(systemStats.totalRevenue / 1000).toFixed(1)}K`} icon={Wallet} color="text-amber-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border overflow-hidden shadow-sm">
          <CardHeader className="py-5 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Son Kayıtlı İşletmeler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {businesses.slice(0, 5).map(biz => (
                <div key={biz.id} className="p-5 flex items-center justify-between hover:bg-muted/40 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-black text-primary uppercase">{biz.name?.[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">{biz.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-muted-foreground font-medium">{biz.city} • {biz.category}</p>
                        {(biz.plan || biz.is_premium) && (
                          <Badge variant="outline" className={cn(
                            "text-[8px] uppercase font-black px-1.5 py-0 rounded-md shrink-0 border-none",
                            (biz.plan === 'premium' || biz.is_premium) 
                              ? "bg-amber-500/10 text-amber-500" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {biz.plan || (biz.is_premium ? 'premium' : 'starter')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={biz.status === 'active' ? 'secondary' : 'outline'} className="text-[9px] font-bold uppercase tracking-tighter h-5">
                    {biz.status || 'pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="py-5 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Sistem Uyarıları
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <AlertItem msg={`${pendingCount} yeni işletme başvurusu onayınızı bekliyor.`} type="warning" />
            <AlertItem msg="Platform performansı optimal düzeyde (%99.9)." type="info" />
            <AlertItem msg="No-show oranlarında bu hafta %5 düşüş gözlendi." type="info" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
