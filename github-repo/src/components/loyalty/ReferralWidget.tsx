import { useState, useEffect } from "react";
import { Share2, Copy, Check, Gift, Users, Ticket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getReferralStats, claimReferral } from "@/lib/api";

interface ReferralWidgetProps {
  referralCode: string;
  className?: string;
}

export const ReferralWidget = ({ referralCode, className }: ReferralWidgetProps) => {
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [stats, setStats] = useState({ count: 0, earnings: 0 });
  const [targetCode, setTargetCode] = useState("");
  const referralLink = `${window.location.origin}/kayit?ref=${referralCode}`;

  useEffect(() => {
    loadStats();
    checkPendingReferral();
  }, []);

  const checkPendingReferral = async () => {
    const pendingRef = localStorage.getItem("pending_referral");
    if (pendingRef) {
      try {
        await claimReferral(pendingRef);
        toast.success("Referans ödülünüz başarıyla tanımlandı!");
        localStorage.removeItem("pending_referral");
        loadStats();
      } catch (err) {
        console.error("Otomatik referans hatası:", err);
      }
    }
  };

  const loadStats = async () => {
    try {
      const data = await getReferralStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referans linki kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!targetCode) return;
    setClaiming(true);
    try {
      await claimReferral(targetCode);
      toast.success("Harika! Referans kodu başarıyla uygulandı.");
      setTargetCode("");
      loadStats();
    } catch (err: any) {
      toast.error(err.message || "Kod uygulanamadı");
    } finally {
      setClaiming(false);
    }
  };

  const shareData = {
    title: "Randevu Platformu",
    text: "En iyi işletmelerden randevu almak için bu linki kullan, sen de indirim kazan!",
    url: referralLink,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Paylaşım hatası:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={`${className} border-2 border-accent/20`}>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Arkadaşlarını Davet Et</CardTitle>
          <CardDescription>
            Arkadaşların dükkanları keşfetsin, sen dükkan bazlı <span className="font-bold text-foreground italic">özel ödüller</span> kazan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-muted/50 font-mono text-[10px] focus-visible:ring-0"
            />
            <Button variant="secondary" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button className="w-full" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Hemen Paylaş
          </Button>

          <div className="pt-4 border-t border-border flex items-center justify-around text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Davetlerin</p>
              <p className="text-xl font-heading">{stats.count}</p>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Toplam Kazanç</p>
              <p className="text-xl font-heading text-accent">₺{stats.earnings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Kodun mu var?</CardTitle>
              <CardDescription>Arkadaşının kodunu gir ve ilk ödülünü kap.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seni bu platforma bir arkadaşın mı davet etti? Onun kodunu aşağıya girerek 
            yapacağın ilk randevuda dükkanın belirlediği hoş geldin indirimini kazanabilirsin.
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder="Örn: REF-12345"
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
              className="bg-background border-primary/20"
            />
            <Button onClick={handleClaim} disabled={claiming || !targetCode}>
              {claiming ? "..." : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
