import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { SEOHead } from '@/components/SEOHead';

const BlogPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');

  const categories = ['Hepsi', 'Barber', 'Güzellik', 'Stil', 'Moda', 'Bakım'];

  // High-quality fallback content for a premium empty state
  const fallbackPosts = [
    {
      id: 'f1',
      title: "2026 Berber Trendleri: Modern Klasiklerin Dönüşü",
      slug: "2026-berber-trendleri-modern-klasiklerin-donusu",
      category: "Barber",
      excerpt: "Bu yıl erkek saç modasında sadelik ve karakter ön planda. İşte 2026'nın en çok konuşulan saç kesimleri ve stil tüyoları.",
      main_image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '5 dk'
    },
    {
      id: 'f2',
      title: "Cilt Bakımında Yeni Nesil: Doğru Serum Kullanım Sırası",
      slug: "cilt-bakimi-serum-kullanim-sirasi",
      category: "Güzellik",
      excerpt: "Pahalı ürünler kullanmak yetmez, doğru sırayla uygulamak gerekir. Cildinizi ışıldatacak profesyonel rutin rehberi.",
      main_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '4 dk'
    },
    {
      id: 'f3',
      title: "Sakal Tasarımında Yüz Şekline Göre Altın Kurallar",
      slug: "yuz-sekline-gore-sakal-tasarimi",
      category: "Stil",
      excerpt: "Her sakal her yüze yakışmaz. Yüz hatlarınızı dengeleyecek ve sizi daha maskülen gösterecek sakal modelini bulun.",
      main_image: "https://images.unsplash.com/photo-1599351431202-1e0f013f899a?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '6 dk'
    },
    {
      id: 'f4',
      title: "Minimalist Güzellik: Az Ama Öz Ürünle Işıldayın",
      slug: "minimalist-guzellik-rehberi",
      category: "Bakım",
      excerpt: "Karmaşık rutinler yerine sadeleşin. İhtiyacınız olan sadece 3 temel ürünle maksimum verim almanın yollarını açıklıyoruz.",
      main_image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '3 dk'
    },
    {
      id: 'f5',
      title: "Master Barber Olmanın Sırları: Teknikten Sanata Yolculuk",
      slug: "master-barber-olmanin-sirlari",
      category: "Barber",
      excerpt: "Sadece makas tutmak yetmez, bir vizyon inşa etmelisiniz. Dünyaca ünlü berberlerden kariyer tavsiyeleri.",
      main_image: "https://images.unsplash.com/photo-1512690196236-d4f13470764b?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '8 dk'
    },
    {
      id: 'f6',
      title: "Parfüm Seçiminde Mevsimlerin Etkisi",
      slug: "mevsime-gore-parfum-secimi",
      category: "Moda",
      excerpt: "Hangi koku hangi havada daha iyi yayılır? Kışın baharatlı, yazın ferah notalar seçmenin bilimsel nedenleri.",
      main_image: "https://images.unsplash.com/photo-1541604193435-22287d32c2c2?auto=format&fit=crop&q=80&w=1200",
      published_at: new Date().toISOString(),
      read_time: '5 dk'
    }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          setPosts(fallbackPosts);
        } else {
          setPosts(data && data.length > 0 ? data : fallbackPosts);
        }
      } catch (err) {
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Hepsi' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SEOHead 
        title="Yaşam & Stil Dergisi | Güzellik ve Bakım Üzerine Profesyonel Tavsiyeler"
        description="Berber bakımı, stil tüyoları ve güzellik sektörü hakkında en güncel yazılar. Randevu Dünyası Blog ile tarzını bir adım öne taşı."
        type="website"
      />
      {/* Hero Section with Parallax Effect */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 fill-primary" />
              Yaşam & Stil Dergisi
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              KENDİNİ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">YENİDEN</span> KEŞFET
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium italic">
              "Stil, konuşmadan kim olduğunuzu anlatmanın bir yoludur."
            </p>

            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                <input
                  type="text"
                  placeholder="İlham verici içerikler ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-white/10 backdrop-blur-2xl text-lg shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Magazine Content Layout */}
      <div className="container mx-auto px-4 lg:flex gap-12 pb-32">
        {/* Main Content Area */}
        <div className="flex-1 space-y-20">
          
          {/* Featured Post - Large Format */}
          {featuredPost && (
            <section>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative rounded-[3rem] overflow-hidden bg-white/5 border border-white/10 shadow-3xl"
              >
                <div className="aspect-[21/9] w-full relative overflow-hidden">
                  <img 
                    src={featuredPost.main_image || '/placeholder.svg'} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 lg:p-16 w-full">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">GÜNÜN YAZISI</span>
                      <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{featuredPost.category}</span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black mb-8 group-hover:text-primary transition-colors leading-[1.1] max-w-3xl">
                      {featuredPost.title}
                    </h2>
                    <div className="flex items-center gap-8">
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-primary hover:text-white transition-all duration-500 overflow-hidden relative group/btn"
                      >
                        OKUMAYA BAŞLA
                        <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" />
                      </Link>
                      <div className="hidden sm:flex items-center gap-4 text-white/40 text-sm font-bold">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.published_at ? format(new Date(featuredPost.published_at), 'dd MMMM yyyy', { locale: tr }) : 'YENİ'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* Grid Layout for Other Posts */}
          <section>
            <div className="flex items-center justify-between mb-16 px-4">
              <h3 className="text-4xl font-black italic tracking-tighter">KEŞFETMELİSİN</h3>
              <div className="flex gap-4">
                {categories.slice(0, 4).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${selectedCategory === cat ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {remainingPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 border border-white/5">
                    <img
                      src={post.main_image || '/placeholder.svg'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  <h4 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h4>
                  <p className="text-gray-400 text-lg mb-8 line-clamp-2 font-medium">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-[10px] font-bold">RD</div>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">EDİTÖR</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{post.read_time || '4 dk'}</p>
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors group/arr">
                      <ArrowRight className="w-5 h-5 text-white group-hover/arr:scale-125 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Trending & Newsletter */}
        <aside className="lg:w-[400px] mt-20 lg:mt-0 space-y-12">
          {/* Newsletter Box */}
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-primary to-accent relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h4 className="text-3xl font-black mb-4 leading-none">STRATEJİYİ <br />YAKALA</h4>
              <p className="text-black/80 text-sm font-bold mb-8 leading-relaxed">
                Haftalık stil raporları ve özel fırsatlar için bültene katıl.
              </p>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="E-posta adresi"
                  className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/20 placeholder:text-black/40 text-black font-bold focus:outline-none placeholder:font-bold"
                />
                <button className="w-full py-4 rounded-xl bg-black text-white font-black hover:bg-white hover:text-black transition-all">
                  ABONE OL
                </button>
              </div>
            </div>
          </div>

          {/* Trending Section */}
          <div className="space-y-8">
            <h4 className="text-xl font-black italic tracking-tighter border-l-4 border-primary pl-4 uppercase">TREND KONULAR</h4>
            <div className="flex flex-wrap gap-2">
              {['#SkinCare', '#FadeCut', '#Style2026', '#LuxuryLife', '#ModernGrooming', '#BioHackingStyle'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-primary transition-colors cursor-pointer text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Most Read Sidebar */}
          <div className="space-y-8">
            <h4 className="text-xl font-black italic tracking-tighter border-l-4 border-primary pl-4 uppercase">EN ÇOK OKUNANLAR</h4>
            <div className="space-y-8">
              {fallbackPosts.slice(0, 3).map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-6 group">
                  <div className="text-4xl font-black text-white/5 group-hover:text-primary/20 transition-colors">0{i+1}</div>
                  <div>
                    <h5 className="font-black text-sm leading-tight group-hover:text-primary transition-colors mb-2 uppercase italic tracking-tighter">
                      {post.title}
                    </h5>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>5 DK</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Modern Horizontal Marquee */}
      <div className="bg-primary py-4 overflow-hidden border-y border-black/10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-black font-black text-2xl tracking-tighter uppercase italic">
                STİL • GÜZELLİK • TEKNOLOJİ • OTORİTE • TREND • 
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
