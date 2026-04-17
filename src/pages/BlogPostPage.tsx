import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Calendar, User, ChevronLeft, Share2, Bookmark, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;
      const progress = (scrollY / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data);
        // Increment view count
        await supabase.rpc('increment_view_count', { post_id: data.id });
        
        // Fetch related posts from same category
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);
        
        setRelatedPosts(related || []);
      }
      setLoading(false);
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Bağlantı kopyalandı! Arkadaşlarınla paylaşabilirsin.');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] text-white">
      <h1 className="text-4xl font-bold mb-4">Yazı Bulunamadı</h1>
      <Link to="/blog" className="px-6 py-3 bg-primary rounded-xl font-bold">Blog'a Geri Dön</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Header */}
      <header className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          src={post.main_image || '/placeholder.svg'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute bottom-0 left-0 w-full pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start"
            >
              <Link to="/blog" className="flex items-center gap-2 text-primary font-bold mb-8 group bg-primary/10 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-primary/20 transition-all">
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Dergimize Dön
              </Link>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                {post.category || 'Genel'}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tighter max-w-4xl">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 text-white/60 text-sm font-medium">
                <span className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  Randevu Dünyası Editoryal
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.published_at ? format(new Date(post.published_at), 'dd MMMM yyyy', { locale: tr }) : 'Yeni'}
                </span>
                <span className="flex items-center gap-2 underline decoration-primary/50 underline-offset-4">
                  <Clock className="w-4 h-4" />
                  4 Dakika Okuma
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-20">
          {/* Main Content Area */}
          <main>
            {/* Share Buttons - Floating on small, fixed on large */}
            <div className="flex lg:flex-col lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 gap-4 mb-12 lg:mb-0">
              <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>

            {/* Excerpt */}
            <p className="text-2xl md:text-3xl text-gray-300 font-medium leading-relaxed mb-16 italic border-l-4 border-primary pl-8 py-2">
              {post.excerpt}
            </p>

            {/* Content Body */}
            <div className="prose prose-invert prose-primary prose-lg md:prose-xl max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight 
              prose-p:text-gray-400 prose-p:leading-loose
              prose-img:rounded-[2.5rem] prose-img:shadow-2xl
              prose-strong:text-white prose-a:text-primary transition-all">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Bottom Meta */}
            <div className="mt-20 pt-12 border-t border-white/10 flex flex-wrap gap-4">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-primary transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-12">
            <div>
              <h3 className="text-xl font-bold mb-8 pb-4 border-b border-white/10">Buna Da Bakın</h3>
              <div className="space-y-8">
                {relatedPosts.map(rel => (
                  <Link key={rel.id} to={`/blog/${rel.slug}`} className="group block">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/10">
                      <img 
                        src={rel.main_image || '/placeholder.svg'} 
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
                {relatedPosts.length === 0 && (
                  <p className="text-sm text-gray-500 italic">İlgili başka yazı bulunamadı.</p>
                )}
              </div>
            </div>

            <div className="sticky top-20">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-white/10">
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Abone Ol</h3>
                <p className="text-sm text-gray-400 mb-6">En yeni trendler ve sana özel stil tüyoları e-postana gelsin.</p>
                <input 
                  type="email" 
                  placeholder="E-posta"
                  className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 mb-4 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                  Kaydol
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
