import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CategoryData } from "@/lib/hq-api";
import { Target, MapPin, TrendingUp } from "lucide-react";

interface Props {
  data: CategoryData[];
}

export function HqMarketIntelligence({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Category Distribution */}
      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col h-full shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Sektörel Dağılım</h3>
            <p className="text-sm text-muted-foreground">Platformdaki işletmelerin kategori bazlı oranları.</p>
          </div>
          <Target className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="space-y-6 flex flex-col h-full">
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex-1 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-foreground font-semibold">Bölgesel Odak</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">En Aktif Şehirler</p>
            </div>
          </div>
          <div className="space-y-4">
            {["İstanbul", "Ankara", "İzmir"].map((city, i) => (
              <div key={city} className="flex items-center justify-between group">
                <span className="text-foreground/80 flex items-center gap-2 group-hover:text-foreground transition-colors">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span>
                  {city}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{[82, 12, 6][i]}% Etki</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl flex-1 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-foreground font-semibold">Büyüme Analizi</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Velocity Metrics</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Platform verilerine göre Güzellik Salonu kategorisindeki dikey büyüme geçen aya göre <span className="text-emerald-500 font-bold">14% artış</span> gösterdi.
          </p>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[78%] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
