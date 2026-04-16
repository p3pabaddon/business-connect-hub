import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Flag, CheckCircle, XCircle, Star, MessageSquare, ShieldAlert } from "lucide-react";
import { getReportedReviews, resolveReviewReport } from "@/lib/biz-api";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const ReviewReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirmation Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    reportId: string;
    reviewId: string;
    action: 'resolved' | 'dismissed';
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReportedReviews();
      setReports(data);
    } catch (err) {
      console.error("Load reports error:", err);
      toast.error("Raporlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleAction = (reportId: string, action: 'resolved' | 'dismissed', reviewId: string) => {
    if (action === 'resolved') {
      setPendingAction({ reportId, reviewId, action });
      setIsConfirmOpen(true);
    } else {
      executeAction(reportId, action, reviewId);
    }
  };

  const executeAction = async (reportId: string, action: 'resolved' | 'dismissed', reviewId: string, deleteReview: boolean = false) => {
    setProcessing(true);
    try {
      await resolveReviewReport(reportId, action);
      
      if (deleteReview) {
        await supabase.from("reviews").delete().eq("id", reviewId);
        toast.success("Yorum silindi ve rapor çözüldü.");
      } else if (action === 'resolved') {
        toast.success("Rapor çözüldü (yorum silinmedi).");
      } else {
        toast.info("Rapor reddedildi.");
      }
      
      loadReports();
    } catch (err) {
      toast.error("İşlem başarısız");
    } finally {
      setProcessing(false);
      setIsConfirmOpen(false);
      setPendingAction(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Raporlar yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic flex items-center gap-3">
             <Flag className="w-7 h-7 text-rose-500" /> Yorum Raporları
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            İlgilenilmesi gereken şikayet edilen kullanıcı yorumları
          </p>
        </div>
        <Badge variant="outline" className="text-rose-500 border-rose-500/20 bg-rose-500/5 px-4 py-1">
          {reports.length} Aktif Rapor
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <Flag className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Şikayet Nedeni:</span>
                    <span className="text-sm font-semibold">{report.reason}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(report.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="bg-muted/30 rounded-2xl p-5 border border-border/50 italic relative">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-tighter">Orijinal Yorum</span>
                    <div className="flex items-center gap-0.5 ml-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} 
                            fill={i < report.review?.rating ? "currentColor" : "none"}
                            className={cn(
                              "w-2.5 h-2.5",
                              i < report.review?.rating ? "text-warning" : "text-muted/30"
                            )} />
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{report.review?.comment}"
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    <span>Yazan: {report.review?.customer_name}</span>
                    <span>•</span>
                    <span className="text-primary hover:underline cursor-pointer">
                      İşletme: {report.review?.business?.name || "Bilinmiyor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 justify-end min-w-[140px]">
                <Button 
                  onClick={() => handleAction(report.id, 'resolved', report.review_id)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> ONAYLA & SİL
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleAction(report.id, 'dismissed', report.review_id)}
                  className="font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                >
                  <XCircle className="w-4 h-4 mr-2" /> REDDET
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Tertemiz!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm italic">
              Şu an incelenmeyi bekleyen herhangi bir yorum raporu bulunmuyor.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-card border-border rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3 text-rose-500">
               <ShieldAlert className="w-6 h-6" /> YORUMU SİLSİN Mİ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2">
              Raporu onayladınız. Bu yorumu platformdan kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between gap-4 border-t border-border/50 pt-6">
            <AlertDialogCancel 
              disabled={processing}
              className="text-[10px] font-black uppercase tracking-widest rounded-2xl h-14 flex-1 border-border/50 hover:bg-muted"
              onClick={() => {
                if (pendingAction) {
                  executeAction(pendingAction.reportId, 'resolved', pendingAction.reviewId, false);
                }
              }}
            >
              SADECE RAPORU ÇÖZ
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={processing}
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-[10px] font-black uppercase tracking-widest h-14 flex-1 shadow-xl shadow-rose-500/25 rounded-2xl"
              onClick={() => {
                if (pendingAction) {
                  executeAction(pendingAction.reportId, 'resolved', pendingAction.reviewId, true);
                }
              }}
            >
              YORUMU KALICI OLARAK SİL
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
