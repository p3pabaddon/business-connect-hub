import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BlogPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');

  const categories = ['Hepsi', 'Barber', 'Güzellik', 'Stil', 'Moda', 'Bakım'];

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) console.error('Error fetching posts:', error);
      else setPosts(data || []);
      setLoading(false);
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
      {/* Hero Section */}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Yaşam & Stil Dergisi
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tighter">
              Güzelliğin ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Stilin</span> Rotası
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Profesyonel tavsiyeler, sektörden tüyolar ve kişisel bakımın altın kuralları burada.
            </p>

            {/* Category Chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <input
                type="text"
                placeholder="İlham verici içerikler ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-white/10 backdrop-blur-xl text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredPost && selectedCategory === 'Hepsi' && !searchTerm && (
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-3xl"
          >
            <div className="relative h-[400px] lg:h-auto overflow-hidden">
              <img 
                src={featuredPost.main_image || '/placeholder.svg'} 
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 to-transparent lg:hidden" />
            </div>
            <div className="p-8 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-white/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold uppercase">Öne Çıkan</span>
                <span className="text-gray-500 text-xs">• 5 Dakika Okuma</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 group-hover:text-primary transition-colors leading-tight">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-gray-400 mb-8 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-4 text-white font-bold group/btn"
              >
                <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transition-transform group-hover/btn:scale-110">
                  <ArrowRight className="w-6 h-6" />
                </span>
                Yazının Tamamını Oku
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-bold">Son Yazılar</h3>
          <div className="h-px flex-1 bg-white/10 mx-8 hidden md:block" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[500px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {(selectedCategory === 'Hepsi' && !searchTerm ? remainingPosts : filteredPosts).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col h-full"
              >
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 border border-white/10 shadow-2xl">
                  <img
                    src={post.main_image || '/placeholder.svg'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="flex items-center gap-2 text-white text-sm font-bold">
                      Hemen Oku <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">
                  <span className="text-primary">{post.category || 'Genel'}</span>
                  <span>•</span>
                  <span>{post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: tr }) : 'Yeni'}</span>
                </div>

                <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>
                <p className="text-gray-400 text-base line-clamp-2 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs">
                      RD
                    </div>
                    <span className="text-xs font-bold text-gray-500">Editör</span>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">3 dk okuma</span>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Sparkles className="w-16 h-12 text-primary/20 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Burada Henüz Hikaye Yok</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-lg italic">
              Seçtiğiniz kategoride henüz bir yazı bulunmuyor. Keşfetmeye devam edin!
            </p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 p-12 lg:p-20 overflow-hidden text-center">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Modayı Yakından Takip Et</h3>
            <p className="text-xl text-gray-400 mb-10">
              En yeni trendler ve sana özel stil tüyoları haftalık olarak e-posta kutuna gelsin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
              />
              <button className="px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                Kayıt Ol
              </button>
            </div>
            <p className="mt-6 text-xs text-gray-500 italic">
              * Verileriniz KVKK kapsamında korunmaktadır. Dilediğiniz zaman ayrılabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
