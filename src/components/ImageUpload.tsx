import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultValue?: string;
  bucket?: string;
}

export function ImageUpload({ onUpload, defaultValue, bucket = "business-images" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultValue || "");
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Resim seçilmedi.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast({ title: "Resim yüklendi" });
    } catch (error: any) {
      toast({ 
        title: "Yükleme hatası", 
        description: error.message || "Bilinmeyen bir hata oluştu.",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    onUpload("");
  };

  return (
    <div className="space-y-4">
      <Label>Görsel Yükle</Label>
      
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="destructive" onClick={removeImage}>
              <X className="w-4 h-4 mr-1" /> Sil
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors relative cursor-pointer">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "Yükleniyor..." : "Resim seçmek için tıklayın"}
          </p>
        </div>
      )}
    </div>
  );
}
