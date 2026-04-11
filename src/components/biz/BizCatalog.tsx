import { useState } from "react";
import { 
  Scissors, Users, Plus, 
  Trash2, Edit3, Banknote,
  Clock, Star, ShieldCheck,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { addService, deleteService, addStaff, deleteStaff, updateService, updateStaff } from "@/lib/biz-api";

interface Props {
  businessId: string;
  services: any[];
  staff: any[];
  onRefresh: () => void;
  personnelLimit: number;
}

export function BizCatalog({ businessId, services, staff, onRefresh, personnelLimit }: Props) {
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
      alert(`Personel limitine ulaştınız (${personnelLimit}). Daha fazla personel eklemek için Pro pakete geçmelisiniz.`);
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
    } catch (error) {
      console.error("Save error:", error);
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
      <div className="flex gap-4 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
         <button
           onClick={() => { setActiveSubTab("services"); resetForm(); }}
           className={cn(
             "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
             activeSubTab === "services" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
           )}
         >
           <Scissors className="w-4 h-4" /> HİZMET KATALOĞU
         </button>
         <button
           onClick={() => { setActiveSubTab("staff"); resetForm(); }}
           className={cn(
             "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
             activeSubTab === "staff" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
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
                    <div key={i} className="group p-6 bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl flex items-center justify-between hover:bg-slate-900 transition-all duration-300">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                             <Scissors className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                             <h4 className="text-lg font-bold text-white mb-1">{service.name}</h4>
                             <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {service.duration} dk</span>
                                <span className="flex items-center gap-1.5 text-emerald-500"><Banknote className="w-3.5 h-3.5" /> ₺{service.price}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleEditInit(service)}
                            variant="outline" size="icon" className="h-10 w-10 border-slate-800 bg-slate-950/50"><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                          <Button 
                            onClick={() => handleDelete(service.id)}
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 border-slate-800 bg-slate-950/50 hover:bg-rose-500/10 hover:border-rose-500/30 group/del"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 group-hover/del:text-rose-500" />
                          </Button>
                       </div>
                    </div>
                  ))}
                  {services.filter(s => s.is_active !== false).length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">Henüz hizmet eklenmemiş.</div>
                  )}
               </div>
            ) : (
              <div className="space-y-4">
                  {staff.filter(s => s.is_active !== false).map((member, i) => (
                    <div key={i} className="group p-6 bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl flex items-center justify-between hover:bg-slate-900 transition-all duration-300">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl border border-violet-500/20 flex items-center justify-center font-black text-violet-500 uppercase">
                             {member.name[0]}
                          </div>
                          <div>
                             <h4 className="text-lg font-bold text-white mb-1">{member.name}</h4>
                             <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                                <span className="flex items-center gap-1.5 text-amber-500"><Star className="w-3.5 h-3.5" /> {member.rating || 4.9}</span>
                                <span className="text-slate-600 block">{member.role}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleEditInit(member)}
                            variant="outline" size="icon" className="h-10 w-10 border-slate-800 bg-slate-950/50"><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                          <Button 
                            onClick={() => handleDelete(member.id)}
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 border-slate-800 bg-slate-950/50 hover:bg-rose-500/10 hover:border-rose-500/30 group/del"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 group-hover/del:text-rose-500" />
                          </Button>
                       </div>
                    </div>
                  ))}
                  {staff.filter(s => s.is_active !== false).length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">Henüz personel eklenmemiş.</div>
                  )}
              </div>
            )}
         </div>

         {/* Entry Sidebar */}
         <div className="space-y-6">
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6">
               <h3 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                 {editId ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-primary" />} 
                 {editId ? "Bilgileri Güncelle" : `Yeni ${activeSubTab === "services" ? "Hizmet" : "Personel"} Ekle`}
               </h3>
               <div className="space-y-4">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeSubTab === 'services' ? "Hizmet Adı" : "Personel Adı"} 
                    className="bg-slate-950/50 border-slate-800 h-12" 
                  />
                  {activeSubTab === 'services' ? (
                    <>
                      <Input 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Fiyat (₺)" 
                        className="bg-slate-950/50 border-slate-800 h-12" 
                      />
                      <Input 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Süre (dk)" 
                        className="bg-slate-950/50 border-slate-800 h-12" 
                      />
                    </>
                  ) : (
                    <Input 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Rol (örn: Berber)" 
                      className="bg-slate-950/50 border-slate-800 h-12" 
                    />
                  )}
                  
                  <div className="flex gap-2">
                    {editId && (
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1 border-slate-800 h-12 font-bold text-[10px]"
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
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                       <p className="text-[10px] text-amber-500 font-bold text-center leading-relaxed">
                          ⚠️ Personel kotanız doldu ({personnelLimit}/{personnelLimit}). <br/> 
                          Sınırsız personel için Pro pakete yükseltin.
                       </p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 space-y-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h4 className="font-bold text-primary text-sm uppercase tracking-tight">Katalog Zekası</h4>
               </div>
               <p className="text-[10px] text-primary/80 leading-relaxed italic">
                 **Analiz:** Dükkanınızda en çok vakit alan hizmet "Sakal Bakımı". Bu hizmetin süresini 5 dk kısaltmak kapasitenizi günlük %8 arttırabilir.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
