import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsChartsProps {
  appointments: any[];
  totalRevenue: number;
}

const COLORS = ["hsl(173, 82%, 32%)", "hsl(184, 100%, 21%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(215, 16%, 47%)"];

export function AnalyticsCharts({ appointments, totalRevenue }: AnalyticsChartsProps) {
  const weeklyData = useMemo(() => {
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const counts = new Array(7).fill(0);
    appointments.forEach((apt) => {
      const date = new Date(apt.appointment_date);
      const day = date.getDay();
      const idx = day === 0 ? 6 : day - 1;
      counts[idx]++;
    });
    return days.map((name, i) => ({ name, randevu: counts[i] }));
  }, [appointments]);

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    appointments
      .filter((a) => a.status === "completed")
      .forEach((apt) => {
        const month = apt.appointment_date.slice(0, 7);
        months[month] = (months[month] || 0) + (Number(apt.total_price) || 0);
      });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, gelir]) => ({
        name: new Date(month + "-01").toLocaleDateString("tr-TR", { month: "short" }),
        gelir,
      }));
  }, [appointments]);

  const statusDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    appointments.forEach((apt) => {
      const label =
        apt.status === "completed" ? "Tamamlanan" :
        apt.status === "confirmed" ? "Onaylanan" :
        apt.status === "pending" ? "Bekleyen" :
        apt.status === "cancelled" ? "İptal" : apt.status;
      dist[label] = (dist[label] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Distribution */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">Haftalık Randevu Dağılımı</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="randevu" fill="hsl(173, 82%, 32%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">Aylık Gelir Trendi</h3>
        {monthlyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₺${v}`} />
              <Tooltip
                formatter={(value: number) => [`₺${value}`, "Gelir"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="gelir" stroke="hsl(184, 100%, 21%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            Henüz gelir verisi yok
          </div>
        )}
      </div>

      {/* Status Distribution */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">Randevu Durumu Dağılımı</h3>
        {statusDistribution.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            Henüz veri yok
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">Özet İstatistikler</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ortalama Randevu Değeri</span>
            <span className="font-semibold text-foreground">
              ₺{appointments.length > 0 ? Math.round(totalRevenue / Math.max(appointments.filter(a => a.status === "completed").length, 1)) : 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tamamlanma Oranı</span>
            <span className="font-semibold text-accent">
              {appointments.length > 0
                ? Math.round((appointments.filter(a => a.status === "completed").length / appointments.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">İptal Oranı</span>
            <span className="font-semibold text-destructive">
              {appointments.length > 0
                ? Math.round((appointments.filter(a => a.status === "cancelled").length / appointments.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Toplam Müşteri</span>
            <span className="font-semibold text-foreground">
              {new Set(appointments.map(a => a.customer_phone || a.customer_email)).size}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}