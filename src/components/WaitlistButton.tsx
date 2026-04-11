import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface WaitlistButtonProps {
  businessId: string;
  date: string;
  time: string;
}

export function WaitlistButton({ businessId, date, time }: WaitlistButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("waitlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .eq("desired_date", date)
      .maybeSingle()
      .then(({ data }) => setOnWaitlist(!!data));
  }, [user, businessId, date]);

  const toggle = async () => {
    if (!user) {
      toast({ title: "Giriş yapmalısınız", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (onWaitlist) {
      await supabase
        .from("waitlist")
        .delete()
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .eq("desired_date", date);
      setOnWaitlist(false);
      toast({ title: "Bekleme listesinden çıkarıldınız" });
    } else {
      await supabase.from("waitlist").insert({
        user_id: user.id,
        business_id: businessId,
        desired_date: date,
        desired_time: time,
      });
      setOnWaitlist(true);
      toast({ title: "Bekleme listesine eklendi! Yer açılınca bildirim alacaksınız. ⏰" });
    }
    setLoading(false);
  };

  return (
    <Button
      variant={onWaitlist ? "secondary" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      <Clock className={`w-4 h-4 mr-1 ${onWaitlist ? "text-primary" : ""}`} />
      {onWaitlist ? "Listede" : "Bekleme Listesi"}
    </Button>
  );
}
