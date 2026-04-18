import { useState, useEffect } from "react";
import { 
  Search, User, 
  ChevronRight, Star, History,
  TrendingUp, Mail, Phone,
  Calendar, CreditCard, MessageSquare,
  StickyNote, Save, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { addCustomerNote, getCustomerNote } from "@/lib/biz-api";

interface Props {
  businessId: string;
  customers: any[];
  globalSearch?: string;
}

export function BizCRM({ businessId, customers, globalSearch = "" }: Props) {
  const [searchTerm, setSearchTerm] = useState(globalSearch);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      loadNote(selectedUser.phone);
    }
  }, [selectedUser]);

  const loadNote = async (phone: string) => {
    const savedNote = await getCustomerNote(businessId, phone);
    setNote(savedNote);
  };

  const handleSaveNote = async () => {
    if (!selectedUser) return;
    setSavingNote(true);
    try {
      await addCustomerNote(businessId, selectedUser.phone, note);
      toast.success("Not kaydedildi", {
        description: `${selectedUser.name} için not başarıyla güncellendi.`,
      });
    } catch (error) {
       console.error("Save note error:", error);
       toast.error("Not kaydedilemedi");
    } finally {
      setSavingNote(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-in fade-in zoom-in-95 duration-700 pb-20">
       {/* List Sidebar */}
       <div className="lg:col-span-4 space-y-4 lg:space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
           <Input 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Müşteri ara..." 
             className="pl-12 h-12 lg:h-14 bg-card border-border rounded-xl lg:rounded-2xl shadow-sm focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-xs lg:text-sm" 
           />
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
          {filteredCustomers.map((customer, i) => (
             <button
               key={i}
               onClick={() => setSelectedUser(customer)}
               className={cn(
                 "w-full text-left p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] border transition-all duration-500 group shadow-sm relative overflow-hidden",
                 selectedUser?.phone === customer.phone 
                   ? "bg-card border-primary/30 ring-2 ring-primary/5 shadow-xl shadow-primary/5" 
                   : "bg-card border-transparent hover:border-border hover:bg-muted/30"
               )}
             >
               <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                 <div className={cn(
                   "w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm lg:text-lg transition-all shadow-inner",
                   selectedUser?.phone === customer.phone ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-muted text-foreground"
                 )}>
                   {customer.name[0]}
                   {customer.isVip && (
                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                        <Star className="w-3 h-3 text-white fill-current" />
                     </div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors">{customer.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60 font-mono">{customer.phone}</p>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 transition-all duration-500",
                  selectedUser?.phone === customer.phone ? "text-primary translate-x-2" : "text-muted-foreground opacity-30 group-hover:opacity-100"
                )} />
              </div>
              {selectedUser?.phone === customer.phone && (
                <div className="absolute right-0 top-0 w-1 h-full bg-primary" />
              )}
            </button>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-[2.5rem] bg-muted/10">
              <User className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Müşteri Bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail */}
      <div className="lg:col-span-8">
        {selectedUser ? (
          <div className="bg-card border border-border rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 space-y-8 lg:space-y-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-32 -mt-32 pointer-events-none" />
            
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-10 relative z-10 text-center lg:text-left">
               <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[1.5rem] lg:rounded-[2.5rem] bg-muted border-2 border-border flex items-center justify-center text-4xl lg:text-6xl font-black text-foreground relative shadow-2xl shadow-primary/5">
                     {selectedUser.name[0]}
                     {selectedUser.isVip && (
                        <Badge className="absolute -bottom-3 bg-primary text-white font-black text-[8px] lg:text-[10px] tracking-wider lg:tracking-[0.2em] px-3 lg:px-5 py-1.5 lg:py-2 shadow-xl shadow-primary/20 border-none rounded-full">
                          VIP MEMBER
                        </Badge>
                     )}
                  </div>
                  <div>
                     <h2 className="text-2xl lg:text-5xl font-black text-foreground tracking-tighter leading-tight lg:leading-none">{selectedUser.name}</h2>
                     <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 mt-4 lg:mt-6">
                        <span className="flex items-center justify-center lg:justify-start gap-2 text-[10px] lg:text-xs text-muted-foreground font-black uppercase tracking-widest opacity-80"><Phone className="w-3.5 h-3.5 text-primary" /> {selectedUser.phone}</span>
                        <span className="hidden lg:block w-1.5 h-1.5 bg-border rounded-full opacity-30"></span>
                        <span className="flex items-center justify-center lg:justify-start gap-2 text-[10px] lg:text-xs text-muted-foreground font-black uppercase tracking-widest opacity-80"><Mail className="w-3.5 h-3.5 text-primary" /> {selectedUser.email || 'PO_MAIL'}</span>
                     </div>
                  </div>
               </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl lg:rounded-3xl border-border bg-card shadow-xl shadow-primary/5 hover:text-primary transition-all active:scale-95"><MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl lg:rounded-3xl border-border bg-card shadow-xl shadow-primary/5 hover:text-primary transition-all active:scale-95"><TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" /></Button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 relative z-10">
               <div className="bg-muted/30 border border-border rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group shadow-sm transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5 border-transparent hover:border-border">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-card rounded-xl lg:rounded-2xl flex items-center justify-center shadow-sm border border-border mb-4 lg:mb-6 group-hover:rotate-12 transition-transform">
                    <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                  </div>
                  <p className="text-xl lg:text-3xl font-black text-foreground tracking-tighter">₺{selectedUser.totalSpent.toLocaleString()}</p>
                  <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] lg:tracking-[0.2em] mt-1 lg:mt-2 opacity-50">Ciro</p>
               </div>
               <div className="bg-muted/30 border border-border rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group shadow-sm transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5 border-transparent hover:border-border">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-card rounded-xl lg:rounded-2xl flex items-center justify-center shadow-sm border border-border mb-4 lg:mb-6 group-hover:rotate-12 transition-transform">
                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-violet-600" />
                  </div>
                  <p className="text-xl lg:text-3xl font-black text-foreground tracking-tighter">{selectedUser.totalAppointments}</p>
                  <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] lg:tracking-[0.2em] mt-1 lg:mt-2 opacity-50">Ziyaret</p>
               </div>
               <div className="col-span-2 lg:col-span-1 bg-muted/30 border border-border rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group shadow-sm transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5 border-transparent hover:border-border">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-card rounded-xl lg:rounded-2xl flex items-center justify-center shadow-sm border border-border mb-4 lg:mb-6 group-hover:rotate-12 transition-transform">
                    <History className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                  </div>
                  <p className="text-xs lg:text-base font-black text-foreground uppercase tracking-tight mt-1 truncate">{selectedUser.lastVisit}</p>
                  <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] lg:tracking-[0.2em] mt-1 lg:mt-2 opacity-50">Son İşlem</p>
               </div>
            </div>

            {/* Merchant Notes */}
            <div className="space-y-6 relative z-10">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-[11px] lg:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <StickyNote className="w-4 h-4 text-primary" />
                     </div>
                     İşletme Özel Notları
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-black text-muted-foreground bg-muted/50 border-none px-4 py-1.5 rounded-full uppercase tracking-widest opacity-60">Sadece İşletme Erişimi</Badge>
               </div>
               <div className="relative group shadow-2xl shadow-primary/5 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden">
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-40 lg:h-60 bg-muted/20 border-2 border-transparent focus:border-primary/20 bg-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 text-xs lg:text-sm text-foreground focus:outline-none transition-all custom-scrollbar resize-none font-bold placeholder:text-muted-foreground/30 shadow-inner"
                    placeholder="Müşterinin tercihleri, özel talepleri veya dikkat edilmesi gereken detaylar..."
                  />
                  <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 flex items-center gap-3 lg:gap-4">
                    {note !== "" && <button className="text-[9px] lg:text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mr-2" onClick={() => setNote("")}>TEMİZLE</button>}
                    <Button 
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="bg-primary hover:bg-primary/90 text-white rounded-xl lg:rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] h-10 lg:h-12 px-5 lg:px-8 font-black tracking-[0.2em] transition-all active:scale-95"
                    >
                       {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       GÜNCELLE
                    </Button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] flex flex-col items-center justify-center space-y-8 text-center bg-card border border-dashed border-border rounded-[4rem] transition-all hover:bg-primary/5 hover:border-primary/20 group">
             <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[3rem] bg-card shadow-2xl shadow-primary/5 border border-border flex items-center justify-center relative group-hover:scale-105 transition-transform duration-700">
                <div className="absolute inset-0 bg-primary/5 rounded-[3rem] animate-pulse" />
                <User className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground/30 relative z-10" />
             </div>
             <div className="space-y-3 px-10">
                <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Kullanıcı Odaklı Takip</h3>
                <p className="text-xs lg:text-sm text-muted-foreground max-w-sm mx-auto font-bold opacity-60 leading-relaxed">Kart detaylarını, rezervasyon geçmişini ve özel notları görüntülemek için sol menüden bir müşteri profili seçin.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
