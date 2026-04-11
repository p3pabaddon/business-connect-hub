import { useState, useEffect } from "react";
import { 
  Package, Plus, Search, Trash2, 
  AlertTriangle, Check, ArrowRight,
  Filter, MoreHorizontal, History,
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
          <h2 className="text-3xl font-heading font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Envanter & Stok
          </h2>
          <p className="text-slate-500 text-sm mt-1">Dükkan malzemelerini yönetin ve kritik stokları takip edin.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                 <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kritik Stok</p>
                 <p className="text-xl font-black text-white leading-none mt-1">{lowStockCount}</p>
              </div>
           </div>

           <Dialog>
             <DialogTrigger asChild>
               <Button className="rounded-2xl h-14 px-6 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                 <Plus className="w-5 h-5" />
                 Yeni Ürün Ekle
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-[#0f172a] border-slate-800 text-white">
               <DialogHeader>
                 <DialogTitle>Yeni Envanter Kalemi</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label>Ürün Adı</Label>
                   <Input 
                    placeholder="Örn: Saç Boyası (Kızıl)" 
                    className="bg-slate-900 border-slate-800"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Mevcut Miktar</Label>
                     <Input 
                      type="number" 
                      className="bg-slate-900 border-slate-800"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Birim</Label>
                     <Select 
                      value={newItem.unit} 
                      onValueChange={(v) => setNewItem({...newItem, unit: v})}
                     >
                       <SelectTrigger className="bg-slate-900 border-slate-800">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-[#0f172a] border-slate-800 text-white">
                         <SelectItem value="adet">Adet</SelectItem>
                         <SelectItem value="ml">Mililitre (ml)</SelectItem>
                         <SelectItem value="gr">Gram (gr)</SelectItem>
                         <SelectItem value="paket">Paket</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Kritik Eşik (Bu sayının altında uyarı verir)</Label>
                   <Input 
                    type="number" 
                    className="bg-slate-900 border-slate-800"
                    value={newItem.low_stock_threshold}
                    onChange={(e) => setNewItem({...newItem, low_stock_threshold: parseInt(e.target.value)})}
                   />
                 </div>
               </div>
               <DialogFooter>
                 <Button variant="outline" className="border-slate-800" onClick={() => {}}>İptal</Button>
                 <Button onClick={handleAdd}>Ürünü Kaydet</Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#0f172a]/50 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Ürünlerde ara..." 
                className="bg-slate-900/50 border-slate-800 pl-10 h-11 text-sm rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-slate-500 gap-2 hover:text-white" onClick={loadItems}>
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
             <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 mx-auto">
                <Database className="w-10 h-10 text-slate-700" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">Ürün Bulunamadı</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">
                   Arama kriterlerinize uygun ürün yok veya henüz envanter eklemediniz.
                </p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ürün Bilgisi</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center">Stok Durumu</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Miktar Değiştir</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.low_stock_threshold;
                  return (
                    <tr key={item.id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-colors",
                             item.quantity === 0 ? "bg-rose-500/10 border-rose-500/30" : 
                             isLow ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-900 border-slate-800"
                           )}>
                              <ShoppingCart className={cn("w-5 h-5", item.quantity === 0 ? "text-rose-500" : isLow ? "text-amber-500" : "text-slate-500")} />
                           </div>
                           <div>
                              <p className="font-bold text-white text-base tracking-tight">{item.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {item.id.substring(0,8)}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                               <span className="text-2xl font-black text-white">{item.quantity}</span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.unit}</span>
                            </div>
                            {item.quantity === 0 ? (
                              <Badge key="out" className="bg-rose-500 text-white border-rose-600 animate-pulse text-[10px] py-0 px-2 uppercase font-black">STOK YOK</Badge>
                            ) : isLow ? (
                              <Badge key="low" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] py-0 px-2">KRİTİK STOK</Badge>
                            ) : (
                              <Badge key="ok" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-2 tracking-tighter transition-all opacity-0 group-hover:opacity-100 uppercase">Yeterli Stok</Badge>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-8 h-8 p-0 rounded-lg border-slate-800 hover:bg-slate-800 hover:text-white"
                              onClick={() => handleUpdateStock(item.id, Math.max(0, item.quantity - 1))}
                            >
                               -
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-8 h-8 p-0 rounded-lg border-slate-800 hover:bg-slate-800 hover:text-white"
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
                          className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                          onClick={() => handleDelete(item.id)}
                         >
                            <Trash2 className="w-4 h-4" />
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
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
         <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shrink-0">
            <History className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h4 className="text-lg font-bold text-white leading-none">Akıllı Stok Takibi</h4>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
               Envanter sistemimiz bir sonraki aşamada **Otomatik Düşüm** özelliğine sahip olacak. Bir randevu tamamlandığında, kullanılan malzemeler otomatik olarak stoktan düşülecek.
            </p>
         </div>
         <Button variant="outline" className="ml-auto border-primary/30 text-primary hover:bg-primary/10 rounded-2xl hidden md:flex gap-2">
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
