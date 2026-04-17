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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/global_texture.png')] opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-6 inline-block border border-primary/30">
              Güzellik & Stil Rehberi
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
              Stilinize Değer Katan <span className="text-gradient">Hikayeler</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              En yeni trendler, uzman tavsiyeleri ve sana en yakın dükkanlardan özel haberler.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="İçeriklerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col h-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-500"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.main_image || '/placeholder.svg'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                      {post.category || 'Genel'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: tr }) : 'Taslak'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Yazar
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 font-heading group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                    {post.excerpt || 'Özet bulunmuyor.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary text-sm font-semibold group/link"
                    >
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">İçerik Bulunamadı</h3>
            <p className="text-muted-foreground">Aradığınız kriterlere uygun yazı bulunmuyor.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPage;
