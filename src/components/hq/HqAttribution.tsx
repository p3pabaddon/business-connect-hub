import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AttributionData } from "@/lib/hq-api";
import { MousePointer2, Share2, Instagram, Search, Info } from "lucide-react";

interface Props {
  data: AttributionData[];
}

export function HqAttribution({ data }: Props) {
  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800/50 p-8 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-heading font-bold text-white tracking-tight">Acquisition Intelligence</h3>
          <p className="text-sm text-slate-500 mt-1">Hangi kanalların startup büyümesine en çok katkı sağladığını izle.</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Share2 className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="count"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">100%</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Reach</span>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-4">
          {data.map((item) => (
            <div key={item.source} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.source}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-500">{item.count} hits</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +4%
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              **Insight:** Instagram trafiği dönüşüm oranında (conversion) Google trafiğine göre %12 daha başarılı. Bu ay influencer partnerliklerini arttırabiliriz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp } from "lucide-react";
