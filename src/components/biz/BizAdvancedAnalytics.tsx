import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Zap, TrendingUp, Users, Calendar, 
  BarChart3, Brain, ArrowUpRight, 
  ArrowDownRight, Loader2, Sparkles,
  PieChart as PieIcon, Activity, Target
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, 
  CartesianGrid, Cell, PieChart, Pie 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { askAiAdvisor } from "@/lib/ai-service";

export function BizAdvancedAnalytics({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive data for AI analysis
      const [apts, reviews, services, traffic] = await Promise.all([
        supabase.from("appointments").select("*").eq("business_id", businessId),
        supabase.from("reviews").select("*").eq("business_id", businessId),
        supabase.from("services").select("*").eq("business_id", businessId),
        supabase.from("traffic_logs").select("*").ilike("path", `%${businessId}%`)
      ]);

      // Process for charts
      const dailyData = processDailyApts(apts.data || []);
      const serviceData = processServiceDistribution(apts.data || []);
      
      // Calculate growth trend (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const thisWeek = (apts.data || []).filter(a => new Date(a.created_at) > sevenDaysAgo).length;
      const lastWeek = (apts.data || []).filter(a => {
        const d = new Date(a.created_at);
        return d > fourteenDaysAgo && d <= sevenDaysAgo;
      }).length;
      
      const growth = lastWeek === 0 ? 100 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

      setData({
        appointments: apts.data || [],
        reviews: reviews.data || [],
        services: services.data || [],
        traffic: traffic.data || [],
        dailyData,
        serviceData,
        growth,
        thisWeek,
        lastWeek
      });

    } catch (err) {
      toast.error("Analitik veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const processDailyApts = (apts: any[]) => {
    const days: any = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(d => days[d] = 0);
    apts.forEach(a => {
      if (days[a.appointment_date] !== undefined) days[a.appointment_date]++;
    });

    return Object.entries(days).map(([date, count]) => ({
      date: date.split('-').slice(1).join('/'),
      count
    }));
  };

  const processServiceDistribution = (apts: any[]) => {
    const services: any = {};
    apts.forEach(a => {
      services[a.service_name] = (services[a.service_name] || 0) + 1;
    });
    return Object.entries(services).map(([name, value]) => ({ name, value }));
  };

  const runAiAnalysis = async () => {
    if (!data.appointments.length) {
      toast.error("Analiz için yeterli randevu verisi bulunmuyor.");
      return;
    }

    setAnalyzing(true);
    try {
      const prompt = `
        İşletmemiz için profesyonel bir büyüme analizi yapmanı istiyorum:
        - Toplam Randevu Sayısı: ${data.appointments.length}
        - Hafta Karşılaştırması: Bu hafta ${data.thisWeek} randevu, geçen hafta ${data.lastWeek} randevu.
        - Hizmetlerin Popülerliği: ${data.serviceData.map((s:any) => `${s.name}: %${s.value}`).join(", ")}
        - En Yeni 3 Müşteri Yorumu: ${data.reviews.slice(0, 3).map((r: any) => `"${r.comment}"`).join(" | ")}
        
        Lütfen bu verilere dayanarak, işletme sahibine hem moral verecek hem de ciroyu artıracak 3 aksiyon maddesi öner.
      `;

      const insight = await askAiAdvisor([{ role: "user", content: prompt }], {
        businessName: "İşletmeniz",
        stats: { 
          totalAppointments: data.appointments.length,
          thisWeek: data.thisWeek,
          lastWeek: data.lastWeek
        },
        services: data.services,
        staff: data.staff
      });

      setAiInsight(insight);
      toast.success("AI Stratejisi Hazır! 🚀");
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      toast.error("Analiz motoru şu an meşgul, lütfen az sonra tekrar deneyin.");
      setAiInsight("Analiz sırasında bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar 'Strateji Oluştur' butonuna basın.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Veriler Derleniyor...</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* AI Pulse Section */}
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 hidden md:block">
            <Brain className="w-40 h-40 text-primary" />
         </div>
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
               <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="p-2 md:p-3 bg-primary/20 rounded-xl md:rounded-2xl border border-primary/30">
                     <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight italic">AI Analitik Motoru</h2>
               </div>
               <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-relaxed max-w-md mb-6 md:mb-8">
                  Yapay zeka, son 30 günlük randevu trendlerini ve müşteri geri bildirimlerini analiz ederek işletmeniz için özel bir büyüme stratejisi oluşturur.
               </p>
               <Button 
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 text-[10px] md:text-sm"
               >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  STRATEJİ OLUŞTUR
               </Button>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] border border-white/10 p-5 md:p-8 min-h-[120px] md:min-h-[200px] flex flex-col justify-center">

               {aiInsight ? (
                 <div className="space-y-3 md:space-y-4 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 mb-1">
                       <Activity className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
                       <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">SİSTEM ANALİZİ AKTİF</span>
                    </div>
                    <p className="text-slate-200 text-xs md:text-sm font-medium italic leading-relaxed whitespace-pre-wrap">
                       "{aiInsight}"
                    </p>
                 </div>
               ) : (
                 <div className="text-center space-y-3 md:space-y-4 py-6 md:py-10 opacity-40">
                    <Target className="w-8 h-8 md:w-10 md:h-10 text-white mx-auto mb-1" />
                    <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Analiz başlatılmaya hazır</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         {/* Growth Area Chart */}
         <div className="lg:col-span-8 bg-card border border-border p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] h-[320px] md:h-[400px] flex flex-col shadow-sm">
             <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-10 gap-3">
                <div className="text-center sm:text-left">
                   <h3 className="text-[10px] md:text-sm font-black text-foreground uppercase tracking-widest mb-1">Randevu Yoğunluğu</h3>
                   <p className="text-[7px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Son 7 günlük trafik analizi</p>
                </div>
                <div className="p-2 md:p-3 bg-muted rounded-xl border border-border">
                   <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
                </div>
             </div>
             <div className="flex-1 w-full -ml-4 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 8, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} 
                        minTickGap={10}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 8, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} 
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '1rem',
                          fontSize: '10px',
                          padding: '8px'
                        }}
                        labelStyle={{ fontSize: '9px', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2.5} 
                        fill="url(#colorCount)" 
                        animationDuration={1500}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
         </div>


         {/* Stats Cards */}
         <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
            <div className="bg-card border border-border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm flex items-center justify-between group">
               <div>
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Popülerlik</p>
                  <h4 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">
                     {data.growth > 0 ? '+' : ''}{data.growth}%
                  </h4>
                  <div className={`flex items-center gap-1 mt-2 ${data.growth >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                     {data.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     <span className="text-[9px] md:text-[10px] font-black uppercase">
                        {data.growth >= 0 ? 'Büyüme Trendi' : 'Düşüş Trendi'}
                     </span>
                  </div>
               </div>
               <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-xl md:rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                  <Activity className="w-5 h-5 md:w-7 md:h-7 text-primary" />
               </div>
            </div>

            <div className="bg-card border border-border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm flex items-center justify-between group">
               <div>
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Müşteri Puanı</p>
                  <h4 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">
                     {data.reviews.length > 0 
                       ? (data.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / data.reviews.length).toFixed(1) 
                       : '0.0'}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                     <Sparkles className="w-3 h-3" />
                     <span className="text-[9px] md:text-[10px] font-black uppercase">{data.reviews.length} Toplam Yorum</span>
                  </div>
               </div>
               <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-xl md:rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                  <PieIcon className="w-5 h-5 md:w-7 md:h-7 text-violet-500" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
