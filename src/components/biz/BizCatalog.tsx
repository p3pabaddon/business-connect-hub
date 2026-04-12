import { useState, useEffect } from "react";
import { 
  Scissors, Users, Plus, 
  Trash2, Edit3, Banknote,
  Clock, Star, ShieldCheck,
  CheckCircle2, XCircle, Loader2, RefreshCw, Zap, Check
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { addService, deleteService, addStaff, deleteStaff, updateService, updateStaff } from "@/lib/biz-api";
import { getGoogleAuthUrl, disconnectGoogleCalendar } from "@/lib/google-calendar";

interface Props {
  businessId: string;
  services: any[];
  staff: any[];
  onRefresh: () => void;
  personnelLimit: number;
}

export function BizCatalog({ businessId, services, staff, onRefresh, personnelLimit }: Props) {
  useEffect(() => {
    console.log("BizCatalog Data Check - Services:", services);
    console.log("BizCatalog Data Check - Staff:", staff);
  }, [services, staff]);

  const [activeSubTab, setActiveSubTab] = useState<"services" | "staff">("services");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [role, setRole] = useState("");

  const resetForm = () => {
    setName(""); setPrice(""); setDuration(""); setRole(""); setEditId(null);
  };

  const handleEditInit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    if (activeSubTab === "services") {
      setPrice(String(item.price));
      setDuration(String(item.duration));
    } else {
      setRole(item.role || "");
    }
  };

  const handleAddOrUpdate = async () => {
    if (!name) return;
    
    // Personnel Limit Check
    if (activeSubTab === "staff" && !editId && staff.length >= personnelLimit) {
      toast.error(`Personel limitine ulaştınız (${personnelLimit}). Daha fazla personel eklemek için Pro pakete geçmelisiniz.`);
      return;
    }

    setLoading(true);
    try {
      if (activeSubTab === "services") {
        if (editId) {
          await updateService(editId, { name, price: Number(price) || 0, duration: Number(duration) || 30 });
        } else {
          await addService(businessId, name, Number(price) || 0, Number(duration) || 30);
        }
      } else {
        if (editId) {
          await updateStaff(editId, { name, role: role || "Personel" });
        } else {
          await addStaff(businessId, name, role || "Personel");
        }
      }
      resetForm();
      onRefresh();
      toast.success(`${activeSubTab === 'services' ? 'Hizmet' : 'Personel'} başarıyla kaydedildi.`);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Kaydetme sırasında bir hata oluştu: " + (err.message || err.details || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu öğeyi silmek (pasife almak) istediğinize emin misiniz?")) return;
    try {
      if (activeSubTab === "services") {
        await deleteService(id);
      } else {
        await deleteStaff(id);
      }
      onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex gap-4 p-1.5 bg-muted/50 border border-border rounded-2xl w-fit">
         <button
           onClick={() => { setActiveSubTab("services"); resetForm(); }}
           className={cn(
             "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
             activeSubTab === "services" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
           )}
         >
           <Scissors className="w-4 h-4" /> HİZMET KATALOĞU
         </button>
         <button
           onClick={() => { setActiveSubTab("staff"); resetForm(); }}
           className={cn(
             "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
             activeSubTab === "staff" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
           )}
         >
           <Users className="w-4 h-4" /> PERSONEL LİSTESİ
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main List */}
         <div className="lg:col-span-2 space-y-4">
            {activeSubTab === "services" ? (
               <div className="space-y-4">
                  {services.filter(s => s.is_active !== false).map((service, i) => (
                    <div key={i} className="group p-8 bg-card border border-border rounded-[2.5rem] flex items-center justify-between hover:border-primary/40 hover:bg-muted/5 transition-all duration-500 shadow-sm hover:shadow-xl">
                       <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                              <Scissors className="w-10 h-10 text-primary" />
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">{service.name}</h4>
                              <div className="flex items-center gap-6 text-[11px] text-muted-foreground font-black uppercase tracking-widest leading-none">
                                 <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-sm"><Zap className="w-4 h-4" /> {service.duration} Dakika</span>
                                 <span className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-sm">₺{service.price}</span>
                              </div>
                           </div>
                        </div>
                       <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
                          <Button 
                            onClick={() => handleEditInit(service)}
                            variant="outline" 
                            size="icon" 
                            className="h-11 w-11 border-border bg-background hover:bg-muted rounded-xl transition-all"
                          >
                            <Edit3 className="w-5 h-5 text-muted-foreground" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(service.id)}
                            variant="outline" 
                            size="icon" 
                            className="h-11 w-11 border-border bg-background hover:bg-rose-500 text-white hover:border-rose-600 rounded-xl group/del transition-all"
                          >
                            <Trash2 className="w-5 h-5 text-muted-foreground group-hover/del:text-white" />
                          </Button>
                       </div>
                    </div>
                  ))}
                  {services.filter(s => s.is_active !== false).length === 0 && (
                     <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl text-muted-foreground">Henüz hizmet eklenmemiş.</div>
                   )}
                </div>
             ) : (
               <div className="space-y-4">
                  {staff.filter(s => s.is_active !== false).map((member, i) => (
                    <div key={i} className="group p-8 bg-card border border-border rounded-[2.5rem] flex items-center justify-between hover:border-primary/40 hover:bg-muted/5 transition-all duration-500 shadow-sm hover:shadow-xl">
                       <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-3xl border border-indigo-500/20 flex items-center justify-center shrink-0 font-black text-3xl text-indigo-600 uppercase shadow-inner">
                              {member.name[0]}
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">{member.name}</h4>
                               <div className="flex items-center gap-6 text-[11px] text-muted-foreground font-black uppercase tracking-widest">
                                 <span className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-sm"><Star className="w-4 h-4 fill-amber-500" /> {member.rating || 4.9}</span>
                                 <span className="flex items-center gap-2 bg-muted/50 border border-border px-4 py-1.5 rounded-full opacity-80">{member.role}</span>
                              </div>
                           </div>
                       </div>
                       
                        <div className="flex items-center gap-3">
                            {member.google_sync_enabled ? (
                              <div className="flex items-center gap-2">
                                <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-500/20 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                  <Check className="w-3.5 h-3.5" /> BAĞLI
                                </div>
                                <Button 
                                  onClick={async () => {
                                    if (confirm("Takvim bağlantısını kesmek istediğinize emin misiniz?")) {
                                      await disconnectGoogleCalendar(member.id);
                                      onRefresh();
                                      toast.success("Takvim bağlantısı kesildi.");
                                    }
                                  }}
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-10 text-[9px] font-bold text-muted-foreground hover:text-rose-500"
                                >
                                  KES
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => {
                                  try {
                                    const url = getGoogleAuthUrl(member.id);
                                    window.location.href = url;
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                variant="outline" 
                                size="sm" 
                                className="h-10 px-5 text-[10px] font-black uppercase tracking-widest border-border bg-background hover:bg-primary/5 hover:border-primary/40 gap-2 rounded-2xl transition-all shadow-sm"
                              >
                                <RefreshCw className="w-4 h-4 text-primary" /> TAKVİMİ BAĞLA
                              </Button>
                            )}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                               <Button 
                                onClick={() => handleEditInit(member)}
                                variant="outline" size="icon" className="h-10 w-10 border-border bg-background hover:bg-muted hover:border-primary/20 rounded-xl transition-all"><Edit3 className="w-4 h-4 text-muted-foreground" /></Button>
                              <Button 
                                onClick={() => handleDelete(member.id)}
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 border-border bg-background hover:bg-rose-500 text-white hover:border-rose-600 rounded-xl group/del transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground group-hover/del:text-white" />
                              </Button>
                            </div>
                        </div>
                    </div>
                  ))}
                  {staff.filter(s => s.is_active !== false).length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-medium">Henüz personel eklenmemiş.</div>
                  )}
              </div>
             )}
         </div>

         {/* Entry Sidebar */}
         <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
               <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
                 {editId ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-primary" />} 
                 {editId ? "Bilgileri Güncelle" : `Yeni ${activeSubTab === "services" ? "Hizmet" : "Personel"} Ekle`}
               </h3>
               <div className="space-y-4">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeSubTab === 'services' ? "Hizmet Adı" : "Personel Adı"} 
                    className="bg-muted/30 border-border h-12" 
                  />
                  {activeSubTab === 'services' ? (
                    <>
                      <Input 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Fiyat (₺)" 
                        className="bg-muted/30 border-border h-12" 
                      />
                      <Input 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Süre (dk)" 
                        className="bg-muted/30 border-border h-12" 
                      />
                    </>
                  ) : (
                    <Input 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Rol (örn: Berber)" 
                      className="bg-muted/30 border-border h-12" 
                    />
                  )}
                  
                  <div className="flex gap-2">
                    {editId && (
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1 border-border h-12 font-bold text-[10px]"
                      >
                        İPTAL
                      </Button>
                    )}
                    <Button 
                      onClick={handleAddOrUpdate}
                      disabled={loading || !name}
                      className={cn(
                        "flex-[2] h-12 font-bold tracking-widest text-[10px]",
                        editId ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-primary hover:bg-primary/90"
                      )}
                    >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? "GÜNCELLEMEYİ KAYDET" : "SİSTEME KAYDET")}
                    </Button>
                  </div>
                  
                  {activeSubTab === "staff" && !editId && staff.length >= personnelLimit && (
                    <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                       <p className="text-xs font-black text-rose-600 uppercase tracking-widest leading-relaxed">
                          ⚠️ PERSONEL KOTANIZ DOLU ({staff.length}/{personnelLimit})
                       </p>
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          Daha fazla personel için paketinizi yükseltin.
                       </p>
                    </div>
                  )}
               </div>
            </div>

             <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[2rem] p-8 space-y-6 shadow-xl group/ai">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover/ai:bg-primary/20 transition-all duration-700" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
                      <ShieldCheck className="w-6 h-6 text-primary animate-pulse" />
                   </div>
                   <div>
                      <h4 className="font-black text-primary text-base uppercase tracking-widest">Katalog Zekası</h4>
                      <p className="text-[9px] text-primary/60 font-black uppercase tracking-[0.2em]">AI Destekli Operasyonel Analiz</p>
                   </div>
                </div>
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-primary/10 p-5 rounded-2xl relative z-10">
                   <p className="text-[11px] text-primary leading-relaxed font-bold italic">
                     "<span className="text-primary/70">Analiz:</span> Dükkanınızda en çok vakit alan hizmet <span className="underline decoration-primary/30 underline-offset-4 font-black not-italic text-sm">Sakal Bakımı</span>. Bu hizmetin süresini 5 dk kısaltmak kapasitenizi günlük %8 arttırabilir."
                   </p>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
