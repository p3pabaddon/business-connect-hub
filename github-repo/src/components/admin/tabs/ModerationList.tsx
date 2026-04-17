import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Clock, Sparkles, RefreshCw, BrainCircuit, Link2, CheckCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationListProps {
  businesses: any[];
  selectedPending: Set<string>;
  togglePendingSelect: (id: string) => void;
  bulkAction: (action: "approve" | "reject") => void;
  updateBusinessStatus: (id: string, info: any) => void;
  calculateAiScore: (biz: any) => void;
  sendOnboardingLink: (biz: any) => void;
  aiScores: Record<string, { score: number; reasons: string[] }>;
  aiLoading: string | null;
  onboardingSending: string | null;
}

export const ModerationList = ({
  businesses,
  selectedPending,
  togglePendingSelect,
  bulkAction,
  updateBusinessStatus,
  calculateAiScore,
  sendOnboardingLink,
  aiScores,
  aiLoading,
  onboardingSending
}: ModerationListProps) => {
  const pending = businesses.filter(b => b.status === "pending" || !b.status);

  return (
    <div className="space-y-4">
      {selectedPending.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <CheckCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-foreground">{selectedPending.size} başvuru seçildi</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => bulkAction("approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">TOPLU ONAYLA</Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction("reject")} className="rounded-xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5">TOPLU REDDET</Button>
          </div>
        </div>
      )}
      {pending.length === 0 ? (
        <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Bekleyen başvuru bulunmuyor.</p>
        </div>
      ) : (
        pending.map(biz => (
          <Card key={biz.id} className={cn("bg-card border-border p-6 hover:shadow-md transition-shadow", selectedPending.has(biz.id) && "ring-2 ring-primary")}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5">
                <input type="checkbox" checked={selectedPending.has(biz.id)} onChange={() => togglePendingSelect(biz.id)} className="w-5 h-5 rounded border-border accent-primary cursor-pointer" />
                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary text-3xl font-black">{biz.name?.[0]}</div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-black text-foreground text-xl tracking-tight uppercase italic">{biz.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {biz.category}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {biz.city}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(biz.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {aiScores[biz.id] && (
                <div className="ml-[5.5rem] p-4 bg-muted/30 rounded-xl border border-border space-y-2">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-foreground">AI Güvenilirlik Skoru: <span className={cn(aiScores[biz.id].score >= 70 ? "text-emerald-500" : aiScores[biz.id].score >= 40 ? "text-amber-500" : "text-rose-500")}>{aiScores[biz.id].score}/100</span></span>
                  </div>
                  <ul className="text-[10px] text-muted-foreground space-y-1 ml-7">{aiScores[biz.id].reasons.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-3 ml-[5.5rem] flex-wrap">
                <Button size="sm" variant="outline" onClick={() => calculateAiScore(biz)} disabled={aiLoading === biz.id} className="rounded-xl font-bold text-amber-600 border-amber-500/20 hover:bg-amber-500/5">
                  {aiLoading === biz.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />} AI SKOR
                </Button>
                <Button size="sm" onClick={() => { updateBusinessStatus(biz.id, { status: "active", is_active: true }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">SİSTEME AL</Button>
                <Button size="sm" variant="outline" onClick={() => updateBusinessStatus(biz.id, { status: "rejected", is_active: false })} className="rounded-xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5">REDDET</Button>
                <Button size="sm" variant="outline" onClick={() => sendOnboardingLink(biz)} disabled={onboardingSending === biz.id} className="rounded-xl font-bold text-blue-500 border-blue-500/20 hover:bg-blue-500/5">
                  {onboardingSending === biz.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />} DAVETİYE
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
