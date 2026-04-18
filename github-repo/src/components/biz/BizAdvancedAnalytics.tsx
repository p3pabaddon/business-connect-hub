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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* AI Pulse Section */}
      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Brain className="w-40 h-40 text-primary" />
         </div>
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
                     <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">AI Analitik Motoru</h2>
               </div>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mb-8">
                  Yapay zeka, son 30 günlük randevu trendlerini ve müşteri geri bildirimlerini analiz ederek işletmeniz için özel bir büyüme stratejisi oluşturur.
               </p>
               <Button 
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
               >
                  {analyzing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  STRATEJİ OLUŞTUR
               </Button>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 min-h-[200px] flex flex-col justify-center">
               {aiInsight ? (
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                       <Activity className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">SİSTEM ANALİZİ AKTİF</span>
                    </div>
                    <p className="text-slate-200 text-sm font-medium italic leading-relaxed whitespace-pre-wrap">
                       "{aiInsight}"
                    </p>
                 </div>
               ) : (
                 <div className="text-center space-y-4 py-10 opacity-40">
                    <Target className="w-10 h-10 text-white mx-auto mb-2" />
                    <p className="text-xs font-black text-white uppercase tracking-widest">Analiz başlatılmaya hazır</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Growth Area Chart */}
         <div className="lg:col-span-8 bg-card border border-border p-10 rounded-[3rem] h-[400px]">
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Randevu Yoğunluğu</h3>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Son 7 günlük trafik analizi</p>
                </div>
                <div className="p-3 bg-muted rounded-2xl border border-border">
                   <TrendingUp className="w-5 h-5 text-primary" />
                </div>
             </div>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.dailyData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem' }}
                        labelStyle={{ fontSize: '10px', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorCount)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
         </div>

         {/* Stats Cards */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group">
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Popülerlik</p>
                  <h4 className="text-3xl font-black text-foreground tracking-tighter">
                     {data.growth > 0 ? '+' : ''}{data.growth}%
                  </h4>
                  <div className={`flex items-center gap-1 mt-2 ${data.growth >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                     {data.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     <span className="text-[10px] font-black uppercase">
                        {data.growth >= 0 ? 'Büyüme Trendi' : 'Düşüş Trendi'}
                     </span>
                  </div>
               </div>
               <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                  <Activity className="w-7 h-7 text-primary" />
               </div>
            </div>

            <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group">
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Müşteri Puanı</p>
                  <h4 className="text-3xl font-black text-foreground tracking-tighter">
                     {data.reviews.length > 0 
                       ? (data.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / data.reviews.length).toFixed(1) 
                       : '0.0'}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                     <Sparkles className="w-3 h-3" />
                     <span className="text-[10px] font-black uppercase">{data.reviews.length} Toplam Yorum</span>
                  </div>
               </div>
               <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                  <PieIcon className="w-7 h-7 text-violet-500" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
