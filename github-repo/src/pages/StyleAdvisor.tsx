import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Wand2, Info, CheckCircle2, Scissors, Camera, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { analyzeImageStyle } from '@/lib/ai-service';
import { SEOHead } from '@/components/SEOHead';

const StyleAdvisor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPreview(compressed);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);
    
    try {
      const data = await analyzeImageStyle(preview);
      
      if (data.error) {
        toast.error(data.error);
        setResult(null);
      } else {
        setResult(data);
        toast.success('Analiz başarıyla tamamlandı!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 relative overflow-hidden">
      <SEOHead 
        title="AI Stil Danışmanı | Yüz Şekline Göre Saç & Sakal Analizi"
        description="Yapay zeka ile yüz hattı analizi yaptırın. Size en uygun saç kesimi ve sakal modellerini profesyonel AI önerileriyle saniyeler içinde keşfedin."
        type="website"
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold mb-6"
          >
            <BrainCircuit className="w-5 h-5" />
            Yeni: AI Stil Danışmanı
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading">
            Mükemmel Görünüme <span className="text-gradient">Yapay Zeka</span> İle Ulaş
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Yüz hatlarını analiz edelim, sana en uygun saç, sakal ve stil önerilerini saniyeler içinde sunalım.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="glass-dark rounded-3xl p-8 border border-white/10 relative group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl group-hover:border-primary/50 transition-all">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full max-w-xs aspect-square object-cover rounded-xl shadow-2xl" />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                      <Camera className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold mb-2 text-center">Bir fotoğraf yükle veya sürükle</p>
                    <p className="text-sm text-gray-500 text-center px-4">Net bir selfie yüklemeniz en iyi sonucu verir.</p>
                  </>
                )}
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={!file || analyzing} className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center gap-3">
              {analyzing ? (
                <>
                  <Wand2 className="w-6 h-6 animate-spin" />
                  Stilin Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Analizi Başlat
                </>
              )}
            </Button>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 text-sm text-gray-400">
              <Info className="w-5 h-5 text-amber-500 shrink-0" />
              <p>Gizliliğiniz bizim için önemli. Yüklediğiniz fotoğraflar analiz edildikten sonra silinir ve asla saklanmaz.</p>
            </div>
          </motion.div>

          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                  <div className="h-20 w-full bg-white/5 animate-pulse rounded-2xl" />
                  <div className="h-64 w-full bg-white/5 animate-pulse rounded-2xl" />
                  <div className="h-40 w-full bg-white/5 animate-pulse rounded-2xl" />
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <div>
                      <h3 className="text-xl font-bold">Analiz Tamamlandı</h3>
                      <p className="text-emerald-400/80">Yüz tipiniz: <span className="font-bold">{result.faceShape}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-heading">Sana Özel Öneriler</h3>
                    {result.suggestions.map((s: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-bold flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-primary" />
                            {s.title}
                          </h4>
                          <span className="text-primary font-mono text-sm">%{s.matchScore} Uyum</span>
                        </div>
                        <p className="text-gray-400 text-sm">{s.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Bakım İpuçları
                    </h3>
                    <ul className="space-y-3">
                      {result.tips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-400 text-sm italic">
                          <span>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl text-gray-600">
                  <Wand2 className="w-20 h-20 mb-4 opacity-10" />
                  <p className="text-lg">Analiz sonuçlarını burada göreceksiniz.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleAdvisor;
