import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, CheckCircle, XCircle, Clock, 
  Search, ExternalLink, MapPin, Phone, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HqBusinessApproval() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hata", description: "Başvurular çekilemedi.", variant: "destructive" });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "approved", is_active: true, is_verified: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Hata", description: "İşletme onaylanamadı.", variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "İşletme onaylandı ve yayına alındı." });
      fetchApplications();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "rejected", is_active: false })
      .eq("id", id);

    if (error) {
      toast({ title: "Hata", description: "İşlem başarısız.", variant: "destructive" });
    } else {
      toast({ title: "Bilgi", description: "Başvuru reddedildi." });
      fetchApplications();
    }
  };

  const filtered = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card border border-border p-8 rounded-2xl h-full flex flex-col shadow-sm animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter">İşletme Yönetimi</h2>
          <p className="text-muted-foreground text-sm italic">Yeni başvuruları inceleyin ve platform kalitesini koruyun.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="İşletme ara..." 
            className="pl-10 bg-card border-border rounded-xl text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-20 text-center shadow-sm">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Henüz bir başvuru bulunmuyor.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-primary/20 transition-all group shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                  {app.logo ? (
                    <img src={app.logo} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-foreground font-bold text-lg tracking-tight">{app.name}</h3>
                    <Badge variant="outline" className={`
                      text-[10px] uppercase px-1.5
                      ${app.status === 'approved' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                        app.status === 'rejected' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 
                        'text-amber-500 border-amber-500/20 bg-amber-500/5'}
                    `}>
                      {app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><TagIcon className="w-3.5 h-3.5" /> {app.category}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {app.city}, {app.district}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {app.phone}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(app.created_at).toLocaleDateString('tr-TR')}</span>
                    {app.plan && (
                      <Badge variant="secondary" className={cn(
                        "text-[9px] uppercase font-bold tracking-wider rounded-lg border-none",
                        app.plan === "premium" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                      )}>
                        {app.plan === "premium" && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                        {app.plan} Plan (₺{app.plan_price})
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2 px-4"
                  onClick={() => window.open(`/isletme/${app.slug}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" /> İncele
                </Button>
                
                {app.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 gap-2 px-4"
                      onClick={() => handleReject(app.id)}
                    >
                      <XCircle className="w-4 h-4" /> Reddet
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 px-4 shadow-lg shadow-emerald-900/20"
                      onClick={() => handleApprove(app.id)}
                    >
                      <CheckCircle className="w-4 h-4" /> Onayla
                    </Button>
                  </>
                )}
                
                {app.status === 'approved' && app.is_active && (
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 gap-2 px-4"
                    onClick={() => handleReject(app.id)}
                  >
                    Durdur
                  </Button>
                )}

                {app.status === 'rejected' && (
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 gap-2 px-4"
                    onClick={() => handleApprove(app.id)}
                  >
                    Tekrar Etkinleştir
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
