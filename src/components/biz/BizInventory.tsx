import { useState, useEffect } from "react";
import { 
  Package, Plus, Search, Trash2, 
  AlertTriangle, Check, ArrowRight,
  Filter, MoreHorizontal, History, Crown,
  Database, ShoppingCart, RefreshCw
} from "lucide-react";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";

export function BizInventory({ businessId }: { businessId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "adet",
    low_stock_threshold: 5
  });

  useEffect(() => {
    if (businessId) loadItems();
  }, [businessId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getInventory(businessId);
      setItems(data);
    } catch {
      toast({ title: "Hata", description: "Envanter yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.name) return;
    try {
      await addInventoryItem({ ...newItem, business_id: businessId });
      toast({ title: "Başarılı", description: "Ürün eklendi." });
      setNewItem({ name: "", quantity: 0, unit: "adet", low_stock_threshold: 5 });
      loadItems();
    } catch {
      toast({ title: "Hata", description: "Ürün eklenemedi.", variant: "destructive" });
    }
  };

  const handleUpdateStock = async (id: string, newQuantity: number) => {
    try {
      await updateInventoryItem(id, { quantity: newQuantity });
      loadItems();
    } catch {
      toast({ title: "Hata", description: "Stok güncellenemedi.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await deleteInventoryItem(id);
      loadItems();
    } catch {
      toast({ title: "Hata", description: "Silme işlemi başarısız.", variant: "destructive" });
    }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = items.filter(i => i.quantity <= i.low_stock_threshold).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-black text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Envanter & Stok
          </h2>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Dükkan malzemelerini yönetin ve kritik stokları takip edin.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-card border border-border rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                 <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Kritik Stok</p>
                 <p className="text-xl font-black text-foreground leading-none mt-1">{lowStockCount}</p>
              </div>
           </div>

           <Dialog>
             <DialogTrigger asChild>
               <Button className="rounded-2xl h-14 px-6 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95">
                 <Plus className="w-5 h-5" />
                 Yeni Ürün Ekle
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-background border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-black tracking-tight">Yeni Envanter Kalemi</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ürün Adı</Label>
                   <Input 
                    placeholder="Örn: Saç Boyası (Kızıl)" 
                    className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mevcut Miktar</Label>
                     <Input 
                      type="number" 
                      className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Birim</Label>
                     <Select 
                      value={newItem.unit} 
                      onValueChange={(v) => setNewItem({...newItem, unit: v})}
                     >
                       <SelectTrigger className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                         <SelectItem value="adet">Adet</SelectItem>
                         <SelectItem value="ml">Mililitre (ml)</SelectItem>
                         <SelectItem value="gr">Gram (gr)</SelectItem>
                         <SelectItem value="paket">Paket</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kritik Eşik (Bu sayının altında uyarı verir)</Label>
                   <Input 
                    type="number" 
                    className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20"
                    value={newItem.low_stock_threshold}
                    onChange={(e) => setNewItem({...newItem, low_stock_threshold: parseInt(e.target.value)})}
                   />
                 </div>
               </div>
               <DialogFooter className="gap-2 sm:gap-0">
                 <Button variant="outline" className="h-12 rounded-xl border-border font-bold px-6" onClick={() => {}}>İptal</Button>
                 <Button className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-md shadow-primary/20" onClick={handleAdd}>Ürünü Kaydet</Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm shadow-black/5">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Ürünlerde ara..." 
                className="bg-muted/30 border-border pl-10 h-11 text-sm rounded-xl focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 hover:bg-muted font-bold px-4 h-10 rounded-xl" onClick={loadItems}>
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                 Yenile
              </Button>
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center space-y-4">
             <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center border border-border mx-auto shadow-inner">
                <Database className="w-10 h-10 text-muted-foreground/30" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-foreground">Ürün Bulunamadı</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-1 font-medium">
                   Arama kriterlerinize uygun ürün yok veya henüz envanter eklemediniz.
                </p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest opacity-80">Ürün Bilgisi</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center opacity-80">Stok Durumu</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest opacity-80">Miktar Değiştir</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-right opacity-80">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.low_stock_threshold;
                  return (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-colors shadow-inner",
                             item.quantity === 0 ? "bg-rose-500/10 border-rose-500/30" : 
                             isLow ? "bg-amber-500/10 border-amber-500/20" : "bg-card border-border"
                           )}>
                              <ShoppingCart className={cn("w-5 h-5", item.quantity === 0 ? "text-rose-500" : isLow ? "text-amber-500" : "text-muted-foreground/60")} />
                           </div>
                           <div>
                              <p className="font-bold text-foreground text-base tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-60">ID: {item.id.substring(0,8)}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                               <span className="text-2xl font-black text-foreground">{item.quantity}</span>
                               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.unit}</span>
                            </div>
                            {item.quantity === 0 ? (
                              <Badge key="out" className="bg-rose-500 text-white border-none animate-pulse text-[9px] py-0.5 px-3 uppercase font-black shadow-md shadow-rose-200">STOK YOK</Badge>
                            ) : isLow ? (
                              <Badge key="low" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] py-0.5 px-3 font-bold">KRİTİK STOK</Badge>
                            ) : (
                              <Badge key="ok" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] py-0.5 px-3 tracking-tighter transition-all opacity-0 group-hover:opacity-100 uppercase font-bold">Yeterli Stok</Badge>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-9 h-9 p-0 rounded-xl border-border bg-background shadow-sm hover:bg-muted hover:text-foreground transition-all active:scale-90"
                              onClick={() => handleUpdateStock(item.id, Math.max(0, item.quantity - 1))}
                            >
                               -
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-9 h-9 p-0 rounded-xl border-border bg-background shadow-sm hover:bg-muted hover:text-foreground transition-all active:scale-90"
                              onClick={() => handleUpdateStock(item.id, item.quantity + 1)}
                            >
                                +
                            </Button>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors h-10 w-10"
                          onClick={() => handleDelete(item.id)}
                         >
                            <Trash2 className="w-4.5 h-4.5" />
                         </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-purple-500/5 border border-purple-500/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
         <div className="w-16 h-16 bg-purple-500/10 rounded-[1.25rem] flex items-center justify-center border border-purple-500/20 shrink-0 shadow-inner">
            <Crown className="w-8 h-8 text-purple-600" />
         </div>
         <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
               <h4 className="text-xl font-black text-foreground leading-none tracking-tight">Akıllı Stok Takibi</h4>
               <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white border-none text-[10px] py-0.5 px-3 uppercase font-black shadow-md shadow-purple-500/30">Premium</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl font-medium leading-relaxed">
               Envanter sistemimiz bir sonraki aşamada **Otomatik Düşüm** özelliğine sahip olacak. Bir randevu tamamlandığında, kullanılan malzemeler otomatik olarak stoktan düşülecek.
            </p>
         </div>
         <Button variant="outline" className="md:ml-auto border-purple-500/20 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 rounded-2xl flex items-center gap-2 h-12 px-6 font-bold tracking-tight">
            Nasıl Çalışır?
            <ArrowRight className="w-4 h-4" />
         </Button>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
