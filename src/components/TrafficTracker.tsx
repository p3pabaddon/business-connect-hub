import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function TrafficTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const logTraffic = async () => {
      try {
        // Extract UTM parameters
        const searchParams = new URLSearchParams(window.location.search);
        const utm_source = searchParams.get("utm_source");
        const utm_medium = searchParams.get("utm_medium");
        const utm_campaign = searchParams.get("utm_campaign");
        const referrer = document.referrer;

        await supabase.from("traffic_logs").insert({
          path: location.pathname,
          user_id: user?.id || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          referrer: referrer || null
        });
      } catch (error) {
        console.error("Traffic log failed:", error);
      }
    };

    logTraffic();
  }, [location.pathname, user?.id]);

  return null;
}
