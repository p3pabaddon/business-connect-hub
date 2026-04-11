import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ensure a profile row exists for the given user.
 * Called after login/signup to sync auth metadata → profiles table.
 */
export async function ensureProfile(user: User): Promise<Profile | null> {
  // Try to get existing profile
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  // Create profile from auth metadata
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || null,
      phone: user.user_metadata?.phone || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.warn("Profile sync failed (table may not exist yet):", error.message);
    return null;
  }
  return data as Profile;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
