import { useState, useEffect } from "react";
import { 
  Activity, Users, Briefcase, TrendingUp, Zap, 
  Database, Cpu, HardDrive, ShieldCheck, Building2,
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
import { HqBusinessApproval } from "@/components/hq/HqBusinessApproval";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { toast } from "sonner";

type Tab = "overview" | "market" | "attribution" | "financials" | "risk" | "logs" | "controls" | "businesses";

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
        { id: "businesses", label: "İşletme Yönetimi", icon: Building2 },
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
    <div className="flex min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-24"}
      `}>
        <div className="p-6 flex items-center gap-3">
          <Logo iconOnly className="w-10 h-10" />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-heading font-black text-xl tracking-tighter whitespace-nowrap">HQ CONTROL</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">System Admin</p>
            </div>
          )}
        </div>

        <div className="flex-1 px-4 space-y-10 mt-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {sidebarOpen && <p className="text-[10px] uppercase font-bold text-muted-foreground px-4 mb-3 tracking-[3px]">{group.group}</p>}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

        <div className="p-6 border-t border-border">
          <div className="bg-muted/50 rounded-2xl p-4 mb-4">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] text-muted-foreground uppercase">Health Score</span>
               <span className="text-xs font-bold text-emerald-500">98%</span>
             </div>
             <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[98%]"></div>
             </div>
          </div>
          <button 
            onClick={() => { signOut(); navigate("/hq-gate-auth-v2-j5l1z8y9w"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-rose-500 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Disconnect</span>}
          </button>
        </div>
      </aside>

      {/* Main Content V3 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted border border-border rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground uppercase">Root</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary font-bold uppercase">{activeTab}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="bg-muted border-border hover:bg-muted h-10 ml-2">
              <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Verileri Yenile
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="hidden md:flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-full">
               <div className={`w-2 h-2 rounded-full ${health.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sistem: {health.status}</span>
            </div>

            <div className="h-6 w-[1px] bg-border mx-2"></div>

            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Siteye Git</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content V3 */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[1700px] mx-auto space-y-10">
            
            {/* Context Header for Overview */}
            {activeTab === "overview" && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                <div>
                   <h2 className="text-3xl font-heading font-black text-foreground tracking-tighter">Growth Matrix</h2>
<p className="text-muted-foreground mt-2 text-sm italic">"Başarı bir tesadüf değildir; doğru metriklerin doğru zamanlanmasıdır."</p>
</div>
<div className="flex gap-3">
<div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-4">
<div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
<TrendingUp className="w-5 h-5 text-emerald-500" />
</div>
<div>
<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Growth</p>
<p className="text-foreground font-bold">+12%</p>
</div>
</div>
</div>
</div>
)}

{/* KPI Grid V3 */}
{activeTab === "overview" && (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{kpis.map((kpi, i) => (
<div key={i} className="bg-card border border-border p-8 rounded-3xl hover:bg-muted/50 transition-all duration-500 group shadow-sm">
<div className="flex justify-between items-start mb-6">
<div className="p-3 bg-muted rounded-2xl border border-border group-hover:border-primary/30 transition-colors">
<kpi.icon className={`w-6 h-6 ${kpi.color}`} />
</div>
<Badge className="bg-muted text-muted-foreground border-border text-[10px] uppercase tracking-tighter">
{kpi.trend}
</Badge>
</div>
<div className="space-y-1">
<p className="text-4xl font-black text-foreground tracking-tighter">{kpi.value}</p>
<p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">{kpi.label}</p>
</div>
</div>
))}
</div>
)}

            {/* Render Tabs */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-card border border-border p-8 rounded-3xl h-[500px] shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Traffic Engine Velocity</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={trafficData}>
                        <defs>
                          <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }} />
                        <Area type="step" dataKey="requests" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPulse)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card border border-border p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-primary/10 rounded-full border-4 border-primary/20 flex items-center justify-center mb-6 relative">
                       <Zap className="w-10 h-10 text-primary animate-pulse" />
                       <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                          <Badge className="bg-primary text-[10px] border-none shadow-lg">RUNNING</Badge>
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">Platform Optimized</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">Tüm node'lar stabil ve büyüme akışına hazır. Her şey kontrol altında reis.</p>
                  </div>
                </div>
              )}

              {activeTab === "market" && <HqMarketIntelligence data={categoryData} />}
              {activeTab === "attribution" && <HqAttribution data={attributionData} />}
              {activeTab === "financials" && <HqFinancials data={financials} />}
              {activeTab === "risk" && <HqGrowthRisk data={riskData} />}
              {activeTab === "logs" && <div className="h-[700px]"><HqLiveLogs /></div>}
              {activeTab === "controls" && <HqControls />}
              {activeTab === "businesses" && <HqBusinessApproval />}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
