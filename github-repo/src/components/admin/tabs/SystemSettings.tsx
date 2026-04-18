import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw, Save, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemSettingsProps {
  settingsPlatformName: string;
  setSettingsPlatformName: (val: string) => void;
  settingsSupportEmail: string;
  setSettingsSupportEmail: (val: string) => void;
  settingsNoShowLimit: number;
  setSettingsNoShowLimit: (val: number) => void;
  settingsMfa: boolean;
  setSettingsMfa: (val: boolean) => void;
  saveSettings: () => void;
  settingsSaving: boolean;
}

export const SystemSettings = ({
  settingsPlatformName,
  setSettingsPlatformName,
  settingsSupportEmail,
  setSettingsSupportEmail,
  settingsNoShowLimit,
  setSettingsNoShowLimit,
  settingsMfa,
  setSettingsMfa,
  saveSettings,
  settingsSaving
}: SystemSettingsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Temel Parametreler
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Platform Branding</Label>
            <Input value={settingsPlatformName} onChange={e => setSettingsPlatformName(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Destek Gateway</Label>
            <Input value={settingsSupportEmail} onChange={e => setSettingsSupportEmail(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" />
          </div>
          <Button onClick={saveSettings} disabled={settingsSaving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">
            {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} KONFİGÜRASYONU KAYDET
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Güvenlik & Risk Profili
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">No-Show Bloklama Eşik Değeri</Label>
            <Input type="number" value={settingsNoShowLimit} onChange={e => setSettingsNoShowLimit(Number(e.target.value))} className="bg-muted/50 border-border h-11 rounded-xl" />
          </div>
          <div 
            className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer" 
            onClick={() => setSettingsMfa(!settingsMfa)}
          >
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin MFA Zorunluluğu</span>
            <div className={cn("w-12 h-6 rounded-full flex items-center px-1 transition-colors", settingsMfa ? "bg-primary/20 border border-primary/40" : "bg-muted border border-border")}>
              <div className={cn("w-4 h-4 rounded-full shadow-sm transition-all", settingsMfa ? "bg-primary ml-auto" : "bg-muted-foreground ml-0")}></div>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={settingsSaving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">
            {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} GÜVENLİK AYARLARINI KAYDET
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
