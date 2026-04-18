import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const GizlilikPolitikasi = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">Gizlilik Politikası</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Versiyon 2.1 | Son Güncelleme: 13 Nisan 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-10">
          <section className="bg-muted/10 p-8 rounded-3xl border border-border/50">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">1. VERİ SORUMLUSU VE KAPSAM</h2>
            <p className="text-sm leading-relaxed mb-4">
              Bu Gizlilik Politikası, RandevuDunyasi Teknoloji A.Ş. ("Şirket") tarafından işletilen platformun kullanımı sırasında toplanan kişisel verilerin işlenmesine ilişkin usul ve esasları belirler. Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında "Veri Sorumlusu" olarak tanımlanmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 uppercase border-l-4 border-accent pl-4">2. İŞLENEN VERİ KATEGORİLERİ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-card rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-2">Kimlik Verileri</h3>
                <p className="text-xs">Ad, soyad, doğum tarihi ve bazı durumlarda T.C. kimlik numarası.</p>
              </div>
              <div className="p-5 bg-card rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-2">İletişim Verileri</h3>
                <p className="text-xs">Telefon numarası, e-posta adresi, fiziksel adres (işletmeler için).</p>
              </div>
              <div className="p-5 bg-card rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-2">Gezinme Verileri</h3>
                <p className="text-xs">IP adresi, tarayıcı türü, çerez bilgileri ve platform içi kullanım alışkanlıkları.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase border-l-4 border-accent pl-4">3. VERİ İŞLEME AMAÇLARI VE HUKUKİ SEBEPLER</h2>
            <p className="mb-4">Topladığımız veriler aşağıdaki hukuki sebepler uyarınca işlenmektedir:</p>
            <ul className="list-disc pl-6 space-y-3 text-sm">
              <li><strong className="text-foreground">Sözleşmenin İfası:</strong> Randevu oluşturulması ve üye iş yeri ile paylaşılması.</li>
              <li><strong className="text-foreground">Hukuki Yükümlülük:</strong> Vergi mevzuatı veya güvenlik birimleri taleplerinin karşılanması.</li>
              <li><strong className="text-foreground">Meşru Menfaat:</strong> Platformun güvenliğinin sağlanması, hataların giderilmesi ve hizmet kalitesinin artırılması.</li>
              <li><strong className="text-foreground">Açık Rıza:</strong> Pazarlama faaliyetleri, bülten gönderimleri ve kişiselleştirilmiş reklamlar.</li>
            </ul>
          </section>

          <section className="bg-accent/5 p-6 rounded-2xl border border-accent/20">
            <h2 className="text-xl font-bold text-white mb-4 uppercase">4. VERİLERİN ÜÇÜNCÜ TARAFLARLA PAYLAŞIMI</h2>
            <p className="text-sm leading-relaxed">
              Kişisel verileriniz, sadece aşağıdaki durumlarda paylaşılır:
              <br/><br/>
              - <strong className="text-foreground">İlgili Üye İşyeri:</strong> Seçtiğiniz randevunun gerçekleştirilebilmesi için ad ve telefon bilgileriniz işletme ile paylaşılır.
              <br/>
              - <strong className="text-foreground">Hizmet Sağlayıcılar:</strong> SMS gönderimi, e-posta altyapısı ve bulut depolama sunan alt yüklenicilerimiz.
              <br/>
              - <strong className="text-foreground">Yasal Merciiler:</strong> Savcılık veya mahkeme kararıyla talep edilen veriler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase border-l-4 border-accent pl-4">5. VERİ SAKLAMA SÜRELERİ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-foreground uppercase text-xs font-black">
                  <tr>
                    <th className="p-3 border-b border-border">Veri Tipi</th>
                    <th className="p-3 border-b border-border">Saklama Süresi</th>
                    <th className="p-3 border-b border-border">Yasal Dayanak</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="p-3 border-b border-border/50">Üyelik Bilgileri</td>
                    <td className="p-3 border-b border-border/50">Üyelik devam ettiği sürece + 10 yıl</td>
                    <td className="p-3 border-b border-border/50">Türk Borçlar Kanunu</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-border/50">İletişim Kayıtları</td>
                    <td className="p-3 border-b border-border/50">3 Yıl</td>
                    <td className="p-3 border-b border-border/50">6563 Sayılı Elektronik Ticaret Kanunu</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-border/50">Trafik Günlükleri (Log)</td>
                    <td className="p-3 border-b border-border/50">2 Yıl</td>
                    <td className="p-3 border-b border-border/50">5651 Sayılı Kanun</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default GizlilikPolitikasi;
