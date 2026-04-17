import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, Reply, ShieldAlert, Sparkles, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { replyToReview, markReviewHelpful, reportReview } from "@/lib/biz-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  reviews: any[];
  onRefresh: () => void;
}

export function BizReviews({ reviews, onRefresh }: Props) {
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  
  // Voting States
  const [votedReviews, setVotedReviews] = useState<string[]>([]);
  const [localHelpfulCounts, setLocalHelpfulCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedVotes = localStorage.getItem("randevu_helpful_votes");
    if (savedVotes) {
      setVotedReviews(JSON.parse(savedVotes));
    }
  }, []);

  const saveVote = (id: string) => {
    const newVotes = [...votedReviews, id];
    setVotedReviews(newVotes);
    localStorage.setItem("randevu_helpful_votes", JSON.stringify(newVotes));
  };

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

  const handleHelpful = async (reviewId: string) => {
    if (votedReviews.includes(reviewId)) {
      toast.info("Bu yorumu zaten yararlı olarak işaretlediniz.");
      return;
    }

    // Attempt to save vote locally first to avoid re-clicks while processing
    const currentVotes = [...votedReviews, reviewId];
    setVotedReviews(currentVotes);
    localStorage.setItem("randevu_helpful_votes", JSON.stringify(currentVotes));

    // Optimistic update for UI count
    setLocalHelpfulCounts(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || reviews.find(r => r.id === reviewId)?.helpful_count || 0) + 1
    }));
    
    try {
      await markReviewHelpful(reviewId);
      toast.success("Oyunuz başarıyla kaydedildi!");
      // Delayed refresh to sync with DB
      setTimeout(onRefresh, 3000); 
    } catch (error: any) {
      console.error("Helpful vote error:", error);
      toast.error("Oylama sırasında bir hata oluştu. Bağlantınızı kontrol edin.");
      // Rollback
      const reverted = currentVotes.filter(id => id !== reviewId);
      setVotedReviews(reverted);
      localStorage.setItem("randevu_helpful_votes", JSON.stringify(reverted));
      setLocalHelpfulCounts(prev => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    }
  };

  const handleReport = (reviewId: string) => {
    setReportReviewId(reviewId);
    setReportReason("");
    setIsReportOpen(true);
  };

  const submitReport = async () => {
    if (!reportReviewId || !reportReason.trim()) return;
    
    setReporting(true);
    try {
      await reportReview(reportReviewId, reportReason);
      toast.success("Yorum başarıyla raporlandı. Yönetim ekibi inceleyecektir.");
      setIsReportOpen(false);
    } catch (error) {
      toast.error("Rapor gönderilemedi.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-right-4 duration-700">
      
      {/* Review Metrics Sidebar */}
      <div className="lg:col-span-1 space-y-8">
         <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="text-center space-y-2">
               <p className="text-6xl font-black text-foreground tracking-tighter">{averageRating}</p>
               <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      className={cn(
                        "w-5 h-5",
                        Number(averageRating) >= s ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                      )} 
                    />
                  ))}
               </div>
               <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{reviews.length} Değerlendirme</p>
            </div>

            <div className="space-y-3">
               {ratingSummary.map((item, i) => (
                 <div key={i} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-bold text-muted-foreground w-2">{item.stars}</span>
                    <Progress 
                      value={reviews.length > 0 ? (item.count / reviews.length) * 100 : 0} 
                      className="h-1.5 bg-muted overflow-hidden" 
                    />
                    <span className="text-[10px] font-mono text-muted-foreground/60 w-8">{item.count}</span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-border space-y-4">
               <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="text-[10px] text-primary font-bold leading-tight">Yorumlara cevap vermek müşteri sadakatini %25 arttırır.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Review Feed */}
      <div className="lg:col-span-3 bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-sm">
         <div className="p-8 border-b border-border flex items-center justify-between bg-muted/20 sticky top-0 z-10">
            <h3 className="font-bold text-foreground flex items-center gap-3 uppercase tracking-widest text-sm">
               <MessageSquare className="w-5 h-5 text-primary" /> YORUM AKIŞI
            </h3>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            {reviews.map((rev, i) => (
               <div key={rev.id || i} className="p-8 bg-muted/20 border border-border rounded-3xl space-y-6 hover:bg-muted/40 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-xl text-primary shadow-sm uppercase">{(rev.customer_name || "A")[0]}</div>
                         <div>
                            <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{rev.customer_name}</h4>
                            <div className="flex gap-1.5 mt-2">
                               {Array.from({ length: 5 }).map((_, i) => (
                                 <Star 
                                   key={i} 
                                   className={cn(
                                     "w-4 h-4",
                                     rev.rating > i ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20"
                                   )} 
                                 />
                               ))}
                            </div>
                         </div>
                      </div>
                     <span className="text-[10px] text-muted-foreground font-mono italic font-medium">
                       {new Date(rev.created_at).toLocaleDateString('tr-TR')}
                     </span>
                  </div>

                   <p className="text-lg text-foreground/90 leading-relaxed font-medium bg-muted/30 p-6 rounded-2xl border border-border/50 italic">
                     "{rev.comment}"
                   </p>

                   {rev.reply && (
                     <div className="p-6 bg-primary/5 border-l-8 border-primary rounded-r-2xl space-y-3 ml-6 shadow-sm">
                        <p className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                          <Reply className="w-5 h-5" /> KURUMSAL CEVAP
                        </p>
                        <p className="text-sm text-foreground/80 font-semibold italic leading-relaxed">{rev.reply}</p>
                     </div>
                   )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                     <div className="flex gap-4">
                        <button 
                          onClick={() => handleHelpful(rev.id)}
                          disabled={votedReviews.includes(rev.id)}
                          className={cn(
                            "flex items-center gap-2 text-[10px] font-black transition-all uppercase tracking-tight px-3 py-1.5 rounded-lg",
                            votedReviews.includes(rev.id) 
                              ? "text-emerald-500 bg-emerald-500/10 cursor-default" 
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <ThumbsUp className={cn("w-4 h-4", votedReviews.includes(rev.id) && "fill-emerald-500")} /> 
                          {votedReviews.includes(rev.id) ? "YARARLI BULDUNUZ" : "YARARLI"} 
                          {(localHelpfulCounts[rev.id] ?? rev.helpful_count) > 0 && `(${(localHelpfulCounts[rev.id] ?? rev.helpful_count)})`}
                        </button>
                        <button 
                          onClick={() => handleReport(rev.id)}
                          className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-destructive transition-all uppercase tracking-tight"
                        >
                          <ShieldAlert className="w-4 h-4" /> RAPOR ET
                        </button>
                     </div>
                     
                     {replyId === (rev.id || i.toString()) ? (
                        <div className="flex-1 flex gap-2 ml-4 animate-in slide-in-from-right-2">
                           <Input 
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             placeholder="Cevabınızı yazın..." 
                             className="h-10 bg-background border-border text-xs shadow-sm focus:ring-primary/20" 
                           />
                           <Button 
                             onClick={() => handleReply(rev.id)}
                             disabled={loading || !replyText}
                             size="sm" 
                             className="bg-primary hover:bg-primary/90 h-10 px-4 text-white shadow-md shadow-primary/10"
                           >
                              {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                           </Button>
                           <Button 
                             onClick={() => setReplyId(null)}
                             variant="ghost" 
                             size="sm" 
                             className="h-10 px-4 text-muted-foreground hover:bg-muted font-bold text-[10px]"
                           >
                              İPTAL
                           </Button>
                        </div>
                     ) : (
                       !rev.reply && (
                         <Button 
                           onClick={() => setReplyId(rev.id)}
                           size="sm" 
                           className="bg-primary hover:bg-primary/90 text-[10px] font-bold h-9 px-6 text-white shadow-lg shadow-primary/20 rounded-xl"
                         >
                            <Reply className="w-3.5 h-3.5 mr-2" /> CEVAPLA
                         </Button>
                       )
                     )}
                     
                     {rev.reply && !replyId && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 font-black text-[9px] tracking-widest shadow-sm">CEVAPLANDI</Badge>
                     )}
                  </div>
               </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold tracking-tight opacity-40">Henüz yorum yapılmamış.</div>
            )}
         </div>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-500" /> YORUMU RAPOR ET
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2">
              Lütfen bu yorumun neden topluluk kurallarımızı ihlal ettiğini düşündüğünüzü belirtin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <p className="text-[10px] text-rose-500 font-bold leading-tight uppercase tracking-widest">Güvenli Deneyim Politikası</p>
            </div>
            <Input
              id="reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Raporlama nedeninizi detaylandırın..."
              className="bg-muted/30 border-border/50 rounded-2xl h-14 text-sm focus:ring-primary/20 backdrop-blur-md"
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-between gap-4 border-t border-border/50 pt-6">
            <Button
              variant="outline"
              onClick={() => setIsReportOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest rounded-2xl h-12 flex-1 border-border/50 hover:bg-muted"
            >
              VAZGEÇ
            </Button>
            <Button
              onClick={submitReport}
              disabled={reporting || !reportReason.trim()}
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-[10px] font-black uppercase tracking-widest h-12 flex-1 shadow-lg shadow-rose-500/20 rounded-2xl"
            >
              {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "RAPORU TAMAMLA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
