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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
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
        const { error: viewError } = await supabase.rpc('increment_view_count', { post_id: data.id });
        if (viewError) console.error('Error incrementing views:', viewError);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Bağlantı kopyalandı!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Yazı Bulunamadı</h1>
      <Link to="/blog" className="text-primary hover:underline">Blog listesine dön</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Featured Image Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img
          src={post.main_image || '/placeholder.svg'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto max-w-4xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary mb-6 group">
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Blog'a Dön
            </Link>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 font-heading leading-tight"
            >
              {post.title}
            </motion.h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {post.published_at ? format(new Date(post.published_at), 'dd MMMM yyyy', { locale: tr }) : 'Taslak'}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                5 dk okuma
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Randevu Dünyası Ekibi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 mt-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
              <div className="flex gap-2">
                {post.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={handleShare} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Paylaş">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Kaydet">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            <article className="prose prose-lg dark:prose-invert prose-primary max-w-none">
              <p className="text-xl text-muted-foreground italic mb-10 leading-relaxed">
                {post.excerpt}
              </p>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            {/* Author Footer */}
            <div className="mt-16 p-8 rounded-3xl bg-secondary/50 border border-border flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                RD
              </div>
              <div>
                <h4 className="font-bold text-lg">Randevu Dünyası Yazı Kurulu</h4>
                <p className="text-muted-foreground text-sm">
                  Güzellik, bakım ve stil dünyasındaki en güncel gelişmeleri sizin için takip ediyoruz.
                </p>
              </div>
            </div>
          </main>

          {/* Sidebar / Related */}
          <aside className="w-full md:w-80 space-y-8">
            <div className="p-6 rounded-3xl border border-border bg-card">
              <h3 className="font-bold mb-4 text-primary flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Bizi Takip Et
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Yeni içeriklerden ilk siz haberdar olmak için topluluğumuza katılın.
              </p>
              <button className="w-full py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-semibold">
                Abone Ol
              </button>
            </div>

            <div className="sticky top-24">
              <h3 className="font-bold mb-4 font-heading">İlginizi Çekebilir</h3>
              {/* This would ideally list other posts */}
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-video rounded-xl overflow-hidden mb-2 bg-secondary" />
                    <h5 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                      Modern Erkek Saç Kesimleri: 2024 Rehberi
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
