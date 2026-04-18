import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const KvkkPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">6698 Sayılı KVKK Aydınlatma Metni</h1>
          <p className="text-muted-foreground font-medium italic">RandevuDunyasi Teknoloji ve Yazılım Hizmetleri A.Ş.</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-12">
          <section className="bg-primary/5 p-8 rounded-[3rem] border border-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">1. VERİ SORUMLUSU</h2>
              <p className="text-sm leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz; veri sorumlusu olarak <strong className="text-foreground">RandevuDunyasi Teknoloji ve Yazılım Hizmetleri A.Ş.</strong> ("Şirket") tarafından aşağıda açıklanan kapsamda işlenmektedir.
                <br/><br/>
                <strong className="text-foreground">Adres:</strong> Levent Mah. Büyükdere Cad. No:123/A Beşiktaş/İstanbul
                <br/>
                <strong className="text-foreground">E-posta:</strong> kvkk@randevudunyasi.biz
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 uppercase border-l-4 border-accent pl-4">2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI</h2>
            <p className="text-sm mb-4">Şirketimiz tarafından toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-xl border border-border">
                <h4 className="font-bold text-white text-xs uppercase mb-2">Operasyonel Amaçlar</h4>
                <ul className="text-[11px] space-y-1 list-disc pl-4">
                  <li>Randevu taleplerinin oluşturulması ve iletilmesi.</li>
                  <li>İşletme profillerinin yönetimi ve doğrulanması.</li>
                  <li>Platform güvenliğinin ve erişim kontrollerinin sağlanması.</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl border border-border">
                <h4 className="font-bold text-white text-xs uppercase mb-2">İş Geliştirme ve Pazarlama</h4>
                <ul className="text-[11px] space-y-1 list-disc pl-4">
                  <li>Kullanıcı deneyiminin analiz edilmesi ve iyileştirilmesi.</li>
                  <li>Kişiselleştirilmiş kampanya ve tekliflerin sunulması.</li>
                  <li>Hizmet kalitesinin denetimi ve müşteri memnuniyeti ölçümü.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase border-l-4 border-accent pl-4">3. İŞLENEN KİŞİSEL VERİLERİN AKTARILDIĞI TARAFLAR</h2>
            <p className="text-sm leading-relaxed italic">
              Kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, kanunen yetkili kamu kurumlarına, topluluk şirketlerimize ve hizmet alınan üçüncü taraf tedarikçilere (CRM sistemleri, sunucu altyapıları, SMS/e-posta sağlayıcıları) KVKK’nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir.
            </p>
          </section>

          <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem]">
            <h2 className="text-xl font-bold text-white mb-6 uppercase">4. İLGİLİ KİŞİNİN HAKLARI (MADDE 11)</h2>
            <div className="space-y-4">
              <p className="text-sm">Kişisel veri sahibi olarak KVKK’nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-xs list-decimal pl-6">
                <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
                <li>Hangi verilerin işlendiğine dair bilgi talep etme,</li>
                <li>İşlenme amacını ve buna uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme.</li>
              </ul>
              <p className="text-[11px] mt-6 bg-accent/10 p-4 border border-accent/20 rounded-xl">
                Başvurularınızı, "Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ" uyarınca yukarıdaki e-posta adresimize güvenli elektronik imza veya mobil imza ile iletebilirsiniz. Talebiniz en geç 30 gün içinde sonuçlandırılacaktır.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default KvkkPage;
