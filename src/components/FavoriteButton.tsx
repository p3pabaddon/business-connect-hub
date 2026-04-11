import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  businessId: string;
  size?: "sm" | "default" | "icon";
}

export function FavoriteButton({ businessId, size = "icon" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [user, businessId]);

  const toggle = async () => {
    if (!user) {
      toast({ title: "Giriş yapmalısınız", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("business_id", businessId);
      setIsFav(false);
      toast({ title: "Favorilerden çıkarıldı" });
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, business_id: businessId });
      setIsFav(true);
      toast({ title: "Favorilere eklendi ❤️" });
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className="hover:bg-destructive/10"
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFav ? "fill-destructive text-destructive scale-110" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
