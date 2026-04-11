import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  appointmentId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({ open, onOpenChange, businessId, businessName, appointmentId, onReviewSubmitted }: ReviewModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      business_id: businessId,
      customer_id: user.id,
      appointment_id: appointmentId || null,
      customer_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonim",
      rating,
      comment: comment || null,
      is_visible: true,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Yorum gönderilemedi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Yorumunuz eklendi!", description: "Teşekkür ederiz." });
      setRating(0);
      setComment("");
      onReviewSubmitted?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Değerlendirme Yap</DialogTitle>
          <p className="text-sm text-muted-foreground">{businessName}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">Puanınız *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "text-warning fill-warning"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-comment">Yorumunuz</Label>
            <Textarea
              id="review-comment"
              placeholder="Deneyiminizi paylaşın..."
              className="mt-1.5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            className="w-full"
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
