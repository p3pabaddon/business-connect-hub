import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Image as ImageIcon, Trash2, 
  ExternalLink, Loader2, Camera,
  Grid, List, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  main_image: string;
  created_at: string;
}

export function BizPortfolio({ businessId }: { businessId: string }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadPortfolio();
  }, [businessId]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("business_portfolios")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      toast.error("Portfolyo yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya boyutu çok büyük (Maks 2MB)");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Fotoğraf yüklendi!");
    } catch (err: any) {
      toast.error("Yükleme hatası: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    try {
      const { error } = await supabase.from("business_portfolios").insert({
        business_id: businessId,
        title,
        description,
        main_image: imageUrl
      });

      if (error) throw error;

      toast.success("Çalışma başarıyla eklendi");
      setOpen(false);
      resetForm();
      loadPortfolio();
    } catch (err) {
      toast.error("Ekleme başarısız oldu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu çalışmayı silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("business_portfolios")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Çalışma silindi");
      loadPortfolio();
    } catch (err) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse">
      <ImageIcon className="w-12 h-12 text-muted-foreground/20 mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Galeri Hazırlanıyor...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-8 rounded-[2rem] border border-border">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" /> Çalışmalarımız
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            En iyi sonuçlarınızı müşterilerinizle paylaşın
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
              <Plus className="w-4 h-4 mr-2" /> Yeni Çalışma Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight">Yeni Çalışma</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Başlık</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Örn: Gelin Saçı Tasarımı"
                  className="rounded-xl border-border focus:ring-accent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Açıklama (Opsiyonel)</Label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full h-24 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Çalışmanız hakkında kısa bilgi..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fotoğraf</Label>
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <img src={imageUrl} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-accent" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Fotoğraf Yükle</span>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-accent font-black uppercase tracking-widest text-xs" disabled={!title || !imageUrl}>
                KAYDET VE YAYINLA
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-[3rem] border border-dashed border-border">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">Henüz Çalışma Yok</h3>
          <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
            İlk çalışmanızı ekleyerek potansiyel müşterilerinize neler yapabildiğinizi gösterin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <div className="aspect-video relative overflow-hidden">
                <img src={item.main_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-xl">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-black text-foreground uppercase tracking-tight mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">
                  {item.description || "Açıklama belirtilmemiş."}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-[8px] font-black tracking-widest p-1 px-2 uppercase border-accent/20 text-accent">Aktif</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-amber-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Önemli Hatırlatma</h4>
          <p className="text-[11px] text-amber-600/80 font-medium leading-relaxed">
            Müşterilerinizin mahremiyetine saygı duyun. Fotoğraflarını paylaşmadan önce mutlaka sözlü veya yazılı izinlerini alın. Randevu Dünyası bu paylaşımlardan dükkan sahibini sorumlu tutar.
          </p>
        </div>
      </div>
    </div>
  );
}
