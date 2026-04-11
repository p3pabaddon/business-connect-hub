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
}

export function BizCRM({ businessId, customers }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-700">
      {/* List Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Müşteri ara..." 
            className="pl-11 h-12 bg-slate-900/50 border-slate-800 rounded-2xl" 
          />
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          {filteredCustomers.map((customer, i) => (
            <button
              key={i}
              onClick={() => setSelectedUser(customer)}
              className={cn(
                "w-full text-left p-4 rounded-3xl border transition-all duration-300 group",
                selectedUser?.phone === customer.phone 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-slate-900/30 border-slate-800/50 hover:bg-slate-900"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white relative">
                   {customer.name[0]}
                   {customer.isVip && (
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-slate-900 fill-current" />
                     </div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{customer.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{customer.phone}</p>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  selectedUser?.phone === customer.phone ? "text-primary translate-x-1" : "text-slate-600"
                )} />
              </div>
            </button>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-xs">Müşteri bulunamadı.</div>
          )}
        </div>
      </div>

      {/* Profile Detail */}
      <div className="lg:col-span-8">
        {selectedUser ? (
          <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 lg:p-10 space-y-10">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
               <div className="flex items-center gap-4 lg:gap-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl lg:text-4xl font-black text-white relative">
                     {selectedUser.name[0]}
                     {selectedUser.isVip && <Badge className="absolute -bottom-2 bg-amber-500 text-slate-900 font-bold px-4 py-1">VIP MEMBER</Badge>}
                  </div>
                  <div>
                     <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 lg:mt-3">
                        <span className="flex items-center gap-2 text-[10px] lg:text-xs text-slate-500"><Phone className="w-3.5 h-3.5" /> {selectedUser.phone}</span>
                        <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="flex items-center gap-2 text-[10px] lg:text-xs text-slate-500"><Mail className="w-3.5 h-3.5" /> {selectedUser.email || 'tanımsız'}</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl border-slate-800 bg-slate-950/50"><MessageSquare className="w-5 h-5 text-slate-400" /></Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl border-slate-800 bg-slate-950/50 hover:text-primary"><TrendingUp className="w-5 h-5 text-slate-400" /></Button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
               <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                  <CreditCard className="w-5 h-5 text-primary mb-4" />
                  <p className="text-xl lg:text-2xl font-black text-white">₺{selectedUser.totalSpent}</p>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Toplam Harcama</p>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                  <Calendar className="w-5 h-5 text-violet-400 mb-4" />
                  <p className="text-xl lg:text-2xl font-black text-white">{selectedUser.totalAppointments}</p>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ziyaret Sayısı</p>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                  <History className="w-5 h-5 text-emerald-400 mb-4" />
                  <p className="text-sm font-bold text-white mt-1 truncate">{selectedUser.lastVisit}</p>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Son Ziyaret</p>
               </div>
            </div>

            {/* Merchant Notes */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <StickyNote className="w-4 h-4 text-primary" /> İşletme Notları
                  </h4>
                  <p className="text-[8px] lg:text-[9px] text-slate-600 font-mono">Sadece siz görebilirsiniz</p>
               </div>
               <div className="relative group">
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-32 lg:h-40 bg-slate-950/30 border border-slate-800 rounded-3xl p-6 text-sm text-slate-300 focus:outline-none focus:border-primary/30 transition-all custom-scrollbar resize-none"
                    placeholder="Bu müşteri hakkında hatırlatıcı notlar ekleyin..."
                  />
                  <Button 
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 text-xs h-10 px-4"
                  >
                     {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                     KAYDET
                  </Button>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center space-y-6 text-center bg-slate-900/20 border border-dashed border-slate-800/50 rounded-[2.5rem]">
             <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-slate-900 flex items-center justify-center">
                <User className="w-8 h-8 lg:w-10 lg:h-10 text-slate-700" />
             </div>
             <div>
                <h3 className="text-lg lg:text-xl font-black text-white">Müşteri Seçilmedi</h3>
                <p className="text-[10px] lg:text-sm text-slate-500 max-w-xs mt-2 mx-auto">Kartını görüntülemek ve not eklemek için listeden bir müşteri seçin.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
