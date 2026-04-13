import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp, Users, Calendar,
  Target, Zap, Activity, Clock,
  ArrowUpRight, AlertCircle, Package
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { BizStats } from "@/lib/biz-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  stats: BizStats;
  recentApts: any[];
  inventory: any[];
}

export function BizOverview({ stats, recentApts, inventory }: Props) {
  const kpis = [
    { label: "Günlük Ciro", value: `₺${stats.revenueToday.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", trend: "+12%" },
    { label: "Bugünkü Randevu", value: stats.appointmentsToday.toString(), icon: Calendar, color: "text-blue-500", trend: "Live" },
    { label: "Yeni Müşteri", value: stats.newCustomersThisWeek.toString(), icon: Users, color: "text-violet-500", trend: "+2" },
    { label: "Sadakat Oranı", value: `%${stats.retentionRate}`, icon: Activity, color: "text-amber-500", trend: "Stabil" },
  ];

  const chartData = stats.dailyRevenue;
  const pieData = stats.serviceDistribution;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  const topService = stats.serviceDistribution[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card border border-border p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-muted/50 rounded-2xl border border-border group-hover:border-primary/20 transition-colors shadow-inner">
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <Badge variant="outline" className="text-[10px] font-black text-muted-foreground border-border uppercase tracking-widest px-3 py-1 bg-background/50 backdrop-blur-sm">
                {kpi.trend}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform">{kpi.value}</p>
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] opacity-60">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-10 rounded-[3rem] h-[450px] flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" /> Haftalık Ciro Grafiği
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Son 7 günlük finansal performans</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              CANLI VERİ
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px', fontWeight: '900' }}
                  labelStyle={{ fontSize: '10px', fontWeight: '700', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorCount)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center or Pie Chart */}
        <div className="bg-card border border-border p-10 rounded-[3rem] flex flex-col shadow-sm">
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" /> Servis Dağılımı
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-black text-foreground tracking-tighter leading-none">{pieData.length}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">KATEGORİ</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-8">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">{item.name}</span>
                </div>
                <span className="text-xs font-black text-foreground">₺{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Alerts / Inventory (Restructured) */}
          <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 flex items-center gap-3">
              <Package className="w-5 h-5 text-violet-500" /> Operasyonel Durum
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentApts.filter(a => a.status === 'pending').slice(0, 2).map((apt, i) => (
                <div key={i} className="p-6 bg-muted/30 border border-border rounded-3xl hover:border-primary/20 transition-all shadow-sm group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">{apt.appointment_time}</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black px-3 py-1">BEKLEYEN</Badge>
                  </div>
                  <h4 className="text-lg font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{apt.customer_name}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed opacity-60">{apt.notes || "Not bırakılmamış..."}</p>
                </div>
              ))}
              {inventory.filter(i => i.quantity <= i.low_stock_threshold).slice(0, 1).map((item, i) => (
                <div key={i} className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl shadow-sm group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Kritik Stok</span>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black px-3 py-1 uppercase">{item.quantity} {item.unit} KALDI</Badge>
                  </div>
                  <h4 className="text-lg font-black text-foreground tracking-tight group-hover:text-amber-600 transition-colors uppercase">{item.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Zap className="w-24 h-24 text-primary" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black tracking-widest uppercase px-3">ÜCRETSİZ PAKET</Badge>
                  <span className="text-[10px] text-muted-foreground font-black uppercase opacity-40">Sürüm 1.0</span>
               </div>
               <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Premium'a Geç</h4>
               <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">
                 Sınırsız personel, gelişmiş CRM araçları ve yapay zeka desteği için yükseltin.
               </p>
               <Button className="w-full h-12 text-[10px] uppercase font-black tracking-widest bg-primary text-white border-none hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-2xl">
                  ŞİMDİ YÜKSELT (800₺/Ay)
               </Button>
             </div>
          </div>

          <div className="p-8 bg-indigo-600 border border-indigo-500 rounded-[3rem] shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                <Target className="w-24 h-24 text-white" />
             </div>
             <div className="relative z-10">
               <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Öne Çık & Büyü</h4>
               <p className="text-[11px] text-indigo-100 font-medium leading-relaxed mb-6">
                 İşletmenizi aramalarda en üst sıraya taşıyın ve %40 daha fazla randevu alın.
               </p>
               <Button className="w-full h-12 text-[10px] uppercase font-black tracking-widest bg-white text-indigo-600 border-none hover:bg-white/90 shadow-lg rounded-2xl">
                  REKLAM VER (ÖNE ÇIKAR)
               </Button>
             </div>
          </div>

          <div className="p-8 bg-emerald-600 border border-emerald-500 rounded-[3rem] flex flex-col justify-center shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
             <div className="relative z-10 text-white">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-white/20 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest">Growth Matrix</h4>
                </div>
                <p className="text-[11px] font-medium leading-relaxed italic opacity-90">
                  {topService && stats.revenueToday > 0 ? (
                    `"${topService.name}" hizmetin bugün ₺${stats.revenueToday.toLocaleString()} ciro üretti. Geçen haftaya oranla %${Math.abs(stats.performanceScore)} ${stats.performanceScore >= 0 ? 'daha verimlisin' : 'düşüş var'}.`
                  ) : stats.appointmentsToday > 0 ? (
                    `Bugün ${stats.appointmentsToday} randevun var. Müşteri sadakat oranınız %${stats.retentionRate}, bu sektör ortalamasının üzerinde!`
                  ) : (
                    "İşletmeniz büyüme yolunda ilk adımlarını atıyor. Yeni hizmetler ekleyerek ivme kazanabilirsiniz!"
                  )}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
