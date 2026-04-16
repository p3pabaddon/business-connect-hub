import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import { reportReview } from "@/lib/biz-api";
import { toast } from "sonner";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
}

export function ReportModal({ open, onOpenChange, reviewId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Lütfen bir raporlama nedeni belirtin.");
      return;
    }

    setSubmitting(true);
    try {
      await reportReview(reviewId, reason.trim());
      toast.success("Rapor Edildi", { 
        description: "İncelememiz için teşekkürler. Moderatör ekibimiz en kısa sürede kontrol edecektir." 
      });
      setReason("");
      onOpenChange(false);
    } catch (err) {
      console.error("Report review error:", err);
      toast.error("Hata", { description: "Rapor gönderilirken bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
            <Flag className="w-6 h-6 text-rose-500" />
          </div>
          <DialogTitle className="font-heading text-xl">Yorumü Rapor Et</DialogTitle>
          <DialogDescription>
            Bu yorumun topluluk kurallarımızı ihlal ettiğini mi düşünüyorsunuz? 
            Lütfen nedenini aşağıda detaylandırın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason" className="text-sm font-bold uppercase tracking-tight">Rapor Etme Sebebiniz</Label>
            <Textarea
              id="report-reason"
              placeholder="Örn: Hakaret, yanıltıcı içerik, spam vb..."
              className="resize-none h-32 bg-muted/30 focus-visible:ring-rose-500 border-border/50"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Vazgeç
            </Button>
            <Button
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold"
              disabled={!reason.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor
                </>
              ) : (
                "Raporu Gönder"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
