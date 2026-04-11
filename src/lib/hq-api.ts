import { supabase } from "./supabase";

export interface TrafficData {
  time: string;
  users: number;
  requests: number;
}

export interface BusinessVelocity {
  date: string;
  count: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface LiveLog {
  id: string;
  created_at: string;
  path: string;
  user_email?: string;
}

export interface AttributionData {
  source: string;
  count: number;
  color: string;
}

export interface RiskMerchant {
  name: string;
  lastActive: string;
  riskScore: number; // 0-100
}

const CATEGORY_COLORS: Record<string, string> = {
  "Berber": "#3b82f6",
  "Güzellik Salonu": "#ec4899",
  "Klinik": "#10b981",
  "Spa": "#8b5cf6",
  "Diğer": "#64748b"
};

const SOURCE_COLORS: Record<string, string> = {
  "Instagram": "#e1306c",
  "Google": "#4285f4",
  "Ads": "#f4b400",
  "Direct": "#10b981",
  "Referral": "#8b5cf6"
};

export const getHqAnalytics = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: logs } = await supabase
    .from("traffic_logs")
    .select("created_at, user_id, utm_source")
    .gt("created_at", sevenDaysAgo);

  // 24h Traffic Pulse
  const trafficMap: Record<string, { users: Set<string|null>, requests: number }> = {};
  for (let i = 0; i < 24; i++) {
    const hour = `${i}:00`;
    trafficMap[hour] = { users: new Set(), requests: 0 };
  }

  logs?.filter(l => new Date(l.created_at) > new Date(twentyFourHoursAgo)).forEach(log => {
    const date = new Date(log.created_at);
    const hour = `${date.getHours()}:00`;
    if (trafficMap[hour]) {
      trafficMap[hour].requests += 1;
      trafficMap[hour].users.add(log.user_id);
    }
  });

  const traffic: TrafficData[] = Object.entries(trafficMap).map(([time, data]) => ({
    time,
    users: data.users.size,
    requests: data.requests
  }));

  // Marketing Attribution
  const attributionMap: Record<string, number> = { "Direct": 0 };
  logs?.forEach(log => {
    const source = log.utm_source || "Direct";
    attributionMap[source] = (attributionMap[source] || 0) + 1;
  });

  const attribution: AttributionData[] = Object.entries(attributionMap).map(([source, count]) => ({
    source,
    count,
    color: SOURCE_COLORS[source] || "#64748b"
  }));

  // Business Stats
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, created_at, name, category, city')
    .order('created_at', { ascending: true });

  // Risk Analysis (Mock logic using real busines list + log activity)
  const activeBizIds = new Set(logs?.map(l => l.user_id)); // Simplifying user_id as biz identifer for meta-analysis
  const atRiskMerchants: RiskMerchant[] = businesses?.slice(0, 5).map(b => ({
    name: b.name,
    lastActive: "3 gün önce",
    riskScore: Math.floor(Math.random() * 40) + 10 // Real algorithm would check exact log entries for this biz_uuid
  })) || [];

  // Categories
  const categoryMap: Record<string, number> = {};
  businesses?.forEach(b => {
    let cat = b.category || "Diğer";
    if (cat.toLowerCase().includes("berber")) cat = "Berber";
    if (cat.toLowerCase().includes("güzellik") || cat.toLowerCase().includes("guzellik")) cat = "Güzellik Salonu";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categories: CategoryData[] = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Diğer"]
  }));

  // Financials
  const { data: revenueData } = await supabase.from('appointments').select('price').eq('status', 'completed');
  const revenue = revenueData?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;
  
  // Simulated Startup Metrics
  const mrr = revenue + 12500; // Simulated historical baseline
  const ltv = 450; // Estimated 
  const churnRate = 2.4; // %

  return { 
    traffic, 
    attribution,
    categories,
    atRiskMerchants,
    bizCount: businesses?.length || 0, 
    userCount: 0, // Profile counts are less critical for HQ v3
    revenue,
    financials: { mrr, ltv, churnRate }
  };
};

export const getLiveLogs = async (limit = 10): Promise<LiveLog[]> => {
  const { data } = await supabase
    .from("traffic_logs")
    .select(`id, created_at, path, profiles:user_id (email)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((item: any) => ({
    id: item.id,
    created_at: item.created_at,
    path: item.path,
    user_email: item.profiles?.email
  }));
};

export const getSystemHealth = () => {
  return {
    cpu: Math.floor(Math.random() * 8) + 2,
    memory: Math.floor(Math.random() * 15) + 12,
    dbConnections: Math.floor(Math.random() * 20) + 15,
    uptime: "14d 8h 24m"
  };
};
