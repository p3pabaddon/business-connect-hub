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
      <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white">Sektörel Dağılım</h3>
            <p className="text-sm text-slate-500">Platformdaki işletmelerin kategori bazlı oranları.</p>
          </div>
          <Target className="w-5 h-5 text-slate-500" />
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
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="space-y-6 flex flex-col h-full">
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Bölgesel Odak</h4>
              <p className="text-xs text-slate-500 uppercase tracking-widest">En Aktif Şehirler</p>
            </div>
          </div>
          <div className="space-y-4">
            {["İstanbul", "Ankara", "İzmir"].map((city, i) => (
              <div key={city} className="flex items-center justify-between group">
                <span className="text-slate-300 flex items-center gap-2 group-hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span>
                  {city}
                </span>
                <span className="text-xs font-mono text-slate-500">{[82, 12, 6][i]}% Etki</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-2xl flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Büyüme Analizi</h4>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Velocity Metrics</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Platform verilerine göre Güzellik Salonu kategorisindeki dikey büyüme geçen aya göre <span className="text-emerald-500 font-bold">14% artış</span> gösterdi.
          </p>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[78%] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
