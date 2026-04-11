import { useState, useEffect } from "react";
import { 
  Activity, Users, Briefcase, TrendingUp, Zap, 
  Database, Cpu, HardDrive, ShieldCheck, 
  Globe, RefreshCcw, LayoutDashboard, Terminal, Settings, 
  BarChart3, Menu, LogOut, Search, PieChart as PieChartIcon, 
  LineChart, MousePointer2, ShieldAlert
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from "recharts";
import { getHqAnalytics, getSystemHealth, TrafficData, BusinessVelocity, CategoryData, AttributionData, RiskMerchant } from "@/lib/hq-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HqLiveLogs } from "@/components/hq/HqLiveLogs";
import { HqMarketIntelligence } from "@/components/hq/HqMarketIntelligence";
import { HqControls } from "@/components/hq/HqControls";
import { HqAttribution } from "@/components/hq/HqAttribution";
import { HqFinancials } from "@/components/hq/HqFinancials";
import { HqGrowthRisk } from "@/components/hq/HqGrowthRisk";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "overview" | "market" | "attribution" | "financials" | "risk" | "logs" | "controls";

export default function HqDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [velocityData, setVelocityData] = useState<BusinessVelocity[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [attributionData, setAttributionData] = useState<AttributionData[]>([]);
  const [riskData, setRiskData] = useState<RiskMerchant[]>([]);
  const [financials, setFinancials] = useState({ mrr: 0, ltv: 0, churnRate: 0 });
  
  const [health, setHealth] = useState(getSystemHealth());
  const [stats, setStats] = useState({ bizCount: 0, userCount: 0, revenue: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    const data = await getHqAnalytics();
    setTrafficData(data.traffic);
    setCategoryData(data.categories);
    setAttributionData(data.attribution);
    setRiskData(data.atRiskMerchants);
    setFinancials(data.financials);
    setStats({ bizCount: data.bizCount, userCount: data.userCount, revenue: data.revenue });
    setHealth(getSystemHealth());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const navGroups = [
    {
      group: "Intelligence",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "market", label: "Sektörel Zeka", icon: PieChartIcon },
        { id: "attribution", label: "Pazarlama ROI", icon: MousePointer2 },
      ]
    },
    {
      group: "Operations",
      items: [
        { id: "financials", label: "Gelir & Büyüme", icon: LineChart },
        { id: "risk", label: "Kayıp Sentinel", icon: ShieldAlert },
        { id: "logs", label: "Canlı Loglar", icon: Terminal },
      ]
    },
    {
      group: "Control",
      items: [
        { id: "controls", label: "Karargah Ayarı", icon: Settings },
      ]
    }
  ];

  const kpis = [
    { label: "Pulse Access", value: trafficData.reduce((acc, curr) => acc + curr.requests, 0).toLocaleString(), icon: Activity, trend: "Live", color: "text-blue-500" },
    { label: "Active Revenue", value: `₺${stats.revenue.toLocaleString()}`, icon: TrendingUp, trend: "Financial", color: "text-emerald-500" },
    { label: "Churn Risk", value: `%${financials.churnRate}`, icon: ShieldAlert, trend: "Stability", color: "text-rose-500" },
    { label: "Growth Health", value: "98/100", icon: Zap, trend: "Startup", color: "text-amber-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* Sidebar V3 */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-[#0f172a]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-all duration-300 relative z-50`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)]">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-heading font-black text-white text-xl tracking-tighter block leading-none">STARTUP HQ</span>
              <span className="text-[10px] text-primary uppercase font-mono tracking-widest mt-1 block">Level 3 Command</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-4 space-y-10 mt-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {sidebarOpen && <p className="text-[10px] uppercase font-bold text-slate-600 px-4 mb-3 tracking-[3px]">{group.group}</p>}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-primary' : ''}`} />
                    {sidebarOpen && <span className="font-medium text-sm tracking-tight">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <div className="bg-slate-900/50 rounded-2xl p-4 mb-4">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] text-slate-500 uppercase">Health Score</span>
               <span className="text-xs font-bold text-emerald-500">98%</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[98%]"></div>
             </div>
          </div>
          <button 
            onClick={() => { signOut(); navigate("/hq/login"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-500 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Disconnect</span>}
          </button>
        </div>
      </aside>

      {/* Main Content V3 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header V3 */}
        <header className="bg-[#020617]/90 backdrop-blur-md border-b border-slate-800/80 px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 capitalize">
                {activeTab.replace("-", " ")}
                <Badge variant="outline" className="text-primary border-primary/20 text-[10px] bg-primary/5 uppercase px-1.5">v3.0 Growth</Badge>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-8 mr-4 text-xs font-mono text-slate-500 uppercase tracking-widest border-r border-slate-800 pr-8">
               <div className="flex flex-col items-end">
                  <span className="text-slate-600 text-[10px]">Latency</span>
                  <span className="text-emerald-500">22ms</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-slate-600 text-[10px]">Node Status</span>
                  <span className="text-primary">E-Stable</span>
               </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="bg-slate-900 border-slate-800 hover:bg-slate-800 h-10">
              <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Fetch Analytics
            </Button>
          </div>
        </header>

        {/* Dynamic Content V3 */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[1700px] mx-auto space-y-10">
            
            {/* Context Header for Overview */}
            {activeTab === "overview" && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                <div>
                   <h2 className="text-3xl font-heading font-black text-white tracking-tighter">Growth Matrix</h2>
                   <p className="text-slate-500 mt-2 text-sm italic">"Başarı bir tesadüf değildir; doğru metriklerin doğru zamanlanmasıdır."</p>
                </div>
                <div className="flex gap-3">
                   <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                         <TrendingUp className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Growth</p>
                         <p className="text-white font-bold">+12%</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* KPI Grid V3 */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                  <div key={i} className="bg-[#0f172a]/40 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl hover:bg-slate-900 transition-all duration-500 group relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-primary/30 transition-colors">
                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                      <Badge className="bg-slate-950 text-slate-400 border-slate-800 text-[10px] uppercase tracking-tighter">
                         {kpi.trend}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-white tracking-tighter">{kpi.value}</p>
                      <p className="text-xs uppercase font-bold text-slate-600 tracking-widest">{kpi.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render Tabs */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl h-[500px]">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Traffic Engine Velocity</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={trafficData}>
                        <defs>
                          <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                        <Area type="step" dataKey="requests" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPulse)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full border-4 border-primary/20 flex items-center justify-center mb-6 relative">
                       <Zap className="w-10 h-10 text-primary animate-pulse" />
                       <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                          <Badge className="bg-primary text-[10px] border-none shadow-lg">RUNNING</Badge>
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Platform Optimized</h3>
                    <p className="text-sm text-slate-500 max-w-xs">Tüm node'lar stabil ve büyüme akışına hazır. Her şey kontrol altında reis.</p>
                  </div>
                </div>
              )}

              {activeTab === "market" && <HqMarketIntelligence data={categoryData} />}
              {activeTab === "attribution" && <HqAttribution data={attributionData} />}
              {activeTab === "financials" && <HqFinancials data={financials} />}
              {activeTab === "risk" && <HqGrowthRisk data={riskData} />}
              {activeTab === "logs" && <div className="h-[700px]"><HqLiveLogs /></div>}
              {activeTab === "controls" && <HqControls />}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
