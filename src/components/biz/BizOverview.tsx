import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, Users, Calendar, 
  Target, Zap, Activity, Clock, 
  ArrowUpRight, AlertCircle, Package 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { BizStats } from "@/lib/biz-api";
import { Badge } from "@/components/ui/badge";

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

  const chartData = [
    { time: "09:00", count: 2 },
    { time: "11:00", count: 5 },
    { time: "13:00", count: 3 },
    { time: "15:00", count: 8 },
    { time: "17:00", count: 12 },
    { time: "19:00", count: 7 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0f172a]/40 backdrop-blur-xl border border-slate-800/60 p-6 rounded-2xl hover:bg-slate-900 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-primary/30 transition-colors">
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-800 uppercase tracking-tighter">
                {kpi.trend}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" /> Randevu Akış Hızı
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Canlı Takip Aktif
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" /> Acil İşlemler
          </h3>
          <div className="space-y-4 flex-1">
            {recentApts.filter(a => a.status === 'pending').length > 0 ? (
              recentApts.filter(a => a.status === 'pending').slice(0, 3).map((apt, i) => (
                <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-primary/20 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{apt.appointment_time}</span>
                     <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px]">BEKLEYEN</Badge>
                   </div>
                   <h4 className="text-sm font-bold text-white mb-1">{apt.customer_name}</h4>
                   <p className="text-[10px] text-slate-500">{apt.notes || "Not bırakılmamış..."}</p>
                </div>
              ))
            ) : inventory.filter(i => i.quantity <= i.low_stock_threshold).length > 0 ? (
               inventory.filter(i => i.quantity <= i.low_stock_threshold).slice(0, 3).map((item, i) => (
                <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:border-amber-500/30 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-1.5">
                       <Package className="w-3 h-3 text-amber-500" />
                       <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Kritik Stok</span>
                     </div>
                     <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] uppercase">{item.quantity} {item.unit} Kaldı</Badge>
                   </div>
                   <h4 className="text-sm font-bold text-white mb-1">{item.name}</h4>
                   <p className="text-[10px] text-slate-500">Eşik değerinin ({item.low_stock_threshold}) altına düştü.</p>
                </div>
               ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center opacity-40">
                <AlertCircle className="w-10 h-10 text-slate-600" />
                <p className="text-xs text-slate-500">Kritik işlem bulunmuyor.</p>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800/50">
             <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <Target className="w-5 h-5 text-primary" />
                <p className="text-[10px] text-primary/80 leading-relaxed italic">
                  **CEO Insight:** Bu hafta en çok "Kısa Kesim" hizmeti tercih edildi. Bu hizmete özel bir kampanya dükkan gelirini %4 arttırabilir.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
