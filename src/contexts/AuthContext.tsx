import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profiles";
import { getMyBusiness } from "@/lib/api";
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

const ADMIN_EMAILS = [
  "asrinaltan04@gmail.com", 
  "asrinaltan1990@gmail.com", 
  "admin@randevual.com",
  "admin@admin.com", 
  "testadmin@rendezvous.com", 
  "info@randevudunyasi.com"
];


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setHasBusiness(false);
      return;
    }

    try {
      const p = await ensureProfile(user);
      setProfile(p as Profile);
      
      const biz = await getMyBusiness();
      setHasBusiness(!!biz);
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth State Changed:", _event, session?.user?.email);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      try {
        if (currentUser) {
          await refreshProfile();
        } else {
          setProfile(null);
          setHasBusiness(false);
        }
      } catch (err) {
        console.error("Auth listener error:", err);
      } finally {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial Session Fetch:", session?.user?.email);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      try {
        if (currentUser) {
          await refreshProfile();
        }
      } catch (err) {
        console.error("Get session error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    setProfile(null);
    setHasBusiness(false);
  };

  const isAdmin = !!user && (ADMIN_EMAILS.includes(user.email || "") || profile?.role === "admin" || profile?.role === "hq_staff");
  const isBusinessOwner = !!user && (hasBusiness || profile?.role === "business_owner" || isAdmin);


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
      refreshProfile
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
