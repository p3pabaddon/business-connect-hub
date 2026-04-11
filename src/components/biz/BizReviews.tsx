import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Reply, ShieldAlert, Sparkles, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { replyToReview } from "@/lib/biz-api";
import { cn } from "@/lib/utils";

interface Props {
  reviews: any[];
  onRefresh: () => void;
}

export function BizReviews({ reviews, onRefresh }: Props) {
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingSummary = [5,4,3,2,1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length
  }));

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await replyToReview(id, replyText);
      setReplyId(null);
      setReplyText("");
      onRefresh();
    } catch (error) {
      console.error("Reply error:", error);
      alert("Yorum gönderilirken hata oluştu: " + ((error as any)?.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-right-4 duration-700">
      
      {/* Review Metrics Sidebar */}
      <div className="lg:col-span-1 space-y-8">
         <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="text-center space-y-2">
               <p className="text-6xl font-black text-white tracking-tighter">{averageRating}</p>
               <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      className={cn(
                        "w-5 h-5",
                        Number(averageRating) >= s ? "fill-amber-500 text-amber-500" : "text-slate-700"
                      )} 
                    />
                  ))}
               </div>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{reviews.length} Değerlendirme</p>
            </div>

            <div className="space-y-3">
               {ratingSummary.map((item, i) => (
                 <div key={i} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-bold text-slate-500 w-2">{item.stars}</span>
                    <Progress 
                      value={reviews.length > 0 ? (item.count / reviews.length) * 100 : 0} 
                      className="h-1.5 bg-slate-900 overflow-hidden" 
                    />
                    <span className="text-[10px] font-mono text-slate-600 w-8">{item.count}</span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
               <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="text-[10px] text-primary font-bold leading-tight">Yorumlara cevap vermek müşteri sadakatini %25 arttırır.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Review Feed */}
      <div className="lg:col-span-3 bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[700px]">
         <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/20 sticky top-0 z-10">
            <h3 className="font-bold text-white flex items-center gap-3 lowercase tracking-widest">
               <MessageSquare className="w-5 h-5 text-primary" /> YORUM AKIŞI
            </h3>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            {reviews.map((rev, i) => (
               <div key={rev.id || i} className="p-8 bg-slate-950/40 border border-slate-800 rounded-3xl space-y-6 hover:bg-slate-900 transition-all duration-300">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600">{(rev.customer_name || "A")[0]}</div>
                        <div>
                           <h4 className="font-bold text-white">{rev.customer_name}</h4>
                           <div className="flex gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "w-3 h-3",
                                    rev.rating > i ? "fill-amber-500 text-amber-500" : "text-slate-700"
                                  )} 
                                />
                              ))}
                           </div>
                        </div>
                     </div>
                     <span className="text-[10px] text-slate-600 font-mono italic">
                       {new Date(rev.created_at).toLocaleDateString('tr-TR')}
                     </span>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed italic">"{rev.comment}"</p>

                  {rev.reply && (
                    <div className="p-4 bg-slate-900/50 border-l-2 border-primary rounded-r-xl space-y-2">
                       <p className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                         <Reply className="w-3 h-3" /> Cevabınız
                       </p>
                       <p className="text-xs text-slate-500 italic">{rev.reply}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                     <div className="flex gap-4">
                        <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"><ThumbsUp className="w-4 h-4" /> YARARLI</button>
                        <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"><ShieldAlert className="w-4 h-4" /> RAPOR ET</button>
                     </div>
                     
                     {replyId === (rev.id || i.toString()) ? (
                        <div className="flex-1 flex gap-2 ml-4">
                           <Input 
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             placeholder="Cevabınızı yazın..." 
                             className="h-10 bg-slate-900 border-slate-800 text-xs" 
                           />
                           <Button 
                             onClick={() => handleReply(rev.id)}
                             disabled={loading || !replyText}
                             size="sm" 
                             className="bg-primary hover:bg-primary/90 h-10 px-4"
                           >
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                           </Button>
                           <Button 
                             onClick={() => setReplyId(null)}
                             variant="ghost" 
                             size="sm" 
                             className="h-10 px-4 text-slate-500 hover:text-white"
                           >
                              İPTAL
                           </Button>
                        </div>
                     ) : (
                       !rev.reply && (
                         <Button 
                           onClick={() => setReplyId(rev.id)}
                           size="sm" 
                           className="bg-primary hover:bg-primary/90 text-[10px] font-bold h-8 px-4"
                         >
                            <Reply className="w-3.5 h-3.5 mr-2" /> CEVAPLA
                         </Button>
                       )
                     )}
                     
                     {rev.reply && !replyId && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-bold text-[9px] tracking-widest">CEVAPLANDI</Badge>
                     )}
                  </div>
               </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">Henüz yorum yapılmamış.</div>
            )}
         </div>
      </div>

    </div>
  );
}
