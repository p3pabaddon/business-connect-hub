import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, RefreshCw, Send, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementManagerProps {
  announcementTitle: string;
  setAnnouncementTitle: (val: string) => void;
  announcementBody: string;
  setAnnouncementBody: (val: string) => void;
  announcementTarget: "all" | "businesses" | "customers";
  setAnnouncementTarget: (val: "all" | "businesses" | "customers") => void;
  sendAnnouncement: () => void;
  sendingAnnouncement: boolean;
  announcementHistory: any[];
}

export const AnnouncementManager = ({
  announcementTitle,
  setAnnouncementTitle,
  announcementBody,
  setAnnouncementBody,
  announcementTarget,
  setAnnouncementTarget,
  sendAnnouncement,
  sendingAnnouncement,
  announcementHistory
}: AnnouncementManagerProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Yeni Duyuru Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Başlık</Label>
            <Input placeholder="Duyuru başlığı" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mesaj İçeriği</Label>
            <Textarea placeholder="Duyuru metni..." rows={4} value={announcementBody} onChange={e => setAnnouncementBody(e.target.value)} className="bg-muted/50 border-border rounded-xl resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hedef Kitle</Label>
            <div className="flex gap-3">
              {(["all", "businesses", "customers"] as const).map(t => (
                <button 
                  key={t} 
                  onClick={() => setAnnouncementTarget(t)} 
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all", 
                    announcementTarget === t ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {t === "all" ? "Herkes" : t === "businesses" ? "İşletmeler" : "Müşteriler"}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={sendAnnouncement} disabled={sendingAnnouncement} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
            {sendingAnnouncement ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} DUYURU GÖNDER
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Bell className="w-4 h-4" /> Geçmiş Duyurular
        </h3>
        {announcementHistory.length === 0 ? (
          <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
            <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Henüz duyuru gönderilmedi.</p>
          </div>
        ) : announcementHistory.map((ann: any) => (
          <div key={ann.id} className="p-5 bg-card border border-border rounded-2xl hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{ann.title}</h4>
              <Badge className="bg-muted text-muted-foreground border-border text-[9px] uppercase">
                {ann.target === "all" ? "Herkes" : ann.target === "businesses" ? "İşletmeler" : "Müşteriler"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{ann.body}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">{new Date(ann.created_at).toLocaleString()} • {ann.sent_by}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
