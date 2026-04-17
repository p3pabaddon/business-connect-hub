
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env manually if node --env-file is not available or for older node versions
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    return acc;
  }, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
  {
    title: "2026 Berber Trendleri: Modern Klasiklerin Dönüşü",
    slug: "2026-berber-trendleri-modern-klasiklerin-donusu",
    category: "Barber",
    excerpt: "Bu yıl erkek saç modasında sadelik ve karakter ön planda. İşte 2026'nın en çok konuşulan saç kesimleri.",
    content: `
      <h2>Modern Klasiklerin Yükselişi</h2>
      <p>2026 yılı, erkek saç modasında bir köprü görevi görüyor. Geçmişin disiplinli kesimleri, günümüzün rahat ve doğal dokularıyla buluşuyor. İşte bu yılın öne çıkan başlıkları:</p>
      
      <h3>1. 'Natural Flow' Kesimi</h3>
      <p>Artık çok sert şekillendiriciler yerine, saçın doğal dalgasını ön plana çıkaran hafif waxlar ve deniz tuzu spreyleri moda. Saçlar daha uzun ama bir o kadar da kontrollü.</p>
      
      <h3>2. Modern Pompadour</h3>
      <p>50'lerin efsanevi Pompadour tarzı, 2026'da daha alçak yanlar (taper fade) ile modernize ediliyor. Otoriteyi ve stili aynı anda temsil eden bu kesim, iş dünyasında da büyük ilgi görüyor.</p>
      
      <h3>3. Dokulu Crop</h3>
      <p>Bakımı en kolay olan bu kesim, özellikle yoğun tempoda çalışan erkeklerin favorisi olmaya devam ediyor.</p>
      
      <blockquote>"Stil, sadece saçı kesmek değil, o saçın ruhunu yansıtabilmektir." - Master Barber</blockquote>
    `,
    main_image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: "Cilt Bakımında Yeni Nesil: Doğru Serum Kullanım Sırası",
    slug: "cilt-bakimi-serum-kullanim-sirasi",
    category: "Güzellik",
    excerpt: "Pahalı ürünler kullanmak yetmez, doğru sırayla uygulamak gerekir. Cildinizi ışıldatacak profesyonel rutin rehberi.",
    content: `
      <h2>Serumlar Neden Önemli?</h2>
      <p>Serumlar, cildin alt katmanlarına nüfuz eden yüksek konsantrasyonlu içeriklerdir. Ancak yanlış sıralama, ürünlerin etkisini sıfırlayabilir.</p>
      
      <h3>Temel Kural: İnceden Kalına</h3>
      <p>Ürünleri her zaman su bazlı olandan yağ bazlı olana doğru uygulamalısınız. İşte ideal sıralama:</p>
      
      <ol>
        <li><strong>Temizleme:</strong> Cildinizi kirden ve yağdan arındırın.</li>
        <li><strong>Tonik:</strong> pH dengesini sağlayın ve serum için zemin hazırlayın.</li>
        <li><strong>C Vitamini:</strong> Antioksidan etkisi için sabahları vazgeçilmezdir.</li>
        <li><strong>Hiyalüronik Asit:</strong> Nemi hapsetmek için hafif nemli cilde uygulayın.</li>
        <li><strong>Nemlendirici:</strong> Tüm serumları cilde kilitleyen bariyer görevi görür.</li>
      </ol>
      
      <p>Vitamin C ve Retinol gibi aktif içerikleri aynı anda kullanmamaya dikkat edin. Birini sabah, diğerini akşam rutininize dahil edin.</p>
    `,
    main_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200",
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: "Saç Ekimi Sonrası İlk 30 Gün: Nelere Dikkat Edilmeli?",
    slug: "sac-ekimi-sonrasi-ilk-30-gun-rehberi",
    category: "Bakım",
    excerpt: "Yeni saçlarınıza kavuşma sürecinde en kritik ay ilk 30 gündür. İşte iyileşmeyi hızlandıran ve kökleri koruyan tavsiyeler.",
    content: `
      <h2>Operasyon Bir Başlangıçtır</h2>
      <p>Saç ekimi başarısının %50'si operasyonun kalitesine, %50'si ise operasyon sonrası bakıma bağlıdır.</p>
      
      <h3>İlk 3 Gün: Altın Kural</h3>
      <p>Bu süreçte ekilen kökler henüz yerleşmemiştir. Başınızı çarpmaktan, sürtünmeden kesinlikle kaçınmalısınız. Hapşırırken ve ayakkabı bağlarken bile başınızı aşağı eğmemeye çalışın.</p>
      
      <h3>Yıkama Süreci</h3>
      <p>10. günden itibaren kabuklanmaların dökülmesi başlar. Size önerilen losyon ve şampuanı nazik, tampon hareketlerle kullanın. Sıcak su yerine mutlaka ılık su tercih edin.</p>
      
      <p>Spor, havuz ve doğrudan güneş ışığı için en az 1 ay beklemeniz gerektiğini unutmayın. Sabır, gür saçların en büyük yardımcısıdır.</p>
    `,
    main_image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200",
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: "Sakal Tasarımında Yüz Şekline Göre Altın Kurallar",
    slug: "yuz-sekline-gore-sakal-tasarimi",
    category: "Stil",
    excerpt: "Her sakal her yüze yakışmaz. Yüz hatlarınızı dengeleyecek ve sizi daha maskülen gösterecek sakal modelini bulun.",
    content: `
      <h2>Doğru Sakal, Doğru İfade</h2>
      <p>Sakal, erkek yüzünün makyajıdır. Doğru bir tasarım, zayıf bir çene hattını güçlü gösterebilir veya geniş bir yüzü daha ince yansıtabilir.</p>
      
      <h3>Yüz Şekline Göre Seçimler</h3>
      <p><strong>Oval Yüz:</strong> En şanslı gruptur. Hemen hemen her model yakışır. Konturları netleştirmeniz yeterli.</p>
      <p><strong>Kare Yüz:</strong> Yanları kısa tutarak çene bölgesini biraz daha uzun bırakın. Bu, yüzü daha ince ve uzun gösterir.</p>
      <p><strong>Yuvarlak Yüz:</strong> Çene hattında açılı bir kesim tercih ederek yüzünüze definisyon katın.</p>
      
      <p>Unutmayın, sakal boyun çizgisi her zaman adem elmasının iki parmak üzerinde bitmelidir. Daha aşağısı bakımsız bir görünüme neden olur.</p>
    `,
    main_image: "https://images.unsplash.com/photo-1599351431202-1e0f013f899a?auto=format&fit=crop&q=80&w=1200",
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: "Düğün Öncesi Güzellik Planlaması",
    slug: "dugun-oncesi-gelin-guzellik-rehberi",
    category: "Güzellik",
    excerpt: "Gelinler için 6 aylık kapsamlı güzellik ve bakım takvimi. En özel gününüzde kusursuz görünmenin sırları.",
    content: `
      <h2>Geri Sayım Başladı!</h2>
      <p>Kusursuz bir görünüm aceleye gelmez. İşte profesyonel düğün hazırlık takvimi:</p>
      
      <h3>6 Ay Kala: Altyapıyı Kurun</h3>
      <p>Lazer epilasyon seanslarına başlayın. Cilt problemleriniz varsa dermatolog eşliğinde tedaviye başlayın.</p>
      
      <h3>3 Ay Kala: Beslenme ve Saç</h3>
      <p>Saç modelinize karar verin ve saç bakımlarını yoğunlaştırın. Beslenme düzeninizde anti-enflamatuar besinlere yer verin.</p>
      
      <h3>1 Ay Kala: Denemeler</h3>
      <p>Makyaj ve saç provanızı mutlaka yapın. Gün ışığında ve yapay ışıkta nasıl göründüğünü test edin.</p>
      
      <p>Düğün haftası yeni bir ürün denemekten kaçının. Sadece nemlendirme ve uykuya odaklanın.</p>
    `,
    main_image: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?auto=format&fit=crop&q=80&w=1200",
    is_published: true,
    published_at: new Date().toISOString()
  }
];

async function seed() {
  console.log('🚀 İçerik tohumlama başlatılıyor...');
  
  for (const article of articles) {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(article, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Hata (${article.title}):`, error.message);
    } else {
      console.log(`✅ Başarılı: ${article.title}`);
    }
  }
  
  console.log('✨ Tüm içerikler başarıyla yüklendi.');
}

seed();
