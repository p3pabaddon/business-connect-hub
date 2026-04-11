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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-heading text-foreground">Personel Performansı</h2>
      </div>

      {/* Top Performer Banner */}
      {topPerformer && topPerformer.completedCount > 0 && (
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Bu Dönemin Yıldızı</p>
            <p className="text-lg font-heading text-foreground">{topPerformer.name}</p>
            <p className="text-xs text-muted-foreground">
              {topPerformer.completedCount} tamamlanan randevu · ₺{topPerformer.revenue.toLocaleString()} ciro · %{topPerformer.completionRate} tamamlama
            </p>
          </div>
          {topPerformer.avgRating !== "—" && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <span className="text-lg font-bold text-foreground">{topPerformer.avgRating}</span>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Randevu Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="randevu" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" /> Randevu Payı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Personel Detay Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-muted-foreground">Personel</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Toplam</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Tamamlanan</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">İptal</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Gelmedi</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Gelir</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Puan</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Ort. Süre</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Başarı</th>
                </tr>
              </thead>
              <tbody>
                {staffStats.map((s, i) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-xs font-bold text-accent">
                          {s.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-medium text-foreground">{s.totalAppointments}</td>
                    <td className="p-3 text-center text-emerald-500 font-medium">{s.completedCount}</td>
                    <td className="p-3 text-center text-orange-500">{s.cancelledCount}</td>
                    <td className="p-3 text-center text-destructive">{s.noShowCount}</td>
                    <td className="p-3 text-center font-medium text-foreground">₺{s.revenue.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      {s.avgRating !== "—" ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="font-medium">{s.avgRating}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{s.avgDuration}dk</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          s.completionRate >= 80
                            ? "border-emerald-500/30 text-emerald-500"
                            : s.completionRate >= 50
                            ? "border-orange-500/30 text-orange-500"
                            : "border-destructive/30 text-destructive"
                        }
                      >
                        %{s.completionRate}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {staffStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">Personel verisi bulunamadı</td>
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
