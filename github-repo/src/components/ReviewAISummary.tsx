import { Star, Zap, ThumbsUp, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Review {
  rating: number;
  comment: string;
}

export function ReviewAISummary({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length < 1) return null;

  // Simple heuristic analysis
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  
  // High-frequency positive keywords (Turkish)
  const keywords = [
    { word: "temiz", label: "Hijyenik Ortam", icon: ShieldCheck },
    { word: "hızlı", label: "Hızlı Servis", icon: TrendingUp },
    { word: "güler yüz", label: "Güler Yüzlü Ekip", icon: ThumbsUp },
    { word: "kalite", label: "Yüksek Kalite", icon: Star },
    { word: "profesyonel", label: "Profesyonel Yaklaşım", icon: Sparkles }
  ];

  const detectedInsights = keywords.filter(k => 
    reviews.some(r => r.comment.toLowerCase().includes(k.word))
  ).slice(0, 3);

  // Fallback if no keywords hit
  if (detectedInsights.length === 0 && avgRating >= 4) {
    detectedInsights.push({ word: "memnuniyet", label: "Yüksek Müşteri Memnuniyeti", icon: ThumbsUp });
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-6 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
         <Sparkles className="w-16 h-16 text-accent" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/20">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <h3 className="font-heading font-black text-foreground uppercase tracking-tight text-sm">Yapay Zeka Analizi</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {reviews.length} yorum baz alınarak yapılan analize göre; bu işletme özellikle 
        <span className="text-foreground font-bold"> {detectedInsights.map(i => i.label).join(", ")} </span> 
        konularında öne çıkıyor. Müşterilerin çoğu hizmet kalitesinden oldukça memnun.
      </p>

      <div className="flex flex-wrap gap-2">
        {detectedInsights.map((insight, idx) => (
          <Badge key={idx} variant="outline" className="bg-accent/10 border-accent/20 text-accent gap-1 py-1 px-3">
            <insight.icon className="w-3 h-3" /> {insight.label}
          </Badge>
        ))}
        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3">
          %{Math.round(avgRating * 20)} Genel Skor
        </Badge>
      </div>
    </div>
  );
}

