import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, UploadCloud, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/storage";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultValue?: string;
  bucket?: string;
  label?: string;
}

export function ImageUpload({ onUpload, defaultValue, bucket = "business-assets", label = "Görsel Yükle" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultValue || "");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      setUploading(true);
      const file = event.target.files[0];
      
      // Validation
      if (file.size > 5 * 1024 * 1024) throw new Error("Dosya boyutu 5MB'dan küçük olmalıdır.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const publicUrl = await uploadFile(bucket, filePath, file);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success("Görsel başarıyla yüklendi!");
    } catch (error: any) {
      toast.error("Yükleme başarısız", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onUpload("");
  };

  return (
    <div className="space-y-4 w-full">
      <div 
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-[2rem] transition-all duration-500 overflow-hidden",
          preview 
            ? "border-primary/50 aspect-video shadow-xl shadow-primary/5" 
            : "border-border hover:border-primary/30 aspect-square bg-muted/20 hover:bg-muted/40 min-h-[200px]"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
        />

        {preview ? (
          <>
            <img src={preview} alt="Upload" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
               <Button 
                variant="destructive" 
                size="sm" 
                onClick={removeImage}
                className="rounded-xl font-bold uppercase tracking-tight h-10 px-6 shadow-xl"
               >
                 <X className="w-4 h-4 mr-2" /> Değiştir
               </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <UploadCloud className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                 </div>
                 <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Dosya İşleniyor...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 border border-border group-hover:border-primary/20">
                   <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-tight mb-1">{label}</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Resim seçmek için buraya tıklayın</p>
                <div className="mt-4 flex gap-1.5 opacity-30">
                   <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                   <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                   <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
