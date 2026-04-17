import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Calendar, User, ChevronLeft, Share2, Bookmark, Clock, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // High-quality fallback content for a premium empty state
  const fallbackPosts = [
    {
      id: 'f1',
      title: "2026 Berber Trendleri: Modern Klasiklerin Dönüşü",
      slug: "2026-berber-trendleri-modern-klasiklerin-donusu",
      category: "Barber",
      excerpt: "Bu yıl erkek saç modasında sadelik ve karakter ön planda. İşte 2026'nın en çok konuşulan saç kesimleri ve stil tüyoları.",
      content: `
        <h2>Modern Klasiklerin Yükselişi</h2>
        <p>2026 yılı, erkek saç modasında bir köprü görevi görüyor. Geçmişin disiplinli kesimleri, günümüzün rahat ve doğal dokularıyla buluşuyor. İşte bu yılın öne çıkan başlıkları:</p>
        
        <h3>1. 'Natural Flow' Kesimi</h3>
        <p>Artık çok sert şekillendiriciler yerine, saçın doğal dalgasını ön plana çıkaran hafif waxlar ve deniz tuzu spreyleri moda. Saçlar daha uzun ama bir o kadar da kontrollü.</p>
        
        <h3>2. Modern Pompadour</h3>
        <p>50'lerin efsanevi Pompadour tarzı, 2026'da daha alçak yanlar (taper fade) ile modernize ediliyor. Otoriteyi ve stili aynı anda temsil eden bu kesim, iş dünyasında da büyük ilgi görüyor.</p>
        
        <h3>3. Dokulu Crop</h3>
        <p>Bakımı en kolay olan bu kesim, özellikle yoğun tempoda çalışan erkeklerin favorisi olmaya devam ediyor. Dokulu üst kısımlar, yüze hem karakter hem de modern bir hava katıyor.</p>
        
        <blockquote>"Stil, sadece saçı kesmek değil, o saçın ruhunu yansıtabilmektir." - Master Barber</blockquote>

        <p>Kendi stilinizi keşfetmek için uzman bir barberdan randevu almayı unutmayın. Doğru kesim, özgüvenin anahtarıdır.</p>
      `,
      main_image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString()
    },
    {
      id: 'f2',
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
        
        <p>Vitamin C ve Retinol gibi aktif içerikleri aynı anda kullanmamaya dikkat edin. Birini sabah, diğerini akşam rutininize dahil edin. Cildinizin tepkilerini izleyin ve rutininizi buna göre şekillendirin.</p>
      `,
      main_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString()
    },
    {
      id: 'f3',
      title: "Sakal Tasarımında Yüz Şekline Göre Altın Kurallar",
      slug: "yuz-sekline-gore-sakal-tasarimi",
      category: "Stil",
      excerpt: "Her sakal her yüze yakışmaz. Yüz hatlarınızı dengeleyecek ve sizi daha maskülen gösterecek sakal modelini bulun.",
      content: `
        <h2>Doğru Sakal, Doğru İfade</h2>
        <p>Sakal, erkek yüzünün makyajıdır. Doğru bir tasarım, zayıf bir çene hattını güçlü gösterebilir veya geniş bir yüzü daha ince yansıtabilir.</p>
        
        <h3>Yüz Şekline Göre Seçimler</h3>
        <p><strong>Oval Yüz:</strong> En şanslı gruptur. Hemen hemen her model yakışır. Konturları netleştirmeniz yeterli olacaktır.</p>
        <p><strong>Kare Yüz:</strong> Yanları kısa tutarak çene bölgesini biraz daha uzun bırakın. Bu, yüzü daha ince ve uzun gösterir.</p>
        <p><strong>Yuvarlak Yüz:</strong> Çene hattında açılı bir kesim tercih ederek yüzünüze definisyon katın. Yuvarlaklığı kırmak için köşeli hatlar oluşturun.</p>
        
        <p>Unutmayın, sakal boyun çizgisi her zaman adem elmasının iki parmak üzerinde bitmelidir. Daha aşağısı bakımsız bir görünüme neden olur. Profesyonel bir sakal bakımı için bizi her zaman ziyaret edebilirsiniz.</p>
      `,
      main_image: "https://images.unsplash.com/photo-1599351431202-1e0f013f899a?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          const fallback = fallbackPosts.find(p => p.slug === slug);
          if (fallback) setPost(fallback);
          else console.error('Error fetching post:', error);
        } else {
          setPost(data);
        }
      } catch (err) {
        const fallback = fallbackPosts.find(p => p.slug === slug);
        if (fallback) setPost(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
        <Sparkles className="w-16 h-16 text-primary/20 mb-8" />
        <h2 className="text-4xl font-black mb-8 italic tracking-tighter uppercase">YAZI BULUNAMADI</h2>
        <Link to="/blog" className="px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-white hover:text-black transition-all">
          DERGİYE DÖN
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <SEOHead 
        title={`${post.title} | Randevu Dünyası Dergi`}
        description={post.excerpt}
        image={post.main_image || ''}
        type="article"
      />
      
      {/* Article Hero */}
      <header className="relative h-[75vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={post.main_image || '/placeholder.svg'} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:pb-24">
          <div className="container mx-auto">
            <Link 
              to="/blog" 
              className="group inline-flex items-center gap-3 text-white/60 hover:text-primary transition-all mb-12 font-black text-xs tracking-widest uppercase bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> 
              Dergimize Dön
            </Link>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest">{post.category}</span>
              <div className="h-px w-12 bg-white/20" />
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest font-mono">
                {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: tr }) : 'YENİ'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-[ -0.05em] max-w-5xl mb-12 uppercase italic">
              {post.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Article Content Layout */}
      <div className="container mx-auto px-4 py-32 lg:flex gap-20">
        <div className="flex-1 max-w-4xl">
          {/* Excerpt Lead */}
          <p className="text-2xl md:text-4xl text-gray-400 font-medium leading-[1.3] mb-20 italic font-serif border-l-8 border-primary pl-10 py-4 mb-24">
            {post.excerpt}
          </p>

          <div 
            className="prose prose-invert prose-2xl max-w-none 
              prose-headings:font-black prose-headings:tracking-[-0.03em] prose-headings:italic
              prose-h2:text-5xl prose-h2:mb-12 prose-h2:mt-24 prose-h2:text-primary prose-h2:uppercase
              prose-h3:text-3xl prose-h3:mb-8 prose-h3:mt-16 prose-h3:text-white
              prose-p:text-gray-400 prose-p:leading-[1.8] prose-p:mb-12 prose-p:font-medium
              prose-blockquote:border-none prose-blockquote:bg-white/5 prose-blockquote:p-12 prose-blockquote:rounded-[3rem] prose-blockquote:italic prose-blockquote:text-3xl prose-blockquote:font-black prose-blockquote:text-white prose-blockquote:relative
              prose-li:text-gray-400 prose-li:mb-4 prose-strong:text-white prose-strong:font-black
              prose-ol:space-y-6 prose-ul:space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          <div className="mt-32 pt-16 border-t border-white/10 flex items-center justify-between flex-wrap gap-8">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">BU OTORİTEYİ PAYLAŞ</h4>
              <div className="flex gap-4">
                {[Share2, Bookmark, Sparkles].map((Icon, i) => (
                  <div key={i} className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-500 cursor-pointer group">
                    <Icon className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex-1 min-w-[300px]">
              <h5 className="text-primary font-black text-xs uppercase tracking-widest mb-4">EDİTÖR NOTU</h5>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Bu içerik profesyonel deneyimler ve güncel trendler ışığında hazırlanmıştır. Kişisel bakım tavsiyeleri için her zaman bir uzmana danışmanız önerilir.
              </p>
            </div>
          </div>
        </div>

        {/* Article Sidebar */}
        <aside className="lg:w-[400px] mt-20 lg:mt-0 space-y-16">
          <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 sticky top-32 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-6 mb-10 pb-10 border-b border-white/5">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1.5 shadow-2xl shadow-primary/20">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-3xl font-black tracking-tighter italic">RD</div>
              </div>
              <div>
                <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">EDİTÖRYAL OTORİTE</p>
                <h4 className="font-black text-3xl italic tracking-tighter">RD EKİBİ</h4>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-bold leading-loose mb-10 text-center uppercase tracking-wider">
              GÜZELLİK, BAKIM VE STİL DÜNYASINDAKİ EN PRESTİJLİ GELİŞMELERİ SİZİN İÇİN DERLİYORUZ.
            </p>
            <button className="w-full py-5 rounded-2xl bg-white text-black font-black hover:bg-primary hover:text-white transition-all text-xs tracking-[0.2em] shadow-xl hover:shadow-primary/30">
              ABONE OL
            </button>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-black italic tracking-tighter border-l-4 border-primary pl-4 uppercase">DİĞER YAZILARIMIZ</h4>
            <div className="space-y-10">
              {fallbackPosts.filter(p => p.slug !== slug).map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="block group">
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 border border-white/10">
                    <img 
                      src={p.main_image} 
                      alt={p.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <h5 className="font-black text-lg leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter mb-2">{p.title}</h5>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <span>{p.category}</span>
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    <span>5 DK</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};

export default BlogPostPage;
