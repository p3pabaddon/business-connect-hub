import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const CerezPolitikasi = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">Çerez Politikası</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Son Güncelleme: 13 Nisan 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-10">
          <section className="bg-muted/10 p-8 rounded-3xl border border-border/50">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight text-center">ÇEREZLER (COOKIES) HAKKINDA BİLGİLENDİRME</h2>
            <p className="text-sm leading-relaxed text-center italic">
              Platformumuzda size en iyi deneyimi sunabilmek, içerik ve reklamları kişiselleştirmek ve trafik analizi yapabilmek adına çerez teknolojisinden yararlanmaktayız.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 uppercase border-l-4 border-accent pl-4">1. ÇEREZ KATEGORİLERİ VE KULLANIM AMAÇLARI</h2>
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-border/50">
                  <thead className="bg-muted/30 text-foreground uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="p-4 border border-border/50">Çerez Türü</th>
                      <th className="p-4 border border-border/50">Açıklama</th>
                      <th className="p-4 border border-border/50">Kontrol Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr>
                      <td className="p-4 border border-border/50 text-white font-bold">Zorunlu Çerezler</td>
                      <td className="p-4 border border-border/50">Log-in işlemleri, güvenlik ve sepet yönetimi için kritik önemdedir.</td>
                      <td className="p-4 border border-border/50 text-accent">Kapatılamaz</td>
                    </tr>
                    <tr>
                      <td className="p-4 border border-border/50 text-white font-bold">Fonksiyonel Çerezler</td>
                      <td className="p-4 border border-border/50">Dil tercihleriniz ve "Beni Hatırla" gibi kullanıcı deneyimi ayarlarını saklar.</td>
                      <td className="p-4 border border-border/50">Kullanıcı Kontrollü</td>
                    </tr>
                    <tr>
                      <td className="p-4 border border-border/50 text-white font-bold">Analitik Çerezler</td>
                      <td className="p-4 border border-border/50">Google Analytics gibi servisler üzerinden anonim kullanım verilerini toplar.</td>
                      <td className="p-4 border border-border/50">Kullanıcı Kontrollü</td>
                    </tr>
                    <tr>
                      <td className="p-4 border border-border/50 text-white font-bold">Hedefleme/Reklam</td>
                      <td className="p-4 border border-border/50">İlgi alanlarınıza uygun kişiselleştirilmiş reklamlar sunulmasını sağlar.</td>
                      <td className="p-4 border border-border/50 text-destructive">Opsiyonel</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-3 uppercase">2. ÇEREZLERİ NASIL YÖNETEBİLİRSİNİZ?</h3>
              <p className="text-xs leading-relaxed">
                Tüm modern tarayıcılar (Chrome, Firefox, Safari, Edge), çerezleri kabul etmeme veya silme imkanı sunar. Tarayıcınızın "Ayarlar" veya "Gizlilik" bölümlerinden bu tercihlerinizi dilediğiniz zaman güncelleyebilirsiniz. Ancak zorunlu çerezlerin engellenmesi, Platformun bazı özelliklerinin doğru çalışmamasına neden olabilir.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-3 uppercase">3. ÜÇÜNCÜ TARAF ÇEREZLERİ</h3>
              <p className="text-xs leading-relaxed">
                Platformumuzda; Google, Meta (Facebook/Instagram), Hotjar ve Mixpanel gibi güvenilir iş ortaklarımıza ait çerezler de analiz ve reklam amacıyla bulunabilmektedir. Bu çerezlerin politikaları ilgili üçüncü tarafların sorumluluğundadır.
              </p>
            </div>
          </section>

          <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">İletişim</p>
            <p className="text-sm mt-2 font-medium">Çerezlerle ilgili tüm sorularınız için <strong className="text-foreground">privacy@randevudunyasi.biz</strong> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CerezPolitikasi;
