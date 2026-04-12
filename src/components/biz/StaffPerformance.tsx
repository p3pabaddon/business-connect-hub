import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Calendar, Star, TrendingUp, Clock, Award, 
  BarChart3, Target
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StaffPerformanceProps {
  businessId: string;
  appointments: any[];
  staff: any[];
  reviews: any[];
}

export function StaffPerformance({ businessId, appointments, staff, reviews }: StaffPerformanceProps) {
  // Calculate per-staff stats
  const staffStats = staff.map((s: any) => {
    const staffApts = appointments.filter((a: any) => a.staff_id === s.id);
    const completed = staffApts.filter((a: any) => a.status === "completed");
    const cancelled = staffApts.filter((a: any) => a.status === "cancelled");
    const noShow = staffApts.filter((a: any) => a.status === "no_show");
    
    // Revenue
    const revenue = completed.reduce((sum: number, a: any) => sum + (a.total_price || 0), 0);
    
    // Staff reviews (approximate — match by staff_id if available)
    const staffReviews = reviews.filter((r: any) => r.staff_id === s.id);
    const avgRating = staffReviews.length > 0
      ? (staffReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / staffReviews.length).toFixed(1)
      : "—";

    // Avg duration
    const avgDuration = completed.length > 0
      ? Math.round(completed.reduce((sum: number, a: any) => sum + (a.total_duration || 30), 0) / completed.length)
      : 0;

    return {
      ...s,
      totalAppointments: staffApts.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      revenue,
      avgRating,
      avgDuration,
      completionRate: staffApts.length > 0 
        ? Math.round((completed.length / staffApts.length) * 100) 
        : 0,
    };
  }).sort((a, b) => b.completedCount - a.completedCount);

  const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  // Chart data
  const barData = staffStats.map(s => ({
    name: s.name?.split(" ")[0] || "—",
    randevu: s.completedCount,
    gelir: Math.round(s.revenue / 100) * 100,
  }));

  const pieData = staffStats.map((s, i) => ({
    name: s.name?.split(" ")[0] || "—",
    value: s.completedCount,
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0);

  const topPerformer = staffStats[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 shadow-sm">
          <BarChart3 className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Personel Performansı</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70">Verimlilik ve Müşteri Memnuniyeti Analizi</p>
        </div>
      </div>

      {/* Top Performer Banner */}
      {topPerformer && topPerformer.completedCount > 0 && (
        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20 shadow-inner relative z-10 shrink-0">
            <Award className="w-10 h-10 text-accent" />
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Ayın Personeli</p>
            <p className="text-3xl font-black text-foreground tracking-tighter mb-2">{topPerformer.name}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-foreground">{topPerformer.completedCount} TAMAMLANAN</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">₺{topPerformer.revenue.toLocaleString()} CİRO</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border">
                  <Target className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-foreground">%{topPerformer.completionRate} BAŞARI</span>
               </div>
            </div>
          </div>
          {topPerformer.avgRating !== "—" && (
            <div className="flex flex-col items-center justify-center p-6 bg-accent border border-accent shadow-xl shadow-accent/20 rounded-3xl min-w-[120px] relative z-10">
              <Star className="w-8 h-8 text-white fill-white mb-1" />
              <span className="text-3xl font-black text-white leading-none">{topPerformer.avgRating}</span>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-2">PUAN</span>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2rem] shadow-sm overflow-hidden p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Calendar className="w-4 h-4 text-accent" /> Randevu Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "1rem", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="randevu" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 opacity-40">
                <BarChart3 className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Veri bulunamadı</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2rem] shadow-sm overflow-hidden p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Target className="w-4 h-4 text-accent" /> Randevu Payı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value" 
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "1rem", border: "1px solid hsl(var(--border))" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 opacity-40">
                <Target className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Veri bulunamadı</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-60">
            <Users className="w-4 h-4 text-accent" /> Personel Detay Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personel</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Toplam</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Biten</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gelir</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Puan</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ort. Süre</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Başarı</th>
                </tr>
              </thead>
              <tbody>
                {staffStats.map((s, i) => (
                  <tr key={s.id} className="bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-5 first:rounded-l-3xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-background border border-border shadow-sm rounded-2xl flex items-center justify-center text-sm font-black text-accent group-hover:scale-110 transition-transform">
                          {s.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-base tracking-tighter leading-none mb-1">{s.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{s.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center font-bold text-foreground">{s.totalAppointments}</td>
                    <td className="px-4 py-5 text-center">
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-black text-xs">{s.completedCount}</span>
                    </td>
                    <td className="px-4 py-5 text-center font-black text-foreground">₺{s.revenue.toLocaleString()}</td>
                    <td className="px-4 py-5 text-center">
                      {s.avgRating !== "—" ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                          <span className="font-black text-foreground">{s.avgRating}</span>
                        </div>
                      ) : <span className="text-muted-foreground">0.0</span>}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-bold">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        <span>{s.avgDuration} dk</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right last:rounded-r-3xl">
                      <Badge
                        variant="outline"
                        className={
                          s.completionRate >= 80
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : s.completionRate >= 50
                            ? "bg-orange-500/10 border-orange-500/20 text-orange-600"
                            : "bg-destructive/10 border-destructive/20 text-destructive"
                        }
                      >
                        %{s.completionRate}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {staffStats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest opacity-40">Personel verisi bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
