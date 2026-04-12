import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Megaphone, Power, RefreshCw, Cpu, Activity, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function HqControls() {
  const [maintenance, setMaintenance] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Hüküm uygulandı: Platform ayarları güncellendi.");
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Platform Controls */}
      <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
            <Power className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground">Platform Operasyonları</h3>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl group transition-colors hover:border-rose-500/30">
            <div className="space-y-1">
              <Label className="text-foreground text-base">Hizmet Bakım Modu</Label>
              <p className="text-xs text-muted-foreground">Aktif edildiğinde sadece adminler giriş yapabilir.</p>
            </div>
            <Switch 
              checked={maintenance}
              onCheckedChange={setMaintenance}
              className="data-[state=checked]:bg-rose-500"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-foreground text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" /> Global Duyuru Yayınla
            </Label>
            <div className="relative">
              <textarea 
                className="w-full bg-muted border-border rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary h-24 transition-all"
                placeholder="Tüm sayfalarda üst barda görünecek mesaj..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleApply}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Yürürlüğe Koy"}
          </Button>
        </div>
      </div>

      {/* Diagnostics / Status */}
      <div className="space-y-6">
        <div className="bg-card border border-border p-8 rounded-2xl border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h4 className="text-foreground font-semibold">Kritik Olay Kayıtları</h4>
          </div>
          <div className="space-y-3 opacity-70">
            {[
              "Database connection spikes detected at 02:44",
              "External API timeout (Resend Service)",
              "SSL Certificate auto-renewal successful"
            ].map((msg, i) => (
              <p key={i} className="text-xs font-mono text-muted-foreground border-b border-border pb-2">
                [SYS]: {msg}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <ShieldAlert className="w-48 h-48 text-primary" />
          </div>
          <div className="relative z-10">
            <h4 className="text-foreground font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Node Sağlık Taraması
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Latency</span>
                <span className="text-emerald-500 font-mono text-lg">24ms</span>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Packets</span>
                <span className="text-blue-500 font-mono text-lg">99.9%</span>
              </div>
            </div>
            <Button variant="ghost" className="mt-8 w-full text-muted-foreground hover:text-foreground hover:bg-muted text-xs">
              Detaylı Teşhis Raporu İndir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
