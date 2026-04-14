import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profiles";
import { getMyBusiness } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isBusinessOwner: boolean;
  hasBusiness: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (currentUser?: User | null) => {
    const activeUser = currentUser !== undefined ? currentUser : user;
    
    if (!activeUser) {
      setProfile(null);
      setHasBusiness(false);
      return;
    }

    try {
      const p = await ensureProfile(activeUser);
      setProfile(p as Profile);
      
      // Pass the ID directly to avoid session fetch inside getMyBusiness
      const biz = await getMyBusiness(activeUser.id);
      setHasBusiness(!!biz);
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authInitialized = false;

    async function handleAuthChange(session: Session | null) {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      
      // If we already initialized with this exact user ID, skip
      if (authInitialized && user?.id === currentUser?.id) {
        setLoading(false);
        return;
      }
      
      authInitialized = true;
      setSession(session);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Add a small timeout to refreshProfile to catch any hanging queries
          const refreshTask = refreshProfile(currentUser);
          const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
          
          await Promise.race([refreshTask, timeoutTask]);
        } catch (err) {
          console.error("Auth initialization timed out or failed:", err);
        }
      } else {
        setProfile(null);
        setHasBusiness(false);
      }
      
      if (mounted) setLoading(false);
    }

    // Single source of truth for initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    }).catch(err => {
      console.error("Initial session fetch failed:", err);
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.id]); // Add user?.id to dependencies to ensure handleAuthChange sees latest user state

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setHasBusiness(false);
  };

  const isAdmin = !!profile && (profile.role === "admin" || profile.role === "hq_staff" || profile.role === "super_admin");
  const isBusinessOwner = !!profile && (profile.role === "business_owner" || profile.role === "admin" || hasBusiness);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Oturum Kontrol Ediliyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      isAdmin, 
      isBusinessOwner, 
      hasBusiness, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut,
      refreshProfile: () => refreshProfile()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
