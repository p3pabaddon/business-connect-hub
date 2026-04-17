import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const KullanimKosullari = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">Kullanım Koşulları</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Son Güncellenme Tarihi: 13 Nisan 2026</p>
        </div>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-10">
          <section className="bg-muted/10 p-8 rounded-3xl border border-border/50">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">A. GENEL HÜKÜMLER VE TANIMLAR</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>Bu Kullanım Koşulları ("Sözleşme"), RandevuDunyasi platformuna erişim ve kullanım şartlarını düzenlemektedir.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Platform:</strong> RandevuDunyasi web sitesi, mobil sitesi ve ilgili tüm uygulamalar.</li>
                <li><strong className="text-foreground">Kullanıcı/Müşteri:</strong> Platform üzerinden hizmet araştıran, randevu alan gerçek kişiyi ifade eder.</li>
                <li><strong className="text-foreground">Profesyonel/Üye İşyeri:</strong> Platform aracılığıyla hizmetlerini listeleyen, randevu kabul eden ve Profil sahibi işletmeyi ifade eder.</li>
                <li><strong className="text-foreground">İçerik:</strong> Platformda paylaşılan metin, fotoğraf, yorum ve reklam materyallerini kapsar.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase border-l-4 border-accent pl-4">B. PLATFORMUN ROLÜ VE SORUMLULUK SINIRLANDIRILMASI</h2>
            <div className="space-y-4">
              <p>
                RandevuDunyasi, <strong className="text-foreground">6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</strong> kapsamında "Aracı Hizmet Sağlayıcı" sıfatına haizdir. Platform, Üye İşyerleri ile Kullanıcılar'ı bir araya getiren bir teknoloji altyapısıdır.
              </p>
              <p className="bg-destructive/5 border-l-2 border-destructive p-4 text-sm italic">
                Platform; Üye İşyeri tarafından sunulan hizmetin kalitesi, ayıplı mal/hizmet durumu, randevuya geç kalınması veya randevunun Üye İşyeri tarafından haksız iptali durumlarından hukuki olarak sorumlu tutulamaz. Randevu hizmetinin asıl muhatabı ilgili Üye İşyeridir.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-3 uppercase">C. KULLANICI YÜKÜMLÜLÜKLERİ</h3>
              <p className="text-sm leading-relaxed">
                Kullanıcı, randevu alırken verdiği telefon, e-posta ve kimlik bilgilerinin doğruluğunu taahhüt eder. Gerçeğe aykırı beyanlar sebebiyle oluşabilecek hak mahrumiyetlerinden Kullanıcı bizzat sorumludur. Hesabın yetkisiz kullanımı durumunda derhal Platforma bilgi verilmelidir.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-3 uppercase">D. RANDEVU İPTAL VE İADE</h3>
              <p className="text-sm leading-relaxed">
                Randevu iptalleri, Üye İşyeri'nin belirlediği "İptal Süresi" (genellikle 2-24 saat) içerisinde yapılmalıdır. Belirtilen süreden sonra yapılan iptallerde veya randevuya gelinmemesi durumunda, kapora iadesi yapılmayabilir veya Üye İşyeri cayma hakkı kapsamındaki yaptırımlarını uygulayabilir.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase border-l-4 border-accent pl-4">E. FİKRİ MÜLKİYET VE İÇERİK POLİTİKASI</h2>
            <p className="text-sm leading-relaxed">
              Platformda yer alan; logolar, ticari markalar, yazılım kodları, veritabanı yapısı ve özgün tasarımlar fikri mülkiyet koruması altındadır. Platformun kaynak kodlarının tersine mühendislik yoluyla kopyalanması veya kazıma (scraping) yöntemleri ile veri çekilmesi kesinlikle yasaktır ve hukuki takip sebebidir.
            </p>
          </section>

          <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Uyuşmazlık Çözümü</p>
            <p className="text-sm mt-2">Bu Sözleşmeden doğacak ihtilaflarda TC Yasaları uygulanacak olup, İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KullanimKosullari;
