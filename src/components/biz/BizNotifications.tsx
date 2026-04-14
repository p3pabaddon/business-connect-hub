import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, CheckCircle2, Circle, Trash2, Loader2, Info, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function BizNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription for notifications
    const channel = supabase
      .channel(`user-notifications-${user?.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error("Bildirim güncellenemedi.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("Tüm bildirimler okundu işaretlendi.");
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Bildirim silindi.");
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Bell className="w-5 h-5 text-emerald-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-violet-500" />;
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Bildirimler yükleniyor...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight italic">BİLDİRİM GEÇMİŞİ</h2>
          <p className="text-muted-foreground text-sm font-medium">Tüm randevu ve sistem mesajlarını buradan takip edebilirsin.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-xl font-bold uppercase text-[10px]">
            TÜMÜNÜ OKUNDU İŞARETLE
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <div className="bg-card border border-border p-12 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-1">Henüz bildirim yok</h3>
            <p className="text-muted-foreground text-sm">Yeni bir aktivite olduğunda burada görünecektir.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`group relative p-5 rounded-3xl border transition-all duration-300 ${
                notif.is_read 
                ? "bg-card/30 border-border/50 opacity-80" 
                : "bg-card border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/10"
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${
                   notif.is_read ? 'bg-muted/50 border-border/50' : 'bg-primary/10 border-primary/20'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-black uppercase tracking-tight ${notif.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {format(new Date(notif.created_at), "d MMMM yyyy HH:mm", { locale: tr })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-emerald-500"
                      title="Okundu işaretle"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-500 opacity-0 group-hover:opacity-100"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
