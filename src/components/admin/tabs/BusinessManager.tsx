import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessManagerProps {
  businesses: any[];
  searchTerm: string;
  updateBusinessStatus: (id: string, info: any) => void;
}

export const BusinessManager = ({ businesses, searchTerm, updateBusinessStatus }: BusinessManagerProps) => {
  const filteredBusinesses = businesses.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-6">
      {filteredBusinesses.map(biz => (
        <Card key={biz.id} className="bg-card border-border p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary font-black text-lg shrink-0">{biz.name?.[0]}</div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm lg:text-base leading-tight uppercase tracking-tight truncate">{biz.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-muted-foreground font-medium truncate">{biz.city} • {biz.category} • {biz.appointments?.[0]?.count || 0} randevu</p>
                {(biz.plan || biz.is_premium) && (
                  <Badge variant="outline" className={cn(
                    "text-[8px] uppercase font-black px-1.5 py-0 rounded-md shrink-0 border-none",
                    (biz.plan === 'premium' || biz.plan === 'pro' || biz.is_premium) 
                      ? "bg-amber-500/10 text-amber-500" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {biz.plan?.toUpperCase() || (biz.is_premium ? 'PRO' : 'STARTER')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" onClick={() => window.open(`/isletme/${biz.slug}`, '_blank')}><Eye className="w-5 h-5" /></Button>
            <Button 
              size="sm" 
              onClick={() => updateBusinessStatus(biz.id, { is_active: !biz.is_active })}
              className={cn(
                "flex-1 sm:flex-none h-10 text-[10px] font-black tracking-widest uppercase border-none rounded-xl px-6",
                biz.is_active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              )}
            >
              {biz.is_active ? "İŞLETME AKTİF" : "İŞLETME PASİF"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
